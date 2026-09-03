-- Create pgvector similarity search function match_note_chunks
CREATE OR REPLACE FUNCTION match_note_chunks (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_user_id uuid
)
RETURNS TABLE (
  id uuid,
  note_id uuid,
  chunk_content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    note_chunks.id,
    note_chunks.note_id,
    note_chunks.chunk_content,
    1 - (note_chunks.embedding <=> query_embedding) AS similarity
  FROM note_chunks
  WHERE note_chunks.user_id = p_user_id
    AND 1 - (note_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY note_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
