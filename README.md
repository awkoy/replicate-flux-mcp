[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/awkoy-replicate-flux-mcp-badge.png)](https://mseep.ai/app/awkoy-replicate-flux-mcp)

# Replicate Flux MCP

![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue)
![Model Context Protocol](https://img.shields.io/badge/MCP-Enabled-purple)
[![smithery badge](https://smithery.ai/badge/@awkoy/replicate-flux-mcp)](https://smithery.ai/server/@awkoy/replicate-flux-mcp)
![NPM Downloads](https://img.shields.io/npm/dw/replicate-flux-mcp)
![Stars](https://img.shields.io/github/stars/awkoy/replicate-flux-mcp)

<a href="https://glama.ai/mcp/servers/ss8n1knen8">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/ss8n1knen8/badge" />
</a>

**Replicate Flux MCP** is an advanced Model Context Protocol (MCP) server that empowers AI assistants to generate high-quality images and vector graphics. Leveraging [Black Forest Labs' Flux Schnell model](https://replicate.com/black-forest-labs/flux-schnell) for raster images and [Recraft's V3 SVG model](https://replicate.com/recraft-ai/recraft-v3-svg) for vector graphics via the Replicate API.

## 📑 Table of Contents

- [Getting Started & Integration](#-getting-started--integration)
  - [Setup Process](#setup-process)
  - [Cursor Integration](#cursor-integration)
  - [Claude Desktop Integration](#claude-desktop-integration)
  - [Smithery Integration](#smithery-integration)
  - [Glama.ai Integration](#glamaai-integration)
- [Features](#-features)
- [Documentation](#-documentation)
  - [Available Tools](#available-tools)
  - [Available Resources](#available-resources)
  - [Available Prompts](#available-prompts)
  - [Structured Output](#structured-output)
  - [Environment Variables](#environment-variables)
- [Development](#-development)
  - [Testing](#testing)
- [Technical Details](#-technical-details)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)
- [Resources](#-resources)
- [Examples](#-examples)

## 🚀 Getting Started & Integration

### Setup Process

1. **Obtain a Replicate API Token**
   - Sign up at [Replicate](https://replicate.com/)
   - Create an API token in your account settings

2. **Choose Your Integration Method**
   - Follow one of the integration options below based on your preferred MCP client

3. **Ask Your AI Assistant to Generate an Image**
   - Simply ask naturally: "Can you generate an image of a serene mountain landscape at sunset?"
   - Or be more specific: "Please create an image showing a peaceful mountain scene with a lake reflecting the sunset colors in the foreground"

4. **Explore Advanced Features**
   - Try different parameter settings for customized results
   - Experiment with SVG generation using `generate_svg`
   - Use batch image generation or variant generation features

### Cursor Integration

#### Method 1: Using mcp.json

1. Create or edit the `.cursor/mcp.json` file in your project directory:

```json
{
  "mcpServers": {
    "replicate-flux-mcp": {
      "command": "env REPLICATE_API_TOKEN=YOUR_TOKEN npx",
      "args": ["-y", "replicate-flux-mcp"]
    }
  }
}
```

2. Replace `YOUR_TOKEN` with your actual Replicate API token
3. Restart Cursor to apply the changes

#### Method 2: Manual Mode

1. Open Cursor and go to Settings
2. Navigate to the "MCP" or "Model Context Protocol" section
3. Click "Add Server" or equivalent
4. Enter the following command in the appropriate field:

```
env REPLICATE_API_TOKEN=YOUR_TOKEN npx -y replicate-flux-mcp
```

5. Replace `YOUR_TOKEN` with your actual Replicate API token
6. Save the settings and restart Cursor if necessary

### Claude Desktop Integration

1. Create or edit the `mcp.json` file in your configuration directory:

```json
{
  "mcpServers": {
    "replicate-flux-mcp": {
      "command": "npx",
      "args": ["-y", "replicate-flux-mcp"],
      "env": {
        "REPLICATE_API_TOKEN": "YOUR TOKEN"
      }
    }
  }
}
```

2. Replace `YOUR_TOKEN` with your actual Replicate API token
3. Restart Claude Desktop to apply the changes

### Smithery Integration

This MCP server is available as a hosted service on Smithery, allowing you to use it without setting up your own server.

1. Visit [Smithery](https://smithery.ai/) and create an account if you don't have one
2. Navigate to the [Replicate Flux MCP server page](https://smithery.ai/server/@awkoy/replicate-flux-mcp)
3. Click "Add to Workspace" to add the server to your Smithery workspace
4. Configure your MCP client (Cursor, Claude Desktop, etc.) to use your Smithery workspace URL

For more information on using Smithery with your MCP clients, visit the [Smithery documentation](https://smithery.ai/docs).

### Glama.ai Integration

This MCP server is also available as a hosted service on Glama.ai, providing another option to use it without local setup.

1. Visit [Glama.ai](https://glama.ai/) and create an account if you don't have one
2. Go to the [Replicate Flux MCP server page](https://glama.ai/mcp/servers/ss8n1knen8)
3. Click "Install Server" to add the server to your workspace
4. Configure your MCP client to use your Glama.ai workspace

For more information, visit the [Glama.ai MCP servers documentation](https://glama.ai/mcp/servers).

## 🌟 Features

- **🖼️ High-Quality Image Generation** — Flux Schnell raster images with full control over aspect ratio, megapixels, inference steps, output format, and seed.
- **🎨 Vector Graphics** — Recraft V3 SVG for logos, icons, and diagrams.
- **📊 Batch + Variants** — Generate N images from N prompts or N variants of one prompt (seed-based or prompt-modifier-based).
- **🧩 Arbitrary Replicate Models** — `run_replicate_model` escape hatch accepts any `owner/name[:version]` reference, with `get_model_schema` introspection for the OpenAPI input schema. Optional allowlist via `REPLICATE_MODEL_ALLOWLIST`.
- **📦 Structured Output** — Every `generate_*` tool returns machine-readable `structuredContent` alongside human-readable content, matching a per-tool `outputSchema` (URL, prompt, format, aspect ratio, per-variant seed, etc).
- **⏳ Progress Notifications** — Batch and variant generation emit `notifications/progress` for clients that opt in via `progressToken`, so long runs aren't black-boxed.
- **💬 Curated Prompts** — 5 ready-made prompt templates (`logo`, `portrait`, `svg-icon`, `product-shot`, `isometric-diagram`) surfaced in Claude Desktop's slash palette and Cursor's `@`-menu.
- **🏷️ Proper Tool Annotations** — `readOnlyHint` / `destructiveHint` / `openWorldHint` / `idempotentHint` set correctly so clients can reason about safety and cost.
- **🪵 Structured Logging** — Server-side errors travel over `notifications/message` instead of stderr.
- **🔌 Universal MCP Compatibility** — MCP protocol 2025-11-25; works with Claude Desktop, Cursor, Cline, Zed, and any spec-compliant client.
- **🔍 Generation History** — Browse past runs through `imagelist`, `svglist`, and `predictionlist` resources.

## 📚 Documentation

### Available Tools

#### `generate_image`

Generates an image based on a text prompt using the Flux Schnell model.

```typescript
{
  prompt: string;                // Required: Text description of the image to generate
  seed?: number;                 // Optional: Random seed for reproducible generation
  go_fast?: boolean;             // Optional: Run faster predictions with optimized model (default: true)
  megapixels?: "1" | "0.25";     // Optional: Image resolution (default: "1")
  num_outputs?: number;          // Optional: Number of images to generate (1-4) (default: 1)
  aspect_ratio?: string;         // Optional: Aspect ratio (e.g., "16:9", "4:3") (default: "1:1")
  output_format?: string;        // Optional: Output format ("webp", "jpg", "png") (default: "webp")
  output_quality?: number;       // Optional: Image quality (0-100) (default: 80)
  num_inference_steps?: number;  // Optional: Number of denoising steps (1-4) (default: 4)
  disable_safety_checker?: boolean; // Optional: Disable safety filter (default: false)
}
```

#### `generate_multiple_images`

Generates multiple images based on an array of prompts using the Flux Schnell model.

```typescript
{
  prompts: string[];             // Required: Array of text descriptions for images to generate (1-10 prompts)
  seed?: number;                 // Optional: Random seed for reproducible generation
  go_fast?: boolean;             // Optional: Run faster predictions with optimized model (default: true)
  megapixels?: "1" | "0.25";     // Optional: Image resolution (default: "1")
  aspect_ratio?: string;         // Optional: Aspect ratio (e.g., "16:9", "4:3") (default: "1:1")
  output_format?: string;        // Optional: Output format ("webp", "jpg", "png") (default: "webp")
  output_quality?: number;       // Optional: Image quality (0-100) (default: 80)
  num_inference_steps?: number;  // Optional: Number of denoising steps (1-4) (default: 4)
  disable_safety_checker?: boolean; // Optional: Disable safety filter (default: false)
}
```

#### `generate_image_variants`

Generates multiple variants of the same image from a single prompt.

```typescript
{
  prompt: string;                // Required: Text description for the image to generate variants of
  num_variants: number;          // Required: Number of image variants to generate (2-10, default: 4)
  prompt_variations?: string[];  // Optional: List of prompt modifiers to apply to variants (e.g., ["in watercolor style", "in oil painting style"])
  variation_mode?: "append" | "replace"; // Optional: How to apply variations - 'append' adds to base prompt, 'replace' uses variations directly (default: "append")
  seed?: number;                 // Optional: Base random seed. Each variant will use seed+variant_index
  go_fast?: boolean;             // Optional: Run faster predictions with optimized model (default: true)
  megapixels?: "1" | "0.25";     // Optional: Image resolution (default: "1")
  aspect_ratio?: string;         // Optional: Aspect ratio (e.g., "16:9", "4:3") (default: "1:1")
  output_format?: string;        // Optional: Output format ("webp", "jpg", "png") (default: "webp")
  output_quality?: number;       // Optional: Image quality (0-100) (default: 80)
  num_inference_steps?: number;  // Optional: Number of denoising steps (1-4) (default: 4)
  disable_safety_checker?: boolean; // Optional: Disable safety filter (default: false)
}
```

#### `generate_svg`

Generates an SVG vector image based on a text prompt using the Recraft V3 SVG model.

```typescript
{
  prompt: string;                // Required: Text description of the SVG to generate
  size?: string;                 // Optional: Size of the generated SVG (default: "1024x1024")
  style?: string;                // Optional: Style of the generated image (default: "any")
                                // Options: "any", "engraving", "line_art", "line_circuit", "linocut"
}
```

#### `prediction_list`

Retrieves a list of your recent predictions from Replicate.

```typescript
{
  limit?: number;  // Optional: Maximum number of predictions to return (1-100) (default: 50)
}
```

#### `get_prediction`

Gets detailed information about a specific prediction.

```typescript
{
  predictionId: string;  // Required: ID of the prediction to retrieve
}
```

#### `run_replicate_model`

Runs any model hosted on Replicate by its `owner/name[:version]` reference. Use this as an escape hatch when none of the curated tools fit. Call `get_model_schema` first if you don't know the input shape.

```typescript
{
  model: string;                              // Required: 'owner/name' or 'owner/name:version'
  input: Record<string, unknown>;             // Required: Model input parameters
  prefer_wait?: number;                       // Optional: Seconds to block waiting for sync output (1-60, default 60)
  return_as?: "url" | "base64" | "both";      // Optional: How to return file outputs (default "url")
}
```

Set the `REPLICATE_MODEL_ALLOWLIST` env var (comma-separated `owner/name` entries) to restrict which models can be invoked. Unset = any model allowed. Set-but-empty = deny all (the server fails closed rather than silently allowing everything).

#### `get_model_schema`

Fetches the OpenAPI input schema and description for a Replicate model so you can pass the right parameters to `run_replicate_model`.

```typescript
{
  model: string;  // Required: Replicate model reference in 'owner/name' form
}
```

### Available Resources

#### `imagelist`

Browse your history of generated images created with the Flux Schnell model.

#### `svglist`

Browse your history of generated SVG images created with the Recraft V3 SVG model.

#### `predictionlist`

Browse all your Replicate predictions history.

### Available Prompts

Curated templates surfaced in Claude Desktop's slash menu and Cursor's `@`-palette. Each one fills in sensible defaults then delegates to the relevant generation tool.

| Prompt | Description | Arguments |
| --- | --- | --- |
| `logo` | Brand/product logo | `brand`, `style?`, `palette?` |
| `portrait` | Photoreal portrait | `subject`, `mood?`, `lens?` |
| `svg-icon` | Single-concept vector icon | `concept`, `style?` |
| `product-shot` | Studio product photography | `product`, `surface?` |
| `isometric-diagram` | Isometric technical illustration | `subject`, `emphasis?` |

### Structured Output

Every `generate_*` tool returns both human-readable `content` (text + image blocks) and machine-readable `structuredContent` that matches the tool's `outputSchema`.

| Tool | `structuredContent` shape |
| --- | --- |
| `generate_image` | `{ url, prompt, format, aspect_ratio, seed? }` |
| `generate_svg` | `{ url, prompt, size, style, svg? }` |
| `generate_multiple_images` | `{ images: [{ url, prompt }], format, aspect_ratio }` |
| `generate_image_variants` | `{ base_prompt, variation_mode, variants: [{ variant_index, url, prompt_used, seed? }], format, aspect_ratio }` |

Clients that understand MCP structured output can consume URLs and metadata directly without parsing prose.

### Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `REPLICATE_API_TOKEN` | yes | API token for [Replicate](https://replicate.com/account/api-tokens). The server exits immediately if it's missing. |
| `REPLICATE_MODEL_ALLOWLIST` | no | Comma-separated `owner/name` entries that gate `run_replicate_model`. **Unset** = any model allowed. **Set-but-empty** = deny all (fail-closed). Evaluated once at process start, so set it in your MCP client's `env` block (not via a dotenv loaded later). |

## 💻 Development

1. Clone the repository:

```bash
git clone https://github.com/awkoy/replicate-flux-mcp.git
cd replicate-flux-mcp
```

2. Install dependencies:

```bash
npm install
```

3. Start the TypeScript watcher:

```bash
npm run watch
```

4. Build the project:

```bash
npm run build
```

5. Smoke-test the server with the MCP Inspector:

```bash
npm run inspector
```

6. Connect to Client:

```json
{
  "mcpServers": {
    "image-generation-mcp": {
      "command": "npx",
      "args": [
        "/Users/{USERNAME}/{PATH_TO}/replicate-flux-mcp/build/index.js"
      ],
      "env": {
        "REPLICATE_API_TOKEN": "YOUR REPLICATE API TOKEN"
      }
    }
  }
}
```

### Testing

This project currently has no automated test suite. Verification is done via:

- `npm run build` — TypeScript type-checking catches most regressions.
- `npm run inspector` — drives the built binary through the official MCP Inspector for end-to-end smoke testing of tools, resources, and prompts.

Contributions adding a proper test framework (e.g. Vitest + an MCP stdio client harness) are welcome.

## ⚙️ Technical Details

### Stack

- **Model Context Protocol SDK** - Core MCP functionality for tool and resource management
- **Replicate API** - Provides access to state-of-the-art AI image generation models
- **TypeScript** - Ensures type safety and leverages modern JavaScript features
- **Zod** - Implements runtime type validation for robust API interactions

### Configuration

The server can be configured by modifying the `CONFIG` object in `src/config/index.ts`:

```typescript
export const CONFIG = {
  serverName: "replicate-flux-mcp",
  serverVersion: "0.4.0",
  imageModelId: "black-forest-labs/flux-schnell",
  svgModelId: "recraft-ai/recraft-v3-svg",
  pollingAttempts: 25,
  pollingInterval: 2000, // ms
  modelAllowlist: (process.env.REPLICATE_MODEL_ALLOWLIST ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
};
```

`modelAllowlist` is evaluated once at process start from `REPLICATE_MODEL_ALLOWLIST`. Restart the server after changing it.

## 🔍 Troubleshooting

### Common Issues

#### Authentication Error
- Ensure your `REPLICATE_API_TOKEN` is correctly set in the environment
- Verify your token is valid by testing it with the Replicate API directly

#### Safety Filter Triggered
- The model has a built-in safety filter that may block certain prompts
- Try modifying your prompt to avoid potentially problematic content

#### Timeout Error
- For larger images or busy servers, you might need to increase `pollingAttempts` or `pollingInterval` in the configuration
- Default settings should work for most use cases

## 🤝 Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

For feature requests or bug reports, please create a GitHub issue. If you like this project, consider starring the repository!

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [Replicate API Documentation](https://replicate.com/docs)
- [Flux Schnell Model](https://replicate.com/black-forest-labs/flux-schnell)
- [Recraft V3 SVG Model](https://replicate.com/recraft-ai/recraft-v3-svg)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Smithery Documentation](https://smithery.ai/docs)
- [Glama.ai MCP Servers](https://glama.ai/mcp/servers)

## 🎨 Examples

![Demo](https://github.com/user-attachments/assets/ad6db606-ae3a-48db-a1cc-e1f88847769e)

| Multiple Prompts | Prompt Variants |
|-----------------|-----------------|
| ![Multiple prompts example: "A serene mountain lake at sunset", "A bustling city street at night", "A peaceful garden in spring"](https://github.com/user-attachments/assets/e5ac56d2-bfbb-4f33-938c-a3d7bffeee60) | ![Variants example: Base prompt "A majestic castle" with modifiers "in watercolor style", "as an oil painting", "with gothic architecture"](https://github.com/user-attachments/assets/8ebe5992-4803-4bf3-a82a-251135b0698a) |

Here are some examples of how to use the tools:

### Batch Image Generation with `generate_multiple_images`

Create multiple distinct images at once with different prompts:

```json
{
  "prompts": [
    "A red sports car on a mountain road", 
    "A blue sports car on a beach", 
    "A vintage sports car in a city street"
  ]
}
```

### Image Variants with `generate_image_variants`

Create different interpretations of the same concept using seeds:

```json
{
  "prompt": "A futuristic city skyline at night",
  "num_variants": 4,
  "seed": 42
}
```

Or explore style variations with prompt modifiers:

```json
{
  "prompt": "A character portrait",
  "prompt_variations": [
    "in anime style", 
    "in watercolor style", 
    "in oil painting style", 
    "as a 3D render"
  ]
}
```

---

Made with ❤️ by Yaroslav Boiko

