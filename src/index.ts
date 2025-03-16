#!/usr/bin/env node
import { registerAllResources } from "./resources/index.js";
import { startServer } from "./server/index.js";
import { registerAllTools } from "./tools/index.js";

registerAllTools();
registerAllResources();

async function main() {
  try {
    await startServer();
  } catch (error) {
    console.error(
      "Unhandled server error:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error(
    "Unhandled server error:",
    error instanceof Error ? error.message : String(error)
  );
  process.exit(1);
});
