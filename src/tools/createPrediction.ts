import { CreatePredictionParams } from "../types/index.js";
import { pollForCompletion, replicate } from "../services/replicate.js";
import { handleError } from "../utils/error.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { resolveImageModelId } from "../utils/model.js";

export const registerCreatePredictionTool = async (
  input: CreatePredictionParams
): Promise<CallToolResult> => {
  try {
    const { model_id, ...predictionInput } = input;
    const modelId = resolveImageModelId(model_id);
    const prediction = await replicate.predictions.create({
      model: modelId,
      input: predictionInput,
    });

    await replicate.predictions.get(prediction.id);
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
    handleError(error);
  }
};
