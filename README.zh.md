# Replicate Flux MCP

[English](README.md) | **中文**

本项目是一个 Model Context Protocol (MCP) 服务器，默认使用 `black-forest-labs/flux-schnell` 生成图片，使用 `recraft-ai/recraft-v3-svg` 生成 SVG。你可以通过环境变量覆盖默认模型，图片工具也支持通过工具参数 `model_id` 在内置白名单内按次切换模型。

## 目录
- [快速开始](#快速开始)
- [集成方式](#集成方式)
  - [Cursor](#cursor)
  - [Claude Desktop](#claude-desktop)
  - [Smithery](#smithery)
  - [Glama.ai](#glamaai)
  - [Codex](#codex)
- [模型配置](#模型配置)
- [故障排查](#故障排查)

## 快速开始
1. 在 Replicate 获取 `REPLICATE_API_TOKEN`。
2. 任选集成方式运行 `npx -y replicate-flux-mcp`（记得传入 api token）。
3. 通过环境变量可即时切换模型：
   ```bash
   REPLICATE_IMAGE_MODEL_ID="google/imagen-4" \
   REPLICATE_SVG_MODEL_ID="recraft-ai/recraft-v3-svg" \
   REPLICATE_API_TOKEN=你的token \
   npx -y replicate-flux-mcp
   ```

## 集成方式

### Cursor
`.cursor/mcp.json` 示例：
```json
{
  "mcpServers": {
    "replicate-flux-mcp": {
      "command": "env",
      "args": [
        "REPLICATE_API_TOKEN=你的token",
        "REPLICATE_IMAGE_MODEL_ID=可选",
        "REPLICATE_SVG_MODEL_ID=可选",
        "npx", "-y", "replicate-flux-mcp"
      ]
    }
  }
}
```

### Claude Desktop
`mcp.json` 示例略，与 README.md 相同，注意设置环境变量。

### Smithery / Glama.ai
可直接在各自的服务器市场添加 `replicate-flux-mcp`，无需本地部署。

### Codex
`~/.codex/config.toml` 示例：
```toml
[mcp_servers.replicate]
command = "npx"
args = ["-y", "replicate-flux-mcp"]
env = { REPLICATE_API_TOKEN = "your-replicate-api-token", REPLICATE_IMAGE_MODEL_ID = "your-image-model-id", REPLICATE_SVG_MODEL_ID = "your-svg-model-id" }
startup_timeout_sec = 30_000
```
不填 `REPLICATE_IMAGE_MODEL_ID` / `REPLICATE_SVG_MODEL_ID` 时会使用默认模型，启动即可使用。

## 模型配置
- 默认：图片 `black-forest-labs/flux-schnell`，SVG `recraft-ai/recraft-v3-svg`。
- 覆盖：通过环境变量 `REPLICATE_IMAGE_MODEL_ID` / `REPLICATE_SVG_MODEL_ID` 覆盖默认模型；图片工具也可通过参数 `model_id` 按次覆盖。
- 内置白名单：
  - 图片生成：`black-forest-labs/flux-schnell`、`google/imagen-4`、`black-forest-labs/flux-kontext-pro`、`ideogram-ai/ideogram-v3-turbo`、`black-forest-labs/flux-1.1-pro`、`black-forest-labs/flux-dev`
  - SVG 生成：`recraft-ai/recraft-v3-svg`
  - 兼容工具 `run_model` 额外支持：`minimax/video-01`、`luma/reframe-video`、`topazlabs/video-upscale`、`topazlabs/image-upscale`、`szcho/codeformer`、`tencentarc/gfpgan`
- `run_replicate_model` 可用 `REPLICATE_MODEL_ALLOWLIST` 限制可运行模型；不设置表示允许任意模型，设置为空字符串表示拒绝全部。

## 故障排查
- 认证错误：确认 `REPLICATE_API_TOKEN` 有效。
- 超时：增大 `pollingAttempts` 或 `pollingInterval`（见 `src/config/index.ts`）。
- 模型不可用：确认所选模型在对应白名单内，且你的 Replicate 账户有权运行该模型。
