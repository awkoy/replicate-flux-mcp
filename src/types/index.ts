import { z } from "zod";

export const createPredictionSchema = {
  prompt: z.string().min(1).describe("Prompt for generated image"),
  model_id: z
    .string()
    .min(1)
    .optional()
    .describe("Optional Replicate model id (allowlist only)"),
  seed: z
    .number()
    .int()
    .optional()
    .describe("Random seed. Set for reproducible generation"),
  go_fast: z
    .boolean()
    .default(true)
    .describe(
      "Run faster predictions with model optimized for speed (currently fp8 quantized); disable to run in original bf16"
    ),
  megapixels: z
    .enum(["1", "0.25"])
    .default("1")
    .describe("Approximate number of megapixels for generated image"),
  num_outputs: z
    .number()
    .int()
    .min(1)
    .max(4)
    .default(1)
    .describe("Number of outputs to generate"),
  aspect_ratio: z
    .enum([
      "1:1",
      "16:9",
      "21:9",
      "3:2",
      "2:3",
      "4:5",
      "5:4",
      "3:4",
      "4:3",
      "9:16",
      "9:21",
    ])
    .default("1:1")
    .describe("Aspect ratio for the generated image"),
  output_format: z
    .enum(["webp", "jpg", "png"])
    .default("webp")
    .describe("Format of the output images"),
  output_quality: z
    .number()
    .int()
    .min(0)
    .max(100)
    .default(80)
    .describe(
      "Quality when saving the output images, from 0 to 100. 100 is best quality, 0 is lowest quality. Not relevant for .png outputs"
    ),
  num_inference_steps: z
    .number()
    .int()
    .min(1)
    .max(4)
    .default(4)
    .describe(
      "Number of denoising steps. 4 is recommended, and lower number of steps produce lower quality outputs, faster."
    ),
  disable_safety_checker: z
    .boolean()
    .default(false)
    .describe("Disable safety checker for generated images."),
};
const createPredictionObjectSchema = z.object(createPredictionSchema);
export type CreatePredictionParams = z.infer<
  typeof createPredictionObjectSchema
>;

export const imageGenerationSchema = {
  ...createPredictionSchema,
  support_image_mcp_response_type: z
    .boolean()
    .default(true)
    .describe(
      "Disable if the image type is not supported in the response, if it's Cursor app for example"
    ),
};
const imageGenerationObjectSchema = z.object(imageGenerationSchema);
export type ImageGenerationParams = z.infer<typeof imageGenerationObjectSchema>;

export const svgGenerationSchema = {
  prompt: z.string().min(1).describe("Prompt for generated SVG"),
  size: z
    .enum([
      "1024x1024",
      "1365x1024",
      "1024x1365",
      "1536x1024",
      "1024x1536",
      "1820x1024",
      "1024x1820",
      "1024x2048",
      "2048x1024",
      "1434x1024",
      "1024x1434",
      "1024x1280",
      "1280x1024",
      "1024x1707",
      "1707x1024",
    ])
    .default("1024x1024")
    .describe("Size of the generated SVG"),
  style: z
    .enum(["any", "engraving", "line_art", "line_circuit", "linocut"])
    .default("any")
    .describe("Style of the generated image."),
};
const svgGenerationObjectSchema = z.object(svgGenerationSchema);
export type SvgGenerationParams = z.infer<typeof svgGenerationObjectSchema>;

export const predictionListSchema = {
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(50)
    .describe("Maximum number of predictions to return"),
};
const predictionListObjectSchema = z.object(predictionListSchema);
export type PredictionListParams = z.infer<typeof predictionListObjectSchema>;

export const getPredictionSchema = {
  predictionId: z.string().min(1).describe("ID of the prediction to retrieve"),
};
const getPredictionObjectSchema = z.object(getPredictionSchema);
export type GetPredictionParams = z.infer<typeof getPredictionObjectSchema>;

