export const CONFIG = {
  serverName: "replicate-flux-mcp",
  serverVersion: "0.4.0",
  imageModelId: "black-forest-labs/flux-schnell" as `${string}/${string}`,
  svgModelId: "recraft-ai/recraft-v3-svg" as `${string}/${string}`,
  pollingAttempts: 25,
  pollingInterval: 2000, // ms
  modelAllowlistConfigured: process.env.REPLICATE_MODEL_ALLOWLIST !== undefined,
  modelAllowlist: (process.env.REPLICATE_MODEL_ALLOWLIST ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
};
