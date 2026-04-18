# Dependency Upgrade Guide

Target: bring `replicate-flux-mcp` up to the current MCP TypeScript SDK and
related peers. This is a single document that covers what changed, why we care,
and the exact edits required in this repo.

## 1. Version matrix

| Package                      | Current (`package.json`) | Latest stable | Recommended |
| ---------------------------- | ------------------------ | ------------- | ----------- |
| `@modelcontextprotocol/sdk`  | `^1.7.0`                 | `1.29.0`      | `^1.29.0`   |
| `replicate`                  | `^1.0.1`                 | `1.4.0`       | `^1.4.0`    |
| `zod`                        | `^3.24.2`                | `3.25.x` / `4.3.6` | `^3.25.0` (stay on v3) **or** `^4.0.0` (opt-in) |
| `@types/node`                | `^22.13.10`              | `22.x`        | `^22.13.10` (no action) |
| `typescript`                 | `^5.8.2`                 | `5.x`         | `^5.8.2` (no action) |

The MCP SDK now treats `zod` as a **required peer dependency** and internally
imports from `zod/v4`. For zod v3 users it requires `>= 3.25.0`. Our current
`^3.24.2` is below that floor and must be bumped.

An `@modelcontextprotocol/server@2.0.0-alpha` line also exists on npm. It is
**pre-release** and split into multiple packages (`@modelcontextprotocol/node`,
`@modelcontextprotocol/server`, etc.). Do not adopt for this project yet —
stay on the v1.x line.

## 2. What actually changed between 1.7.0 and 1.29.0

Only the items that touch this codebase are listed. Full notes:
<https://github.com/modelcontextprotocol/typescript-sdk/releases>.

### 2.1 `server.tool(...)` and `server.resource(...)` are deprecated

- `1.10.0` introduced `registerTool` / `registerResource` / `registerPrompt` on
  `McpServer` (the variadic `tool()` / `resource()` overloads were kept).
- `1.21.1` added `@deprecated` JSDoc markers to the legacy variadic methods.
- `1.22.0` and `1.24.0` refined `registerTool` typings; `registerTool` now
  accepts either a `ZodRawShape` (plain object map of zod fields) **or** a
  `z.object(...)` schema for `inputSchema` / `outputSchema`.
- `1.24.0` brings the SDK up to the `2025-11-25` spec and fixes the typed
  `ToolCallback` inference.

What this means here: every `server.tool(name, desc, schema, handler)` and
every `server.resource(name, template, handler)` call will keep compiling and
working, but they are flagged deprecated by the IDE. We migrate to the new
registration API.

### 2.2 Zod peer dependency

