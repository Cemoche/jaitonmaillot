-- Enable pg_trgm extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS search_jerseys_fuzzy(text);

-- Create function for fuzzy search with similarity ordering
CREATE OR REPLACE FUNCTION search_jerseys_fuzzy(search_query TEXT)
RETURNS TABLE (
  id UUID,
  flocage TEXT,
  size TEXT,
  twitter_handle TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ,
  similarity_score REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.id,
    j.flocage,
    j.size,
    j.twitter_handle,
    j.photo_url,
    j.created_at,
    similarity(j.flocage, search_query) as similarity_score
  FROM jerseys j
  WHERE 
    -- Fuzzy match: similarity above threshold OR exact substring match
    (j.flocage % search_query OR j.flocage ILIKE '%' || search_query || '%')
  ORDER BY 
    -- Prioritize exact matches, then by similarity score
    CASE WHEN j.flocage ILIKE search_query THEN 3
         WHEN j.flocage ILIKE search_query || '%' THEN 2
         WHEN j.flocage ILIKE '%' || search_query || '%' THEN 1
         ELSE 0 
    END DESC,
    similarity_score DESC,
    j.created_at DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Create trigram index for fast fuzzy search
CREATE INDEX IF NOT EXISTS idx_jerseys_flocage_trgm ON jerseys USING gin (flocage gin_trgm_ops);

-- Update the similarity threshold (optional, default is 0.3)
-- SET pg_trgm.similarity_threshold = 0.3;