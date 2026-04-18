import { SvgGenerationParams } from "../types/index.js";
import { replicate } from "../services/replicate.js";
import { handleError } from "../utils/error.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { urlToSvg } from "../utils/image.js";
import { CONFIG } from "../config/index.js";
import { FileOutput } from "replicate";

export const registerGenerateSvgTool = async (
  input: SvgGenerationParams
): Promise<CallToolResult> => {
  try {
    const output = (await replicate.run(CONFIG.svgModelId, {
      input,
    })) as FileOutput;

    const svgUrl = output.url() as unknown as string;
    if (!svgUrl) {
      throw new Error("Failed to generate SVG URL");
    }

    let svg: string | undefined;
    try {
      svg = await urlToSvg(svgUrl);
    } catch {
      svg = undefined;
    }

    const content: CallToolResult["content"] = [
      { type: "text", text: `Generated SVG URL: ${svgUrl}` },
    ];
    if (svg) content.push({ type: "text", text: svg });

    return {
      content,
      structuredContent: {
        url: svgUrl,
        prompt: input.prompt,
        size: input.size,
        style: input.style,
        ...(svg ? { svg } : {}),
      },
    };
  } catch (error) {
    return handleError(error);
  }
};
