import { CreatePredictionParams } from "../types/index.js";
import { pollForCompletion, replicate } from "../services/replicate.js";
import { handleError } from "../utils/error.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { CONFIG } from "../config/index.js";

export const registerCreatePredictionTool = async (
  input: CreatePredictionParams
): Promise<CallToolResult> => {
  try {
    const prediction = await replicate.predictions.create({
      model: CONFIG.imageModelId,
      input,
    });

    const completed = await pollForCompletion(prediction.id);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(completed || "Processing timed out", null, 2),
        },
      ],
    };
  } catch (error) {
    return handleError(error);
  }
};
