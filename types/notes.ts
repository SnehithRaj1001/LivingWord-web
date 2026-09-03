export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  date: string;
  speaker: string | null;
  church: string | null;
  summary: {
    short_summary?: string;
    key_points?: string[];
    themes?: string[];
  } | null;
  ai_summary?: any;
  created_at: string;
  updated_at: string;
  tags?: string[];
}

export interface NoteChunk {
  id: string;
  note_id: string;
  user_id: string;
  chunk_content: string;
  chunk_index: number;
  embedding?: number[];
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface BibleReference {
  id: string;
  reference_key: string;
  passage_text: string;
  translation: string;
  created_at: string;
}
