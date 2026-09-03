"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Note } from "@/types/notes";
import { indexNoteForVectorSearch } from "@/lib/rag/vector-sync";

export async function getNotes(searchQuery?: string, tagFilter?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("notes")
    .select("*, note_tags(tags(name))")
    .order("date", { ascending: false });

  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%,speaker.ilike.%${searchQuery}%,church.ilike.%${searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching notes:", error);
    return [];
  }

  const formattedNotes: Note[] = data.map((item: any) => {
    const tags = item.note_tags?.map((nt: any) => nt.tags?.name).filter(Boolean) || [];
    return {
      ...item,
      tags,
    };
  });

  if (tagFilter) {
    return formattedNotes.filter((n) => n.tags?.includes(tagFilter));
  }

  return formattedNotes;
}

export async function getNoteById(id: string): Promise<Note | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notes")
    .select("*, note_tags(tags(name))")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  const tags = data.note_tags?.map((nt: any) => nt.tags?.name).filter(Boolean) || [];
  return {
    ...data,
    tags,
  };
}

export async function createNote(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const date = (formData.get("date") as string) || new Date().toISOString().split("T")[0];
  const speaker = (formData.get("speaker") as string) || null;
  const church = (formData.get("church") as string) || null;
  const rawTags = (formData.get("tags") as string) || "";

  const { data: note, error } = await supabase
    .from("notes")
    .insert({
      user_id: user.id,
      title,
      content,
      date,
      speaker,
      church,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating note:", error);
    throw new Error(error.message);
  }

  // Trigger background pgvector RAG indexing
  try {
    await indexNoteForVectorSearch(note.id, user.id, content);
  } catch (err) {
    console.warn("Vector indexing error:", err);
  }

  // Handle Tags
  const tagNames = rawTags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
  for (const name of tagNames) {
    let { data: tag } = await supabase.from("tags").select("id").eq("name", name).single();
    if (!tag) {
      const { data: newTag } = await supabase.from("tags").insert({ name }).select("id").single();
      tag = newTag;
    }
    if (tag) {
      await supabase.from("note_tags").insert({ note_id: note.id, tag_id: tag.id });
    }
  }

  revalidatePath("/notes");
  return redirect(`/notes/${note.id}`);
}

export async function updateNote(id: string, formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const date = formData.get("date") as string;
  const speaker = (formData.get("speaker") as string) || null;
  const church = (formData.get("church") as string) || null;
  const rawTags = (formData.get("tags") as string) || "";

  const { error } = await supabase
    .from("notes")
    .update({
      title,
      content,
      date,
      speaker,
      church,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating note:", error);
    throw new Error(error.message);
  }

  // Re-index vector chunks for RAG search
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    try {
      await indexNoteForVectorSearch(id, user.id, content);
    } catch (err) {
      console.warn("Vector re-indexing error:", err);
    }
  }

  // Update Tags
  await supabase.from("note_tags").delete().eq("note_id", id);
  const tagNames = rawTags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
  for (const name of tagNames) {
    let { data: tag } = await supabase.from("tags").select("id").eq("name", name).single();
    if (!tag) {
      const { data: newTag } = await supabase.from("tags").insert({ name }).select("id").single();
      tag = newTag;
    }
    if (tag) {
      await supabase.from("note_tags").insert({ note_id: id, tag_id: tag.id });
    }
  }

  revalidatePath("/notes");
  revalidatePath(`/notes/${id}`);
  return redirect(`/notes/${id}`);
}

export async function deleteNote(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("notes").delete().eq("id", id);

  if (error) {
    console.error("Error deleting note:", error);
    throw new Error(error.message);
  }

  revalidatePath("/notes");
  return redirect("/notes");
}
