import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "./embeddings";
import { withRetry } from "./retry";
import { GoogleGenAI } from "@google/genai";

export interface RAGSearchResult {
  answer: string;
  sources: {
    noteId: string;
    content: string;
  }[];
}

export async function askNotesQuestion(question: string, userId: string): Promise<RAGSearchResult> {
  const supabase = await createClient();

  // 1. Generate embedding vector for the question using Gemini embedding model
  let matchedChunks: any[] = [];
  let vectorSearchFailed = false;

  try {
    const questionEmbedding = await generateEmbedding(question);

    // Primary: pgvector RPC — pass the raw array, NOT JSON.stringify
    const { data: rpcChunks, error: rpcError } = await supabase.rpc("match_note_chunks", {
      query_embedding: questionEmbedding,
      match_threshold: -1.0, // Accept all cosine distances (best effort)
      match_count: 5,
      p_user_id: userId,
    });

    if (rpcError) {
      console.warn("match_note_chunks RPC error:", rpcError.message);
      vectorSearchFailed = true;
    } else if (rpcChunks && rpcChunks.length > 0) {
      matchedChunks = rpcChunks;
    }
  } catch (err) {
    console.warn("Vector embedding search error:", err);
    vectorSearchFailed = true;
  }

  // 2. Keyword fallback — always run if vector returned nothing
  if (matchedChunks.length === 0) {
    // Pull meaningful words + scripture references (e.g. "27:14", "psalm")
    const cleanQuery = question.toLowerCase().replace(/[^a-z0-9:\s]/g, "");
    const terms = cleanQuery.split(/\s+/).filter(w => w.length >= 2);

    if (terms.length > 0) {
      // Search against note_chunks first (preserves chunked context)
      const chunkConditions = terms.map(t => `chunk_content.ilike.%${t}%`).join(",");
      const { data: chunkMatches } = await supabase
        .from("note_chunks")
        .select("note_id, chunk_content")
        .eq("user_id", userId)
        .or(chunkConditions)
        .limit(5);

      if (chunkMatches && chunkMatches.length > 0) {
        matchedChunks = chunkMatches;
      } else {
        // Fallback to full notes table
        const noteConditions = terms.map(t => `title.ilike.%${t}%,content.ilike.%${t}%`).join(",");
        const { data: noteMatches } = await supabase
          .from("notes")
          .select("id, title, content")
          .eq("user_id", userId)
          .or(noteConditions)
          .limit(5);

        if (noteMatches && noteMatches.length > 0) {
          matchedChunks = noteMatches.map(f => ({
            note_id: f.id,
            chunk_content: `Title: ${f.title}\n${f.content}`,
          }));
        }
      }
    }
  }

  // 3. Synthesize answer using Gemini AI
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const hasNotes = matchedChunks.length > 0;

  const contextText = hasNotes
    ? matchedChunks.map((c: any, i: number) =>
        `--- Personal Note ${i + 1} ---\n${c.chunk_content}`
      ).join("\n\n")
    : null;

  const prompt = `You are "Revelation Retriever" — a warm, deeply knowledgeable personal Bible study companion for a Christian believer who captures their own sermon and devotional notes in a digital notebook called LivingWord.

Your ONE job is to help the believer RECALL and REFLECT on what THEY have already written and learned, then deepen it with biblical insight.

═══════════════════════════════════════════
PERSONAL NOTES RETRIEVED FROM THE NOTEBOOK
═══════════════════════════════════════════
${contextText ?? "No matching notes were found in the notebook for this query."}

═══════════════════════════════════════════
BELIEVER'S QUESTION
═══════════════════════════════════════════
${question}

═══════════════════════════════════════════
HOW TO RESPOND — follow this exact structure:
═══════════════════════════════════════════

${hasNotes ? `## 📖 What You Recorded
Start by summarising and directly quoting the most relevant parts from the Personal Notes above. 
- Explicitly reference each note (e.g. "In your note about [topic], you wrote…").
- Pull out exact phrases or scripture references the user already noted.
- Do NOT paraphrase so heavily that the user's own voice is lost.

## 🔍 Deeper Dive
Expand on what the user wrote with:
- Original language insight (Hebrew / Greek word meanings where relevant)
- Cross-references to other scriptures that reinforce what they wrote
- Theological or historical context that enriches their personal observation

## 🌿 Personal Application
Offer 2-3 concrete, prayerful ways to live out the insight found in their own notes.
Close with a short encouragement that ties back directly to something they personally wrote.` 
: `## 📖 A Starting Point
No personal notes matched this query yet. Briefly note that, then pivot:
- Share what the Bible says on this topic with clear scripture references.
- Give the Hebrew/Greek root meaning of a key word if helpful.
- Provide 2-3 practical reflection questions they could journal as their first note on this topic.
Close with an encouraging invitation to capture their first note on this subject.`}

Keep the tone: warm, pastoral, intellectually honest — like a trusted pastor and scholar speaking one-on-one.
Format with Markdown headings. Be thorough but not verbose — quality over quantity.`;


  const response = await withRetry(() =>
    ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
    })
  );

  const answer = response.text || "Unable to synthesize response.";

  const sources = matchedChunks.map((c: any) => ({
    noteId: c.note_id,
    content: c.chunk_content,
  }));

  return { answer, sources };
}
