-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_tags ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Notes Policies (Strict user isolation)
CREATE POLICY "Users can manage own notes" ON public.notes
  FOR ALL USING (auth.uid() = user_id);

-- Note Chunks Policies (Strict user isolation for RAG)
CREATE POLICY "Users can manage own note_chunks" ON public.note_chunks
  FOR ALL USING (auth.uid() = user_id);

-- Tags Policies
CREATE POLICY "Authenticated users can view tags" ON public.tags
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert tags" ON public.tags
  FOR INSERT TO authenticated WITH CHECK (true);

-- Note Tags Policies
CREATE POLICY "Users can manage own note_tags" ON public.note_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.notes
      WHERE notes.id = note_tags.note_id AND notes.user_id = auth.uid()
    )
  );

-- Bible References Cache Policy (Readable by all authenticated users)
ALTER TABLE public.bible_references ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view cached bible references" ON public.bible_references
  FOR SELECT TO authenticated USING (true);
