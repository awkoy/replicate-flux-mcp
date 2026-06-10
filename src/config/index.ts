const imageModelId = (process.env.REPLICATE_IMAGE_MODEL_ID ??
  "black-forest-labs/flux-schnell") as `${string}/${string}`;
const svgModelId = (process.env.REPLICATE_SVG_MODEL_ID ??
  "recraft-ai/recraft-v3-svg") as `${string}/${string}`;

export const CONFIG = {
  serverName: "replicate-flux-mcp",
  serverVersion: "0.4.0",
  imageModelId,
  svgModelId,
  pollingAttempts: 25,
  pollingInterval: 2000, // ms
  modelAllowlistConfigured: process.env.REPLICATE_MODEL_ALLOWLIST !== undefined,
  modelAllowlist: (process.env.REPLICATE_MODEL_ALLOWLIST ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
};
