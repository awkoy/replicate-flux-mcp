import { replicate } from "../services/replicate.js";
import { handleError } from "../utils/error.js";
import { outputToBase64 } from "../utils/image.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { FileOutput } from "replicate";
import { CONFIG } from "../config/index.js";
import { RunReplicateModelParams } from "../types/index.js";

const isFileOutput = (x: unknown): x is FileOutput =>
  typeof x === "object" &&
  x !== null &&
  typeof (x as FileOutput).url === "function" &&
  typeof (x as FileOutput).blob === "function";

const guessMime = (url: string) => {
  const lower = url.split("?")[0].toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  if (lower.endsWith(".gif")) return "image/gif";
  return "application/octet-stream";
};

const isImageMime = (mime: string) => mime.startsWith("image/");

export const registerRunReplicateModelTool = async (
  args: RunReplicateModelParams
): Promise<CallToolResult> => {
  try {
    const [ownerName] = args.model.split(":");
    if (
      CONFIG.modelAllowlistConfigured &&
      !CONFIG.modelAllowlist.includes(ownerName)
    ) {
      const allowed =
        CONFIG.modelAllowlist.length > 0
          ? CONFIG.modelAllowlist.join(", ")
          : "(none — REPLICATE_MODEL_ALLOWLIST is set but empty)";
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Model '${ownerName}' is not in REPLICATE_MODEL_ALLOWLIST. Allowed: ${allowed}`,
          },
        ],
      };
    }

    const output = await replicate.run(args.model as `${string}/${string}`, {
      input: args.input,
      wait: { mode: "block", timeout: args.prefer_wait },
    });

    const items = Array.isArray(output) ? output : [output];
    const content: CallToolResult["content"] = [];

    for (const item of items) {
      if (isFileOutput(item)) {
        const url = item.url() as unknown as string;
        if (args.return_as !== "base64") {
          content.push({ type: "text", text: `Output URL: ${url}` });
        }
        if (args.return_as !== "url") {
          const mimeType = guessMime(url);
          if (mimeType === "image/svg+xml") {
            const blob = await item.blob();
            content.push({ type: "text", text: await blob.text() });
          } else if (isImageMime(mimeType)) {
            content.push({
              type: "image",
              data: await outputToBase64(item),
              mimeType,
            });
          } else if (args.return_as === "base64") {
            content.push({
              type: "text",
              text: `Non-image output (${mimeType}); base64 at ${url}`,
            });
          }
        }
      } else if (typeof item === "string") {
        content.push({ type: "text", text: item });
      } else {
        content.push({ type: "text", text: JSON.stringify(item) });
      }
    }

    if (content.length === 0) {
      content.push({
        type: "text",
        text: "Model returned no output.",
      });
    }

    return { content };
  } catch (error) {
    return handleError(error);
  }
};
