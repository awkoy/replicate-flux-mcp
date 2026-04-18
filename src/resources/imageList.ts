import { server } from "../server/index.js";
import {
  ListResourcesCallback,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { replicate } from "../services/replicate.js";
import { urlToBase64 } from "../utils/image.js";
import { CONFIG } from "../config/index.js";
import { fetchAllPredictions } from "./fetchPredictions.js";

export const registerImageListResource = () => {
  const list: ListResourcesCallback = async () => {
    const predictions = await fetchAllPredictions("images");
    return {
      resources: predictions
        .filter(
          (prediction) =>
            prediction.output?.length &&
            prediction.model === CONFIG.imageModelId
        )
        .map((prediction) => ({
          uri: `images://${prediction.id}`,
          name: `Image ${prediction.id}`,
          mimeType: "application/json",
          description: `Generated image by ${prediction.model} with id ${prediction.id}`,
        })),
      nextCursor: undefined,
    };
  };

  server.registerResource(
    "images",
    new ResourceTemplate("images://{id}", {
      list,
    }),
    {
      title: "Generated images",
      description:
        "History of images generated with the Flux Schnell model on Replicate",
      mimeType: "image/png",
    },
    async (uri, { id }) => {
      const prediction = await replicate.predictions.get(id as string);

      if (!prediction.output?.length) {
        return {
          contents: [
            {
              name: "Not Found!",
              uri: uri.href,
              text: `Data has been removed by Replicate automatically after an hour, by default. You have to save your own copies before it is removed.`,
              mimeType: "text/plain",
            },
          ],
        };
      }

      const imageBase64 = await urlToBase64(prediction.output[0]);

      return {
        contents: [
          {
            name: "image",
            uri: uri.href,
            blob: imageBase64,
            mimeType: "image/png",
          },
        ],
      };
    }
  );
};
