import { ImageVariantsGenerationParams } from "../types/index.js";
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

type ImageVariantResult = {
  variantIndex: number;
  imageUrl: string;
  imageBase64?: string;
  usedPrompt: string;
};

export const registerGenerateImageVariantsTool = async (
  input: ImageVariantsGenerationParams
): Promise<CallToolResult> => {
  const {
    prompt,
    num_variants,
    seed,
    support_image_mcp_response_type,
    prompt_variations,
    variation_mode,
    model_id,
    ...commonParams
  } = input;

  try {
    const modelId = resolveImageModelId(model_id);
    let effectiveVariants = num_variants;
    let usingPromptVariations = false;

    // Decide if we're using prompt variations
    if (prompt_variations && prompt_variations.length > 0) {
      usingPromptVariations = true;
      // If using prompt variations, number of variants is limited by available variations
      effectiveVariants = Math.min(num_variants, prompt_variations.length);
    }

    // Process all variants in parallel
    const generationPromises = Array.from(
      { length: effectiveVariants },
      (_, index) => {
        // If seed is provided, create deterministic variants by adding the index
        const variantSeed = seed !== undefined ? seed + index : undefined;

        // Determine which prompt to use for this variant
        let variantPrompt = prompt;
        if (usingPromptVariations) {
          const variation = prompt_variations![index];
          if (variation_mode === "append") {
            variantPrompt = `${prompt} ${variation}`;
          } else {
            // 'replace' mode
            variantPrompt = variation;
          }
        }

        return replicate
          .run(modelId, {
            input: {
              prompt: variantPrompt,
              seed: variantSeed,
              ...commonParams,
            },
          })
          .then((outputs) => {
            const [output] = outputs as [FileOutput];
            const imageUrl = output.url() as unknown as string;

            if (support_image_mcp_response_type) {
              return outputToBase64(output).then((imageBase64) => ({
                variantIndex: index + 1,
                imageUrl,
                imageBase64,
                usedPrompt: variantPrompt,
              }));
            }

            return {
              variantIndex: index + 1,
              imageUrl,
              usedPrompt: variantPrompt,
            };
          });
      }
    );

    // Wait for all variant generation to complete
    const results = (await Promise.all(
      generationPromises
    )) as ImageVariantResult[];

    // Build response content
    const responseContent: (TextContent | ImageContent)[] = [];

    // Add intro text - different based on whether we're using prompt variations
    if (usingPromptVariations) {
      responseContent.push({
        type: "text",
        text: `Generated ${results.length} variants of "${prompt}" using custom prompt variations (${variation_mode} mode)`,
      } as TextContent);
    } else {
      responseContent.push({
        type: "text",
        text: `Generated ${results.length} variants of: "${prompt}" using seed variations`,
      } as TextContent);
    }

    // Add each variant with its index and prompt info
    for (const result of results) {
      // Build an appropriate description based on variant type
      let variantDescription = `Variant #${result.variantIndex}`;

      if (usingPromptVariations) {
        variantDescription += `\nPrompt: "${result.usedPrompt}"`;
      } else if (seed !== undefined) {
        variantDescription += ` (seed: ${seed + (result.variantIndex - 1)})`;
      }

      variantDescription += `\nImage URL: ${result.imageUrl}`;

      responseContent.push({
        type: "text",
        text: `\n\n${variantDescription}`,
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
