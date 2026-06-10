import { FileOutput } from "replicate";

export function mimeFor(format: string): string {
  return format === "jpg" ? "image/jpeg" : `image/${format}`;
}

async function fetchWithAuth(url: string): Promise<Response> {
  return fetch(url, {
    headers: { Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}` },
  });
}

export async function outputToBase64(output: FileOutput): Promise<string> {
  const blob = await output.blob();
  const buffer = Buffer.from(await blob.arrayBuffer());
  return buffer.toString("base64");
}

export async function urlToSvg(url: string): Promise<string> {
  try {
    const response = await fetchWithAuth(url);
    return response.text();
  } catch {
    throw new Error("Error fetching svg");
  }
}

export async function urlToBase64(url: string): Promise<string> {
  try {
    const response = await fetchWithAuth(url);
    const blob = await response.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());
    return buffer.toString("base64");
  } catch {
    throw new Error("Error fetching image");
  }
}
