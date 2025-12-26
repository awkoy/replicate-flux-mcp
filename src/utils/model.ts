import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { CONFIG } from "../config/index.js";

export type ReplicateModelId =
  | `${string}/${string}`
  | `${string}/${string}:${string}`;

export const IMAGE_GENERATION_MODEL_IDS = [
  "google/imagen-4",
  "black-forest-labs/flux-kontext-pro",
  "ideogram-ai/ideogram-v3-turbo",
  "black-forest-labs/flux-1.1-pro",
  "black-forest-labs/flux-dev",
] as const satisfies readonly ReplicateModelId[];

export const VIDEO_MODEL_IDS = [
  "minimax/video-01",
  "luma/reframe-video",
  "topazlabs/video-upscale",
] as const satisfies readonly ReplicateModelId[];

export const IMAGE_RESTORE_MODEL_IDS = [
  "topazlabs/image-upscale",
  "szcho/codeformer",
  "tencentarc/gfpgan",
] as const satisfies readonly ReplicateModelId[];

const IMAGE_MODEL_SET = new Set<ReplicateModelId>(IMAGE_GENERATION_MODEL_IDS);
const VIDEO_MODEL_SET = new Set<ReplicateModelId>(VIDEO_MODEL_IDS);
const ALL_ALLOWED_MODEL_IDS = new Set<string>([
  ...IMAGE_GENERATION_MODEL_IDS,
  ...VIDEO_MODEL_IDS,
  ...IMAGE_RESTORE_MODEL_IDS,
]);

function formatAllowed(modelIds: readonly string[]) {
  return modelIds.join(", ");
}

export function resolveImageModelId(requested?: string): ReplicateModelId {
  const modelId = (requested ?? CONFIG.imageModelId) as ReplicateModelId;
  if (!IMAGE_MODEL_SET.has(modelId)) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `model_id "${modelId}" is not allowed for image generation. Allowed: ${formatAllowed(
        IMAGE_GENERATION_MODEL_IDS
      )}.`
    );
  }
  return modelId;
}

export function resolveSvgModelId(requested?: string): ReplicateModelId {
  const modelId = (requested ?? CONFIG.svgModelId) as ReplicateModelId;
  if (!VIDEO_MODEL_SET.has(modelId)) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `model_id "${modelId}" is not allowed for SVG/video placeholder output. Allowed: ${formatAllowed(
        VIDEO_MODEL_IDS
      )}.`
    );
  }
  return modelId;
}

export function assertAllowedModelId(
  modelId: string
): asserts modelId is ReplicateModelId {
  if (!ALL_ALLOWED_MODEL_IDS.has(modelId)) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `model_id "${modelId}" is not in the allowlist. Allowed: ${formatAllowed(
        [...IMAGE_GENERATION_MODEL_IDS, ...VIDEO_MODEL_IDS, ...IMAGE_RESTORE_MODEL_IDS]
      )}.`
    );
  }
}
