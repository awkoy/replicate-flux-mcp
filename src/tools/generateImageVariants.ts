import { ImageVariantsGenerationParams } from "../types/index.js";
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
import { CONFIG } from "../config/index.js";

type Variant = {
  variant_index: number;
  url: string;
  prompt_used: string;
  seed?: number;
  imageBase64: string;
};

export const registerGenerateImageVariantsTool = async (
  input: ImageVariantsGenerationParams,
  extra: RequestHandlerExtra<ServerRequest, ServerNotification>
): Promise<CallToolResult> => {
  const {
    prompt,
    num_variants,
    seed,
    prompt_variations,
    variation_mode,
    ...commonParams
  } = input;

  try {
    const usingPromptVariations =
      !!prompt_variations && prompt_variations.length > 0;
    const effectiveVariants = usingPromptVariations
      ? Math.min(num_variants, prompt_variations!.length)
      : num_variants;

    const progressToken = extra._meta?.progressToken;
    let done = 0;
    const notify = async (message: string) => {
      if (progressToken === undefined) return;
      await extra.sendNotification({
        method: "notifications/progress",
        params: {
          progressToken,
          progress: done,
          total: effectiveVariants,
          message,
        },
      });
    };

    await notify(`Starting ${effectiveVariants} variants`);

    const generationPromises = Array.from(
      { length: effectiveVariants },
      async (_, index) => {
        const variantSeed = seed !== undefined ? seed + index : undefined;

        let variantPrompt = prompt;
        if (usingPromptVariations) {
          const variation = prompt_variations![index];
          variantPrompt =
            variation_mode === "append" ? `${prompt} ${variation}` : variation;
        }

        const [output] = (await replicate.run(CONFIG.imageModelId, {
          input: {
            prompt: variantPrompt,
            seed: variantSeed,
            ...commonParams,
          },
        })) as [FileOutput];

        const imageUrl = output.url() as unknown as string;
        const imageBase64 = await outputToBase64(output);

        done += 1;
        await notify(`Completed ${done}/${effectiveVariants}`);

        const variant: Variant = {
          variant_index: index + 1,
          url: imageUrl,
          prompt_used: variantPrompt,
          imageBase64,
        };
        if (variantSeed !== undefined) variant.seed = variantSeed;
        return variant;
      }
    );

    const variants = await Promise.all(generationPromises);
    const mimeType = mimeFor(input.output_format);

    const content: CallToolResult["content"] = [
      {
        type: "text",
        text: usingPromptVariations
          ? `Generated ${variants.length} variants of "${prompt}" using custom prompt variations (${variation_mode} mode)`
          : `Generated ${variants.length} variants of: "${prompt}" using seed variations`,
      },
    ];

    for (const v of variants) {
      let description = `Variant #${v.variant_index}`;
      if (usingPromptVariations) description += `\nPrompt: "${v.prompt_used}"`;
      else if (v.seed !== undefined) description += ` (seed: ${v.seed})`;
      description += `\nImage URL: ${v.url}`;
      content.push({ type: "text", text: `\n\n${description}` });
      content.push({ type: "image", data: v.imageBase64, mimeType });
    }

    const structuredVariants = variants.map((v) => ({
      variant_index: v.variant_index,
      url: v.url,
      prompt_used: v.prompt_used,
      ...(v.seed !== undefined ? { seed: v.seed } : {}),
    }));

    return {
      content,
      structuredContent: {
        base_prompt: prompt,
        variation_mode: usingPromptVariations ? variation_mode : "seed",
        variants: structuredVariants,
        format: input.output_format,
        aspect_ratio: input.aspect_ratio,
      },
    };
  } catch (error) {
    return handleError(error);
  }
};
