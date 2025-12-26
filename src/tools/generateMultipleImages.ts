import { MultiImageGenerationParams } from "../types/index.js";
import { replicate } from "../services/replicate.js";
import { handleError } from "../utils/error.js";
import {
  CallToolResult,
  TextContent,
  ImageContent,
} from "@modelcontextprotocol/sdk/types.js";
import { FileOutput } from "replicate";
import { outputToBase64 } from "../utils/image.js";
import { resolveImageModelId } from "../utils/model.js";

export const registerGenerateMultipleImagesTool = async (
  input: MultiImageGenerationParams
): Promise<CallToolResult> => {
  const { prompts, model_id, support_image_mcp_response_type, ...commonParams } =
    input;
  try {
    const modelId = resolveImageModelId(model_id);
    // Process all prompts in parallel
    const generationPromises = prompts.map(async (prompt) => {
      const [output] = (await replicate.run(modelId, {
        input: {
          prompt,
          ...commonParams,
        },
      })) as [FileOutput];

      const imageUrl = output.url() as unknown as string;

      if (support_image_mcp_response_type) {
        const imageBase64 = await outputToBase64(output);
        return {
          prompt,
          imageUrl,
          imageBase64,
        };
      }

      return {
        prompt,
        imageUrl,
      };
    });

    // Wait for all image generation to complete
    const results = await Promise.all(generationPromises);

    // Build response content
    const responseContent: (TextContent | ImageContent)[] = [];

    // Add intro text
    responseContent.push({
      type: "text",
      text: `Generated ${results.length} images based on your prompts:`,
    } as TextContent);

    // Add each image with its prompt
    for (const result of results) {
      responseContent.push({
        type: "text",
        text: `\n\nPrompt: "${result.prompt}"\nImage URL: ${result.imageUrl}`,
      } as TextContent);

      if (support_image_mcp_response_type && result.imageBase64) {
        responseContent.push({
          type: "image",
          data: result.imageBase64,
          mimeType: `image/${
            input.output_format === "jpg" ? "jpeg" : input.output_format
          }`,
        } as ImageContent);
      }
    }

    return {
      content: responseContent,
    };
  } catch (error) {
    handleError(error);
  }
};
