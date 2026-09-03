import { GoogleGenAI } from "@google/genai";
import { withRetry } from "./retry";

export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in .env.local");
  }

  const ai = new GoogleGenAI({ apiKey });

  return withRetry(async () => {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
    });

    const values = (response as any).embedding?.values || (response as any).embeddings?.[0]?.values;
    if (!values) {
      throw new Error("Failed to generate embedding vector");
    }

    return values;
  });
}
