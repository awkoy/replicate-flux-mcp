import { replicate } from "../services/replicate.js";
import { handleError } from "../utils/error.js";
import { GetPredictionParams } from "../types/index.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export const registerGetPredictionTool = async ({
  predictionId,
}: GetPredictionParams): Promise<CallToolResult> => {
  try {
    const prediction = await replicate.predictions.get(predictionId);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(prediction, null, 2),
        },
      ],
    };
  } catch (error) {
    return handleError(error);
  }
};
