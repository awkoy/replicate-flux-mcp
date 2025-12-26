import {
  getPredictionSchema,
  svgGenerationSchema,
  multiImageGenerationSchema,
  imageVariantsGenerationSchema,
  runModelSchema,
} from "../types/index.js";
import { predictionListSchema } from "../types/index.js";

import { server } from "../server/index.js";
import { imageGenerationSchema } from "../types/index.js";
import { registerGetPredictionTool } from "./getPrediction.js";
import { registerPredictionListTool } from "./predictionList.js";
import { registerGenerateImageTool } from "./generateImage.js";
import { createPredictionSchema } from "../types/index.js";
import { registerCreatePredictionTool } from "./createPrediction.js";
import { registerGenerateSvgTool } from "./generateSVG.js";
import { registerGenerateMultipleImagesTool } from "./generateMultipleImages.js";
import { registerGenerateImageVariantsTool } from "./generateImageVariants.js";
import { registerRunModelTool } from "./runModel.js";

export const registerAllTools = () => {
  server.tool(
    "generate_image",
    "Generate an image from a text prompt using Flux Schnell model",
    imageGenerationSchema,
    registerGenerateImageTool
  );
  server.tool(
    "generate_multiple_images",
    "Generate multiple images from an array of prompts using Flux Schnell model",
    multiImageGenerationSchema,
    registerGenerateMultipleImagesTool
  );
  server.tool(
    "generate_image_variants",
    "Generate multiple variants of the same image from a single prompt",
    imageVariantsGenerationSchema,
    registerGenerateImageVariantsTool
  );
  server.tool(
    "generate_svg",
    "Generate an SVG from a text prompt using Recraft model",
    svgGenerationSchema,
    registerGenerateSvgTool
  );
  server.tool(
    "get_prediction",
    "Get details of a specific prediction by ID",
    getPredictionSchema,
    registerGetPredictionTool
  );
  server.tool(
    "create_prediction",
    "Generate an prediction from a text prompt using Flux Schnell model",
    createPredictionSchema,
    registerCreatePredictionTool
  );
  server.tool(
    "prediction_list",
    "Get a list of recent predictions from Replicate",
    predictionListSchema,
    registerPredictionListTool
  );
  server.tool(
    "run_model",
    "Run a whitelisted Replicate model with a raw input payload",
    runModelSchema,
    registerRunModelTool
  );
};
