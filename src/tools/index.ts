import {
  createPredictionSchema,
  getPredictionSchema,
  getModelSchemaSchema,
  imageGenerationOutputSchema,
  imageGenerationSchema,
  imageVariantsGenerationOutputSchema,
  imageVariantsGenerationSchema,
  multiImageGenerationOutputSchema,
  multiImageGenerationSchema,
  predictionListSchema,
  runReplicateModelSchema,
  svgGenerationOutputSchema,
  svgGenerationSchema,
} from "../types/index.js";

import { server } from "../server/index.js";
import { registerCreatePredictionTool } from "./createPrediction.js";
import { registerGetPredictionTool } from "./getPrediction.js";
import { registerGenerateImageTool } from "./generateImage.js";
import { registerPredictionListTool } from "./predictionList.js";
import { registerGenerateSvgTool } from "./generateSVG.js";
import { registerGenerateMultipleImagesTool } from "./generateMultipleImages.js";
import { registerGenerateImageVariantsTool } from "./generateImageVariants.js";
import { registerRunReplicateModelTool } from "./runReplicateModel.js";
import { registerGetModelSchemaTool } from "./getModelSchema.js";

const externalWriteAnnotations = {
  readOnlyHint: false,
  destructiveHint: false,
  openWorldHint: true,
};

const externalReadAnnotations = {
  readOnlyHint: true,
  idempotentHint: true,
  destructiveHint: false,
  openWorldHint: true,
};

export const registerAllTools = () => {
  server.registerTool(
    "generate_image",
    {
      title: "Generate Image",
      description:
        "Generate an image from a text prompt using Flux Schnell model",
      inputSchema: imageGenerationSchema,
      outputSchema: imageGenerationOutputSchema,
      annotations: externalWriteAnnotations,
    },
    registerGenerateImageTool
  );
  server.registerTool(
    "generate_multiple_images",
    {
      title: "Generate Multiple Images",
      description:
        "Generate multiple images from an array of prompts using Flux Schnell model",
      inputSchema: multiImageGenerationSchema,
      outputSchema: multiImageGenerationOutputSchema,
      annotations: externalWriteAnnotations,
    },
    registerGenerateMultipleImagesTool
  );
  server.registerTool(
    "generate_image_variants",
    {
      title: "Generate Image Variants",
      description:
        "Generate multiple variants of the same image from a single prompt",
      inputSchema: imageVariantsGenerationSchema,
      outputSchema: imageVariantsGenerationOutputSchema,
      annotations: externalWriteAnnotations,
    },
    registerGenerateImageVariantsTool
  );
  server.registerTool(
    "generate_svg",
    {
      title: "Generate SVG",
      description: "Generate an SVG from a text prompt using Recraft model",
      inputSchema: svgGenerationSchema,
      outputSchema: svgGenerationOutputSchema,
      annotations: externalWriteAnnotations,
    },
    registerGenerateSvgTool
  );
  server.registerTool(
    "get_prediction",
    {
      title: "Get Prediction",
      description: "Get details of a specific prediction by ID",
      inputSchema: getPredictionSchema,
      annotations: externalReadAnnotations,
    },
    registerGetPredictionTool
  );
  server.registerTool(
    "create_prediction",
    {
      title: "Create Prediction",
      description:
        "Create a prediction on Replicate and poll for its completion",
      inputSchema: createPredictionSchema,
      annotations: externalWriteAnnotations,
    },
    registerCreatePredictionTool
  );
  server.registerTool(
    "prediction_list",
    {
      title: "List Predictions",
      description: "Get a list of recent predictions from Replicate",
      inputSchema: predictionListSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    registerPredictionListTool
  );
  server.registerTool(
    "run_replicate_model",
    {
      title: "Run any Replicate model",
      description:
        "Run any model hosted on Replicate by its 'owner/name[:version]' reference. Call get_model_schema first if you don't know the input shape.",
      inputSchema: runReplicateModelSchema,
      annotations: externalWriteAnnotations,
    },
    registerRunReplicateModelTool
  );
  server.registerTool(
    "get_model_schema",
    {
      title: "Get Replicate model schema",
      description:
        "Fetch the OpenAPI input schema and description for a Replicate model so you know what parameters to pass to run_replicate_model.",
      inputSchema: getModelSchemaSchema,
      annotations: externalReadAnnotations,
    },
    registerGetModelSchemaTool
  );
};
