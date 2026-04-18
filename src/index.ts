#!/usr/bin/env node
import { registerAllResources } from "./resources/index.js";
import { startServer } from "./server/index.js";
import { registerAllTools } from "./tools/index.js";
import { registerAllPrompts } from "./prompts/index.js";

registerAllTools();
registerAllResources();
registerAllPrompts();

startServer().catch((error: unknown) => {
  console.error(
    "Unhandled server error:",
    error instanceof Error ? error.message : String(error)
  );
  process.exit(1);
});
