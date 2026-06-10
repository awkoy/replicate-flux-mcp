import {
  ListResourcesCallback,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { replicate } from "../services/replicate.js";
import { fetchAllPredictions } from "./fetchPredictions.js";
import { server } from "../server/index.js";

export const registerPreditionListResource = () => {
  const list: ListResourcesCallback = async () => {
    const predictions = await fetchAllPredictions("predictions");
    return {
      resources: predictions.map((prediction) => ({
        uri: `predictions://${prediction.id}`,
        name: `Prediction ${prediction.id}`,
        mimeType: "application/json",
      })),
      nextCursor: undefined,
    };
  };

  server.registerResource(
    "predictions",
    new ResourceTemplate("predictions://{id}", {
      list,
    }),
    {
      title: "Recent predictions",
      description: "History of Replicate predictions for this account",
      mimeType: "application/json",
    },
    async (uri, { id }) => {
      const prediction = await replicate.predictions.get(id as string);

      return {
        contents: [
          {
            name: "prediction",
            uri: uri.href,
            text: JSON.stringify(prediction),
            mimeType: "application/json",
          },
        ],
      };
    }
  );
};
