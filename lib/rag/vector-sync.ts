import { createClient } from "@/lib/supabase/server";
import { chunkText } from "./chunker";
import { generateEmbedding } from "./embeddings";

export async function indexNoteForVectorSearch(noteId: string, userId: string, content: string) {
  const supabase = await createClient();

  // 1. Delete existing chunks for this note
  await supabase.from("note_chunks").delete().eq("note_id", noteId);

  // 2. Split content into logical chunks
  const chunks = chunkText(content);
  if (chunks.length === 0) return;

  // 3. Generate embeddings and insert into note_chunks pgvector table
  for (const chunk of chunks) {
    try {
      const embedding = await generateEmbedding(chunk.content);

      await supabase.from("note_chunks").insert({
        note_id: noteId,
        user_id: userId,
        chunk_content: chunk.content,
        chunk_index: chunk.index,
        embedding: JSON.stringify(embedding),
      });
    } catch (error) {
      console.warn(`Vector indexing failed for note ${noteId} chunk ${chunk.index}:`, error);
    }
  }
}
