# Replicate Flux MCP

[English](README.md) | **中文**

本项目是一个 Model Context Protocol (MCP) 服务器，默认使用 Replicate “Try for Free” 集合中的免费模型：`black-forest-labs/flux-1.1-pro`（图片）和 `luma/reframe-video`（SVG/视频占位）。你可以通过环境变量切换到任意模型（如 `black-forest-labs/flux-schnell`、`recraft-ai/recraft-v3-svg`）。

> 免费模型列表：<https://replicate.com/collections/try-for-free>

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
   REPLICATE_IMAGE_MODEL_ID="black-forest-labs/flux-schnell" \
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
不填 `REPLICATE_IMAGE_MODEL_ID` / `REPLICATE_SVG_MODEL_ID` 时会使用免费默认模型，启动即可使用。

## 模型配置
- 默认：图片 `black-forest-labs/flux-1.1-pro`，SVG `luma/reframe-video`（均在 Try for Free）。
- 覆盖：通过环境变量 `REPLICATE_IMAGE_MODEL_ID` / `REPLICATE_SVG_MODEL_ID` 设置任意 Replicate 模型。
- 免费模型列表：<https://replicate.com/collections/try-for-free>

## 故障排查
- 认证错误：确认 `REPLICATE_API_TOKEN` 有效。
- 超时：增大 `pollingAttempts` 或 `pollingInterval`（见 `src/config/index.ts`）。
- 模型不可用：确认所选模型在你的账户下可用或在 Try for Free 配额内。

