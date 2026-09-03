"use server";

import { createClient } from "@/lib/supabase/server";
import { askNotesQuestion } from "@/lib/rag/search";

export async function askQuestionAction(question: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return await askNotesQuestion(question, user.id);
}