export const multiImageGenerationSchema = {
  prompts: z
    .array(z.string().min(1))
    .min(1)
    .max(10)
    .describe("Array of text descriptions for the images to generate"),
  model_id: z
    .string()
    .min(1)
    .optional()
    .describe("Optional Replicate model id (allowlist only)"),
  seed: z
    .number()
    .int()
    .optional()
    .describe("Random seed. Set for reproducible generation"),
  go_fast: z
    .boolean()
    .default(true)
    .describe(
      "Run faster predictions with model optimized for speed (currently fp8 quantized); disable to run in original bf16"
    ),
  megapixels: z
    .enum(["1", "0.25"])
    .default("1")
    .describe("Approximate number of megapixels for generated image"),
  aspect_ratio: z
    .enum([
      "1:1",
      "16:9",
      "21:9",
      "3:2",
      "2:3",
      "4:5",
      "5:4",
      "3:4",
      "4:3",
      "9:16",
      "9:21",
    ])
    .default("1:1")
    .describe("Aspect ratio for the generated image"),
  output_format: z
    .enum(["webp", "jpg", "png"])
    .default("webp")
    .describe("Format of the output images"),
  output_quality: z
    .number()
    .int()
    .min(0)
    .max(100)
    .default(80)
    .describe(
      "Quality when saving the output images, from 0 to 100. 100 is best quality, 0 is lowest quality. Not relevant for .png outputs"
    ),
  num_inference_steps: z
    .number()
    .int()
    .min(1)
    .max(4)
    .default(4)
    .describe(
      "Number of denoising steps. 4 is recommended, and lower number of steps produce lower quality outputs, faster."
    ),
  disable_safety_checker: z
    .boolean()
    .default(false)
    .describe("Disable safety checker for generated images."),
  support_image_mcp_response_type: z
    .boolean()
    .default(true)
    .describe(
      "Disable if the image type is not supported in the response, if it's Cursor app for example"
    ),
};
const multiImageGenerationObjectSchema = z.object(multiImageGenerationSchema);
export type MultiImageGenerationParams = z.infer<
  typeof multiImageGenerationObjectSchema
>;

export const imageVariantsGenerationSchema = {
  prompt: z
    .string()
    .min(1)
    .describe("Text description for the image to generate variants of"),
  model_id: z
    .string()
    .min(1)
    .optional()
    .describe("Optional Replicate model id (allowlist only)"),
  num_variants: z
    .number()
    .int()
    .min(2)
    .max(10)
    .default(4)
    .describe("Number of image variants to generate (2-10)"),
  prompt_variations: z
    .array(z.string())
    .optional()
    .describe(
      "Optional list of prompt modifiers to apply to variants (e.g., ['in watercolor style', 'in oil painting style']). If provided, these will be used instead of random seeds."
    ),
  variation_mode: z
    .enum(["append", "replace"])
    .default("append")
    .describe(
      "How to apply prompt variations: 'append' adds to the base prompt, 'replace' uses variations as standalone prompts"
    ),
  seed: z
    .number()
    .int()
    .optional()
    .describe(
      "Base random seed. Each variant will use seed+variant_index for reproducibility"
    ),
  go_fast: z
    .boolean()
    .default(true)
    .describe(
      "Run faster predictions with model optimized for speed (currently fp8 quantized); disable to run in original bf16"
    ),
  megapixels: z
    .enum(["1", "0.25"])
    .default("1")
    .describe("Approximate number of megapixels for generated image"),
  aspect_ratio: z
    .enum([
      "1:1",
      "16:9",
      "21:9",
      "3:2",
      "2:3",
      "4:5",
      "5:4",
      "3:4",
      "4:3",
      "9:16",
      "9:21",
    ])
    .default("1:1")
    .describe("Aspect ratio for the generated image"),
  output_format: z
    .enum(["webp", "jpg", "png"])
    .default("webp")
    .describe("Format of the output images"),
  output_quality: z
    .number()
    .int()
    .min(0)
    .max(100)
    .default(80)
    .describe(
      "Quality when saving the output images, from 0 to 100. 100 is best quality, 0 is lowest quality. Not relevant for .png outputs"
    ),
  num_inference_steps: z
    .number()
    .int()
    .min(1)
    .max(4)
    .default(4)
    .describe(
      "Number of denoising steps. 4 is recommended, and lower number of steps produce lower quality outputs, faster."
    ),
  disable_safety_checker: z
    .boolean()
    .default(false)
    .describe("Disable safety checker for generated images."),
  support_image_mcp_response_type: z
    .boolean()
    .default(true)
    .describe("Support image MCP response type on client side"),
};
const imageVariantsGenerationObjectSchema = z.object(
  imageVariantsGenerationSchema
);
export type ImageVariantsGenerationParams = z.infer<
  typeof imageVariantsGenerationObjectSchema
>;

export const runModelSchema = {
  model_id: z
    .string()
    .min(1)
    .describe("Replicate model id to run (allowlist only)"),
  input: z
    .record(z.unknown())
    .optional()
    .describe("Input payload for the selected model"),
};
const runModelObjectSchema = z.object(runModelSchema);
export type RunModelParams = z.infer<typeof runModelObjectSchema>;
