-- Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Create profiles table linked to Supabase Auth users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create notes table
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  speaker TEXT,
  church TEXT,
  summary JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create note_chunks table for pgvector RAG search
CREATE TABLE IF NOT EXISTS public.note_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  chunk_content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding vector(768),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- Create note_tags join table
CREATE TABLE IF NOT EXISTS public.note_tags (
  note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (note_id, tag_id)
);

-- Create bible_references cache table
CREATE TABLE IF NOT EXISTS public.bible_references (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reference_key TEXT UNIQUE NOT NULL,
  passage_text TEXT NOT NULL,
  translation TEXT DEFAULT 'WEB' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
