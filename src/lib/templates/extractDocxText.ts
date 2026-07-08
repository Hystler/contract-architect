import "server-only";
import mammoth from "mammoth";

export async function extractDocxText(buffer: Buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
