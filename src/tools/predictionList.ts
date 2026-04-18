import { PredictionListParams } from "../types/index.js";
import { replicate } from "../services/replicate.js";
import { handleError } from "../utils/error.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export const registerPredictionListTool = async ({
  limit,
}: PredictionListParams): Promise<CallToolResult> => {
  try {
    const predictions = [];
    for await (const page of replicate.paginate(replicate.predictions.list)) {
      predictions.push(...page);
      if (predictions.length >= limit) {
        break;
      }
    }

    const limitedPredictions = predictions.slice(0, limit);
    const totalPages = Math.ceil(predictions.length / limit);

    return {
      content: [
        {
          type: "text",
          text: `Found ${limitedPredictions.length} predictions (showing ${limitedPredictions.length} of ${predictions.length} total, page 1 of ${totalPages})`,
        },
        {
          type: "text",
          text: JSON.stringify(limitedPredictions, null, 2),
        },
      ],
    };
  } catch (error) {
    return handleError(error);
  }
};
