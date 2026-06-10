import { replicate } from "../services/replicate.js";
import { server } from "../server/index.js";
import { Prediction } from "replicate";

export async function fetchAllPredictions(logger: string): Promise<Prediction[]> {
  try {
    const predictions: Prediction[] = [];
    for await (const page of replicate.paginate(replicate.predictions.list)) {
      predictions.push(...page);
    }
    return predictions;
  } catch (error) {
    await server.server
      .sendLoggingMessage({
        level: "error",
        logger,
        data: {
          message: `Error listing ${logger}`,
          error: error instanceof Error ? error.message : String(error),
        },
      })
      .catch(() => {});
    return [];
  }
}