- `1.23.0` added Zod v4 support with a v3.25+ compatibility shim
  (PR modelcontextprotocol/typescript-sdk#1040).
- `1.23.0` and later expect `zod >= 3.25.0`. Older v3 installs trigger
  runtime/typing issues in `registerTool` descriptor extraction.
- Zod v4 is optional here: our schemas use only primitives / enums / arrays /
  default / describe / min / max / int — all of those migrate cleanly, so we
  can jump straight to v4 if we want. See §5.

### 2.3 Other SDK changes worth knowing (no code changes required)

- `1.10.0`: Streamable HTTP transport added; our stdio usage is untouched.
- `1.14.0`: elicitation `reject` → `decline` (we don't use elicitation).
- `1.24.0`: experimental Tasks (SEP-1686), longer-running tool support. Our
  existing `pollForCompletion` stays as-is; we can revisit later.
- `1.26.0`: security fix — sharing server/transport across clients could leak
  responses. We create one server + one transport, so no change needed, but
  the upgrade itself delivers the fix.
- `1.29.0`: adds `size` on `ResourceSchema`, optional extensions in capability
  objects, Windows `stdio` hardening.

### 2.4 `replicate` 1.0.1 → 1.4.0

Nothing we use changed in a breaking way.

- `1.0.0` (already adopted): `replicate.run()` returns `FileOutput`, and we
  already call `output.url()` and `output.blob()` — no change required.
- `1.1.0`: all methods accept `AbortSignal`. Optional improvement.
- `1.2.0` – `1.3.1`: type refreshes against the current OpenAPI schema.
- `1.4.0`: `replicate.stream()` bugfix + `useFileOutput: false` option. We
  don't use `stream()` today.

## 3. `package.json` change

```diff
   "dependencies": {
-    "@modelcontextprotocol/sdk": "^1.7.0",
-    "replicate": "^1.0.1",
-    "zod": "^3.24.2"
+    "@modelcontextprotocol/sdk": "^1.29.0",
+    "replicate": "^1.4.0",
+    "zod": "^3.25.0"
   },
```

Then:

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 4. Code changes

The schemas themselves (`src/types/index.ts`) do **not** need to change —
`registerTool` accepts the same `ZodRawShape` object we already export.
Only the registration sites change. Apply the patches below.

### 4.1 `src/tools/index.ts` — switch to `registerTool`

Replace every `server.tool(name, description, schema, handler)` call with
`server.registerTool(name, config, handler)` where `config` holds
`description` and `inputSchema`:

```diff
-  server.tool(
-    "generate_image",
-    "Generate an image from a text prompt using Flux Schnell model",
-    imageGenerationSchema,
-    registerGenerateImageTool
-  );
+  server.registerTool(
+    "generate_image",
+    {
+      description:
+        "Generate an image from a text prompt using Flux Schnell model",
+      inputSchema: imageGenerationSchema,
+    },
+    registerGenerateImageTool
+  );
```

Apply the same transformation to all seven tools:
`generate_image`, `generate_multiple_images`, `generate_image_variants`,
`generate_svg`, `get_prediction`, `create_prediction`, `prediction_list`.

Optional polish while touching each site:

- add a `title` field with a human-readable name (shown in MCP Inspector and
  Claude Desktop tool pickers).
- add `annotations: { readOnlyHint: true }` to `get_prediction` and
  `prediction_list` since they don't mutate remote state.

Example with both:

```typescript
server.registerTool(
  "get_prediction",
  {
    title: "Get Prediction",
    description: "Get details of a specific prediction by ID",
    inputSchema: getPredictionSchema,
    annotations: { readOnlyHint: true, idempotentHint: true },
  },
  registerGetPredictionTool
);
```

### 4.2 `src/resources/*.ts` — switch to `registerResource`

The `registerResource` signature for templated resources is:

```typescript
server.registerResource(
  name: string,
  template: ResourceTemplate,
  config: ResourceMetadata, // { title?, description?, mimeType?, ... }
  readCallback
)
```

Previously we called `server.resource(name, template, readCallback)` and wired
the `list` callback into the `ResourceTemplate` constructor. That pattern
still works, but we also surface `title` / `description` / `mimeType` via the
new `config` arg, which clients render nicely.

#### `src/resources/imageList.ts`

```diff
-  server.resource(
+  server.registerResource(
     "images",
     new ResourceTemplate("images://{id}", {
       list,
     }),
+    {
+      title: "Generated images",
+      description:
+        "History of images generated with the Flux Schnell model on Replicate",
+      mimeType: "image/png",
+    },
     async (uri, { id }) => {
       // ... unchanged body
     }
   );
```

#### `src/resources/predictionList.ts`

```diff
-  server.resource(
+  server.registerResource(
     "predictions",
     new ResourceTemplate("predictions://{id}", {
       list,
     }),
+    {
+      title: "Recent predictions",
+      description: "History of Replicate predictions for this account",
+      mimeType: "application/json",
+    },
     async (uri, { id }) => {
       // ... unchanged body
     }
   );
```

#### `src/resources/svgList.ts`

```diff
-  server.resource(
+  server.registerResource(
     "svglist",
     new ResourceTemplate("svglist://{id}", {
       list,
     }),
+    {
+      title: "Generated SVGs",
+      description:
+        "History of SVGs generated with the Recraft V3 SVG model on Replicate",
+      mimeType: "image/svg+xml",
+    },
     async (uri, { id }) => {
       // ... unchanged body
     }
   );
```

The `ListResourcesCallback` / `ResourceTemplate` imports stay the same —
both are still exported from `@modelcontextprotocol/sdk/server/mcp.js` in
1.29.0.

### 4.3 `src/server/index.ts` — leave untouched

`new McpServer({ name, version }, { capabilities, instructions })` and
`StdioServerTransport` are unchanged.

Optional hygiene: `capabilities.resources` and `capabilities.tools` are now
auto-declared when you call `registerTool` / `registerResource`, so the
explicit `{ capabilities: { resources: {}, tools: {} } }` block can be
dropped. Keeping it is harmless and documents intent — up to you.

### 4.4 `src/config/index.ts` — bump `serverVersion`

```diff
-  serverVersion: "0.1.2",
+  serverVersion: "0.2.0",
```

Mirror the same bump in `package.json` (`"version": "0.2.0"`), since this
release ships a dependency upgrade.

### 4.5 `handleError` — keep as-is

`McpError` and `ErrorCode` still live at
`@modelcontextprotocol/sdk/types.js`. No change required.

The alternative pattern recommended by the new docs is returning
`{ content: [...], isError: true }` from the tool instead of throwing. That
is a larger refactor and out of scope for this upgrade.

## 5. Optional: move to Zod v4

If you want to jump to `zod@^4.0.0` at the same time:

```diff
-    "zod": "^3.24.2"
+    "zod": "^4.0.0"
```

Import changes in this repo: none. The schemas in `src/types/index.ts` use
only the intersection of v3 and v4 APIs (`z.string`, `z.number`, `z.enum`,
`z.array`, `z.object`, `.min`, `.max`, `.int`, `.default`, `.describe`,
`.optional`, `z.infer`). Each of those has identical behavior in v4.

Caveats to verify after switching:

- Zod v4 made a few error messages stricter; the SDK internally uses
  `zod/v4` already so argument validation behavior from the client's point of
  view does not change.
- If you ever add `z.record()`, `z.function()`, `z.preprocess()`, or custom
  `refine`/`transform`, consult the Zod v4 migration guide — those APIs
  changed shape.

Recommendation: ship §3 and §4 first (SDK upgrade + registration API), then
do Zod v4 as a follow-up so the two concerns are bisectable.

## 6. Verification

Before and after the upgrade, confirm:

```bash
npm run build                    # tsc must pass with no new errors
node build/index.js              # starts and prints "replicate-flux-mcp v0.2.0 running on stdio"
npm run inspector                # opens MCP Inspector against the built server
```

In the MCP Inspector, verify:

1. All seven tools list with description and correct input schema.
2. Calling `generate_image` with a trivial prompt returns both the URL text
   block and the inline `image` block.
3. The `images`, `svglist`, and `predictions` resource lists populate and an
   individual resource reads correctly.

## 7. Rollout checklist

- [ ] Bump the three dependency versions in `package.json`.
- [ ] Regenerate `package-lock.json` (`rm -rf node_modules package-lock.json && npm install`).
- [ ] Migrate `src/tools/index.ts` to `registerTool`.
- [ ] Migrate all three resources under `src/resources/*.ts` to
      `registerResource`.
- [ ] Bump `serverVersion` in `src/config/index.ts` and `version` in
      `package.json` to `0.2.0`.
- [ ] `npm run build`.
- [ ] Smoke-test with MCP Inspector and at least one real client
      (Cursor or Claude Desktop).
- [ ] Tag and publish (`npm publish`) once green.

---

## 8. Follow-up: support arbitrary Replicate models

Today the server hard-codes two models in `src/config/index.ts`:

```ts
imageModelId: "black-forest-labs/flux-schnell"
svgModelId:   "recraft-ai/recraft-v3-svg"
```

Replicate hosts thousands of models. This section captures the design for
opening that up without losing the strong per-tool schemas we have today.

Ship this **after** §3–§7 land. It is a feature, not part of the SDK upgrade,
and should go out as `0.3.0`.

### 8.1 Design options

| Option | Effort | LLM UX | Notes |
| ------ | ------ | ------ | ----- |
| A. Generic `run_replicate_model` tool with free-form `input` | ~30 LOC | LLM guesses parameter names; errors come back from Replicate | Ship as an escape hatch alongside the curated tools. |
| B. Config-driven list of models, Zod schemas authored per entry | moderate | Excellent — validation + descriptions | Doesn't scale past ~10 models without feeling like boilerplate. |
| C. Fetch OpenAPI schema per model on demand, convert to Zod, register dynamically | largest | Excellent + scales | Needs JSON-Schema → Zod (`json-schema-to-zod`) and a tool-list-changed notification. |

**Recommendation: A + a `get_model_schema` introspection tool.** Minimal code,
unblocks every model immediately, and lets the LLM read the input schema
before calling. Keep the curated `generate_image` / `generate_svg` tools as
the best-UX path for common workloads. Revisit C only if we see real demand.

### 8.2 New tools

Add two tools and one types export:

`src/types/index.ts`:

```ts
export const runReplicateModelSchema = {
  model: z
    .string()
    .regex(/^[\w.-]+\/[\w.-]+(:[\w.-]+)?$/)
    .describe(
      "Replicate model reference in 'owner/name' or 'owner/name:version' form, e.g. 'stability-ai/sdxl' or 'black-forest-labs/flux-1.1-pro:abc123'"
    ),
  input: z
    .record(z.unknown())
    .describe(
      "Model input parameters. Call get_model_schema first if you don't know the shape."
    ),
  prefer_wait: z
    .number()
    .int()
    .min(1)
    .max(60)
    .default(60)
    .describe("Seconds to hold the connection open waiting for sync output."),
  return_as: z
    .enum(["url", "base64", "both"])
    .default("url")
    .describe(
      "How to return file outputs. 'base64' embeds inline for clients that render images; 'url' returns a link."
    ),
};

export const getModelSchemaSchema = {
  model: z
    .string()
    .describe("Replicate model reference in 'owner/name' form."),
};
```

`src/tools/runReplicateModel.ts` (sketch):

```ts
import { z } from "zod";
import { replicate } from "../services/replicate.js";
import { handleError } from "../utils/error.js";
import { outputToBase64 } from "../utils/image.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { FileOutput } from "replicate";

type Input = {
  model: string;
  input: Record<string, unknown>;
  prefer_wait: number;
  return_as: "url" | "base64" | "both";
};

export const runReplicateModelTool = async (
  args: Input
): Promise<CallToolResult> => {
  try {
    const output = await replicate.run(
      args.model as `${string}/${string}` | `${string}/${string}:${string}`,
      { input: args.input, wait: { mode: "block", timeout: args.prefer_wait } }
    );

    const items = Array.isArray(output) ? output : [output];
    const content: CallToolResult["content"] = [];

    for (const item of items) {
      if (isFileOutput(item)) {
        const url = item.url() as unknown as string;
        if (args.return_as !== "base64") {
          content.push({ type: "text", text: `Output URL: ${url}` });
        }
        if (args.return_as !== "url") {
          content.push({
            type: "image",
            data: await outputToBase64(item),
            mimeType: guessMime(url),
          });
        }
      } else {
        content.push({ type: "text", text: String(item) });
      }
    }
    return { content };
  } catch (err) {
    handleError(err);
  }
};

const isFileOutput = (x: unknown): x is FileOutput =>
  typeof x === "object" && x !== null && typeof (x as FileOutput).url === "function";

const guessMime = (url: string) => {
  if (url.endsWith(".png")) return "image/png";
  if (url.endsWith(".webp")) return "image/webp";
  if (url.endsWith(".jpg") || url.endsWith(".jpeg")) return "image/jpeg";
  if (url.endsWith(".svg")) return "image/svg+xml";
  return "application/octet-stream";
};
```

`src/tools/getModelSchema.ts` (sketch):

```ts
import { replicate } from "../services/replicate.js";
import { handleError } from "../utils/error.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export const getModelSchemaTool = async ({
  model,
}: {
  model: string;
}): Promise<CallToolResult> => {
  try {
    const [owner, name] = model.split("/");
    const info = await replicate.models.get(owner, name);
    const schema =
      info.latest_version?.openapi_schema ?? "No schema published for this model.";
    return {
      content: [
        {
          type: "text",
          text:
            `Model: ${owner}/${name}\n` +
            `Latest version: ${info.latest_version?.id ?? "unknown"}\n` +
            `Description: ${info.description ?? ""}\n\n` +
            `OpenAPI schema:\n${JSON.stringify(schema, null, 2)}`,
        },
      ],
    };
  } catch (err) {
    handleError(err);
  }
};
```

Register them in `src/tools/index.ts`:

```ts
server.registerTool(
  "run_replicate_model",
  {
    title: "Run any Replicate model",
    description:
      "Run any model hosted on Replicate by its 'owner/name[:version]' reference. Call get_model_schema first if you don't know the input shape.",
    inputSchema: runReplicateModelSchema,
  },
  runReplicateModelTool
);

server.registerTool(
  "get_model_schema",
  {
    title: "Get Replicate model schema",
    description:
      "Fetch the OpenAPI input schema and description for a Replicate model so you know what parameters to pass to run_replicate_model.",
    inputSchema: getModelSchemaSchema,
    annotations: { readOnlyHint: true, idempotentHint: true },
  },
  getModelSchemaTool
);
```

### 8.3 Optional: allowlist

Exposing arbitrary models is powerful but opens the door to running expensive
models unintentionally. Add an env var for ops-level control:

```ts
// src/config/index.ts
modelAllowlist: (process.env.REPLICATE_MODEL_ALLOWLIST ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean),
```

In `runReplicateModelTool`, if `CONFIG.modelAllowlist.length > 0`, reject
models whose `owner/name` prefix is not in the list. Default empty list means
"allow anything" so existing users aren't surprised.

### 8.4 What this does **not** solve

- **Model-specific output handling.** Audio, video, and text-only models
  won't render inline in every client. The `return_as: "url"` default is
  safe; clients that support audio/video content blocks can receive them if
  we add MIME-based routing later.
- **Long-running models.** `replicate.run()` with `wait.mode: "block"` tops
  out around 60 s. For models that routinely exceed this, reuse the existing
  `create_prediction` + `get_prediction` pair or migrate to SDK Tasks
  (SEP-1686, available in SDK ≥ 1.24).
- **Streaming.** `replicate.stream()` is a separate code path; wiring it
  into MCP means progress notifications and is worth a follow-up if users
  ask for it.

### 8.5 Rollout checklist (feature release)

- [ ] Add `src/tools/runReplicateModel.ts` and `src/tools/getModelSchema.ts`.
- [ ] Add schemas to `src/types/index.ts`.
- [ ] Register both tools in `src/tools/index.ts`.
- [ ] Add optional `REPLICATE_MODEL_ALLOWLIST` handling to `src/config/index.ts`.
- [ ] Update `README.md` "Available Tools" section with both new entries.
- [ ] Bump `version` to `0.3.0` in `package.json` and `serverVersion` in
      `src/config/index.ts`.
- [ ] `npm run build` and smoke-test with MCP Inspector:
      - `get_model_schema` against `stability-ai/sdxl`.
      - `run_replicate_model` against a cheap, fast model (e.g.
        `black-forest-labs/flux-schnell`) with `return_as: "url"`.
- [ ] Publish.
