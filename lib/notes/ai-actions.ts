"use server";

import { createClient } from "@/lib/supabase/server";
import { generateSermonSummary } from "@/lib/ai/gemini";
import { revalidatePath } from "next/cache";

export async function summarizeNoteAction(noteId: string) {
  const supabase = await createClient();

  const { data: note, error } = await supabase
    .from("notes")
    .select("title, content")
    .eq("id", noteId)
    .single();

  if (error || !note) {
    throw new Error("Note not found");
  }

  const aiResult = await generateSermonSummary(note.title, note.content);

  // Cache AI summary in Supabase notes table
  await supabase
    .from("notes")
    .update({ ai_summary: aiResult })
    .eq("id", noteId);

  revalidatePath(`/notes/${noteId}`);
  return aiResult;
}
