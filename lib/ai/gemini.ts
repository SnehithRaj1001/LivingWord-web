import { GoogleGenAI } from "@google/genai";

export interface AISummaryResult {
  summary: string;
  keyLessons: string[];
  themes: string[];
}

export async function generateSermonSummary(noteTitle: string, noteContent: string): Promise<AISummaryResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in .env.local");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are a thoughtful, insightful Christian scripture and sermon assistant.
Analyze the following sermon notes and generate a structured JSON response.

Title: ${noteTitle}
Notes:
${noteContent}

Return strictly a JSON object matching this TypeScript format (do not include markdown formatting like \`\`\`json):
{
  "summary": "Concise 2-3 sentence executive summary of the core message.",
  "keyLessons": ["Lesson 1...", "Lesson 2...", "Lesson 3..."],
  "themes": ["Theme1", "Theme2", "Theme3"]
}`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: prompt,
  });

  const rawText = response.text?.trim() || "";

  // Strip markdown code block wrappers if model returns them
  const cleanedJsonStr = rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "");

  try {
    return JSON.parse(cleanedJsonStr) as AISummaryResult;
  } catch {
    return {
      summary: rawText,
      keyLessons: ["Reflect on God's Word in your daily walk."],
      themes: ["Faith", "Scripture"],
    };
  }
}
