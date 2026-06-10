import { server } from "../server/index.js";
import {
  ListResourcesCallback,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { replicate } from "../services/replicate.js";
import { urlToSvg } from "../utils/image.js";
import { CONFIG } from "../config/index.js";
import { fetchAllPredictions } from "./fetchPredictions.js";

export const registerSvgListResource = () => {
  const list: ListResourcesCallback = async () => {
    const predictions = await fetchAllPredictions("svglist");
    return {
      resources: predictions
        .filter((prediction) => prediction.model === CONFIG.svgModelId)
        .map((prediction) => ({
          uri: `svglist://${prediction.id}`,
          name: `SVG ${prediction.id}`,
          mimeType: "application/json",
          description: `Generated image by ${prediction.model} with id ${prediction.id}`,
        })),
      nextCursor: undefined,
    };
  };

  server.registerResource(
    "svglist",
    new ResourceTemplate("svglist://{id}", {
      list,
    }),
    {
      title: "Generated SVGs",
      description:
        "History of SVGs generated with the Recraft V3 SVG model on Replicate",
      mimeType: "image/svg+xml",
    },
    async (uri, { id }) => {
      const prediction = await replicate.predictions.get(id as string);

      if (!prediction.output) {
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

      const svg = await urlToSvg(prediction.output);

      return {
        contents: [
          {
            name: "svglist",
            uri: uri.href,
            text: svg,
            mimeType: "image/svg+xml",
          },
        ],
      };
    }
  );
};
