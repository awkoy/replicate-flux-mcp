import { MultiImageGenerationParams } from "../types/index.js";
import { replicate } from "../services/replicate.js";
import { handleError } from "../utils/error.js";
import {
  CallToolResult,
  ServerNotification,
  ServerRequest,
} from "@modelcontextprotocol/sdk/types.js";
import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import { FileOutput } from "replicate";
import { mimeFor, outputToBase64 } from "../utils/image.js";
import { resolveImageModelId } from "../utils/model.js";

export const registerGenerateMultipleImagesTool = async (
  input: MultiImageGenerationParams,
  extra: RequestHandlerExtra<ServerRequest, ServerNotification>
): Promise<CallToolResult> => {
  const { prompts, model_id, support_image_mcp_response_type, ...commonParams } =
    input;
  const progressToken = extra._meta?.progressToken;
  const total = prompts.length;
  let done = 0;
  const supportsImageContent = support_image_mcp_response_type !== false;

  try {
    const modelId = resolveImageModelId(model_id);
    const notify = async (message: string) => {
      if (progressToken === undefined) return;
      await extra.sendNotification({
        method: "notifications/progress",
        params: { progressToken, progress: done, total, message },
      });
    };

    await notify(`Starting ${total} image generations`);

    const generationPromises = prompts.map(async (prompt) => {
      const [output] = (await replicate.run(modelId, {
        input: { prompt, ...commonParams },
      })) as [FileOutput];

      const imageUrl = output.url() as unknown as string;
      const imageBase64 = supportsImageContent
        ? await outputToBase64(output)
        : undefined;

      done += 1;
      await notify(`Completed ${done}/${total}`);

      return { prompt, imageUrl, imageBase64 };
    });

    const results = await Promise.all(generationPromises);
    const mimeType = mimeFor(input.output_format);

    const content: CallToolResult["content"] = [
      {
        type: "text",
        text: `Generated ${results.length} images based on your prompts:`,
      },
    ];

    for (const result of results) {
      content.push({
        type: "text",
        text: `\n\nPrompt: "${result.prompt}"\nImage URL: ${result.imageUrl}`,
      });
      if (supportsImageContent && result.imageBase64) {
        content.push({
          type: "image",
          data: result.imageBase64,
          mimeType,
        });
      }
    }

    return {
      content,
      structuredContent: {
        images: results.map((r) => ({ url: r.imageUrl, prompt: r.prompt })),
        format: input.output_format,
        aspect_ratio: input.aspect_ratio,
      },
    };
  } catch (error) {
    return handleError(error);
  }
};
