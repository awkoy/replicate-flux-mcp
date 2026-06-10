import { replicate } from "../services/replicate.js";
import { handleError } from "../utils/error.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { GetModelSchemaParams } from "../types/index.js";

export const registerGetModelSchemaTool = async ({
  model,
}: GetModelSchemaParams): Promise<CallToolResult> => {
  try {
    const [owner, name] = model.split("/");
    const info = await replicate.models.get(owner, name);
    const schema =
      info.latest_version?.openapi_schema ??
      "No schema published for this model.";

    return {
      content: [
        {
          type: "text",
          text:
            `Model: ${owner}/${name}\n` +
            `Latest version: ${info.latest_version?.id ?? "unknown"}\n` +
            `Description: ${info.description ?? ""}\n\n` +
            `OpenAPI schema:\n${JSON.stringify(schema, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return handleError(error);
  }
};
