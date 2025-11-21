// Configuration
const imageModelId = (process.env.REPLICATE_IMAGE_MODEL_ID ?? "black-forest-labs/flux-1.1-pro") as `${string}/${string}`;
const svgModelId = (process.env.REPLICATE_SVG_MODEL_ID ?? "luma/reframe-video") as `${string}/${string}`;

export const CONFIG = {
    serverName: "replicate-flux-mcp",
    serverVersion: "0.1.2",
    imageModelId,
    svgModelId,
    pollingAttempts: 25,
    pollingInterval: 2000, // ms
}
