import { z } from "zod";
import { server } from "../server/index.js";
import { GetPromptResult } from "@modelcontextprotocol/sdk/types.js";

const userMessage = (text: string): GetPromptResult["messages"][number] => ({
  role: "user",
  content: { type: "text", text },
});

export const registerAllPrompts = () => {
  server.registerPrompt(
    "logo",
    {
      title: "Logo generation",
      description:
        "Produce a clean, professional logo for a brand using Flux Schnell.",
      argsSchema: {
        brand: z.string().describe("Brand or product name"),
        style: z
          .string()
          .describe("Visual style: e.g. minimalist, modern, vintage, tech")
          .optional(),
        palette: z
          .string()
          .describe("Color palette description, e.g. 'navy and gold'")
          .optional(),
      },
    },
    ({ brand, style, palette }) => ({
      description: `Logo for ${brand}`,
      messages: [
        userMessage(
          `Use the generate_image tool to produce a logo for "${brand}".\n` +
            `Style: ${style ?? "minimalist, modern, vector-friendly"}.\n` +
            `Palette: ${palette ?? "two accent colors with high contrast"}.\n` +
            `Requirements: centered composition, no text artifacts, square aspect_ratio "1:1", output_format "png".`
        ),
      ],
    })
  );

  server.registerPrompt(
    "portrait",
    {
      title: "Portrait generation",
      description:
        "Generate a photoreal portrait with controlled lighting and framing.",
      argsSchema: {
        subject: z.string().describe("Subject description"),
        mood: z
          .string()
          .describe("Mood or atmosphere, e.g. 'soft cinematic dusk'")
          .optional(),
        lens: z
          .string()
          .describe("Lens / framing: e.g. '85mm headshot'")
          .optional(),
      },
    },
    ({ subject, mood, lens }) => ({
      description: `Portrait of ${subject}`,
      messages: [
        userMessage(
          `Use the generate_image tool to produce a photoreal portrait.\n` +
            `Subject: ${subject}.\n` +
            `Mood: ${mood ?? "natural, soft golden hour"}.\n` +
            `Framing: ${lens ?? "85mm headshot, shallow depth of field"}.\n` +
            `Use aspect_ratio "3:4" and output_format "jpg".`
        ),
      ],
    })
  );

  server.registerPrompt(
    "svg-icon",
    {
      title: "SVG icon",
      description: "Produce a single vector icon via the Recraft V3 SVG model.",
      argsSchema: {
        concept: z.string().describe("What the icon should represent"),
        style: z
          .string()
          .describe("Icon style: 'line_art', 'engraving', 'linocut', 'any'")
          .optional(),
      },
    },
    ({ concept, style }) => ({
      description: `SVG icon: ${concept}`,
      messages: [
        userMessage(
          `Use the generate_svg tool to produce a single-concept icon.\n` +
            `Concept: ${concept}.\n` +
            `Style: ${style ?? "line_art"} — keep it simple, legible at 24px, no text.\n` +
            `Use size "1024x1024".`
        ),
      ],
    })
  );

  server.registerPrompt(
    "product-shot",
    {
      title: "Product shot",
      description: "Studio product photography composition.",
      argsSchema: {
        product: z.string().describe("Product being shot"),
        surface: z
          .string()
          .describe("Surface / backdrop, e.g. 'matte white seamless'")
          .optional(),
      },
    },
    ({ product, surface }) => ({
      description: `Product shot: ${product}`,
      messages: [
        userMessage(
          `Use the generate_image tool to produce a studio product photo.\n` +
            `Product: ${product}.\n` +
            `Backdrop: ${surface ?? "matte white seamless with soft shadow"}.\n` +
            `Lighting: large softbox, rim light, clean catchlights.\n` +
            `Use aspect_ratio "1:1" and output_format "jpg".`
        ),
      ],
    })
  );

  server.registerPrompt(
    "isometric-diagram",
    {
      title: "Isometric technical diagram",
      description:
        "Produce an isometric illustration suitable for docs / architecture slides.",
      argsSchema: {
        subject: z.string().describe("What to diagram"),
        emphasis: z
          .string()
          .describe("What to emphasize in the composition")
          .optional(),
      },
    },
    ({ subject, emphasis }) => ({
      description: `Isometric diagram: ${subject}`,
      messages: [
        userMessage(
          `Use the generate_image tool to create an isometric technical illustration.\n` +
            `Subject: ${subject}.\n` +
            `Emphasis: ${emphasis ?? "clear labeling-friendly layout"}.\n` +
            `Style: flat colors, thin line work, no photographic noise.\n` +
            `Use aspect_ratio "16:9" and output_format "png".`
        ),
      ],
    })
  );
};
