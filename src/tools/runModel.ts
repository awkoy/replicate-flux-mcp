import { RunModelParams } from "../types/index.js";
import { replicate } from "../services/replicate.js";
import { handleError } from "../utils/error.js";
import {
  CallToolResult,
  TextContent,
} from "@modelcontextprotocol/sdk/types.js";
import { assertAllowedModelId } from "../utils/model.js";
import { FileOutput } from "replicate";

function isFileOutput(value: unknown): value is FileOutput {
  return (
    typeof value === "object" &&
    value !== null &&
    "url" in value &&
    typeof (value as { url?: unknown }).url === "function"
  );
}

function toJson(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    return String(value);
  }
}

function normalizeOutput(output: unknown) {
  const urls: string[] = [];
  const textParts: string[] = [];

  if (isFileOutput(output)) {
    const url = output.url() as unknown as string;
    if (url) {
      urls.push(url);
    } else {
      textParts.push(toJson(output));
    }
    return { urls, text: textParts.join("\n") };
  }

  if (Array.isArray(output)) {
    for (const item of output) {
      if (isFileOutput(item)) {
        const url = item.url() as unknown as string;
        if (url) {
          urls.push(url);
        } else {
          textParts.push(toJson(item));
        }
        continue;
      }
      if (typeof item === "string") {
        if (item.startsWith("http")) {
          urls.push(item);
        } else {
          textParts.push(item);
        }
        continue;
      }
      textParts.push(toJson(item));
    }
    return { urls, text: textParts.join("\n") };
  }

  if (typeof output === "string") {
    if (output.startsWith("http")) {
      urls.push(output);
    } else {
      textParts.push(output);
    }
    return { urls, text: textParts.join("\n") };
  }

  if (output === null || output === undefined) {
    textParts.push(String(output));
    return { urls, text: textParts.join("\n") };
  }

  textParts.push(toJson(output));
  return { urls, text: textParts.join("\n") };
}

export const registerRunModelTool = async (
  input: RunModelParams
): Promise<CallToolResult> => {
  try {
    assertAllowedModelId(input.model_id);
    const modelId = input.model_id;
    const output = await replicate.run(modelId, {
      input: input.input ?? {},
    });
    const { urls, text } = normalizeOutput(output);

    const content: TextContent[] = [
      {
        type: "text",
        text: `Model: ${modelId}`,
      },
    ];

    if (urls.length > 0) {
      content.push({
        type: "text",
        text: `Output URLs:\n${urls.join("\n")}`,
      });
    }

    if (text) {
      content.push({
        type: "text",
        text: `Output:\n${text}`,
      });
    }

    if (urls.length === 0 && !text) {
      content.push({
        type: "text",
        text: "No output returned from the model.",
      });
    }

    return { content };
  } catch (error) {
    handleError(error);
  }
};
