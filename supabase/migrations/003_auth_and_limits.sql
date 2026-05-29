-- Migration: Add user authentication and limit to 1 jersey per user

-- Add user_id column to jerseys table
ALTER TABLE jerseys ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS idx_jerseys_user_id ON jerseys(user_id);

-- Function to check if user already has a jersey
CREATE OR REPLACE FUNCTION check_user_jersey_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM jerseys 
    WHERE user_id = NEW.user_id
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
  ) THEN
    RAISE EXCEPTION 'User already has a declared jersey. Only one jersey per user is allowed.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce 1 jersey per user
DROP TRIGGER IF EXISTS user_jersey_limit_trigger ON jerseys;
CREATE TRIGGER user_jersey_limit_trigger
  BEFORE INSERT OR UPDATE ON jerseys
  FOR EACH ROW
  WHEN (NEW.user_id IS NOT NULL)
  EXECUTE FUNCTION check_user_jersey_limit();

-- Update RLS policies to require authentication for inserts
DROP POLICY IF EXISTS "Allow public insert" ON jerseys;
DROP POLICY IF EXISTS "Allow authenticated insert" ON jerseys;
DROP POLICY IF EXISTS "Allow users to delete own jersey" ON jerseys;
DROP POLICY IF EXISTS "Allow users to update own jersey" ON jerseys;

-- Allow authenticated users to insert (1 per user enforced by trigger)
CREATE POLICY "Allow authenticated insert" ON jerseys
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own jersey
CREATE POLICY "Allow users to delete own jersey" ON jerseys
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to update their own jersey
CREATE POLICY "Allow users to update own jersey" ON jerseys
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update fuzzy search function to include user_id
DROP FUNCTION IF EXISTS search_jerseys_fuzzy(text);

CREATE OR REPLACE FUNCTION search_jerseys_fuzzy(search_query TEXT)
RETURNS TABLE (
  id UUID,
  flocage TEXT,
  size TEXT,
  twitter_handle TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ,
  user_id UUID,
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
    j.user_id,
    similarity(j.flocage, search_query) as similarity_score
  FROM jerseys j
  WHERE 
    (j.flocage % search_query OR j.flocage ILIKE '%' || search_query || '%')
  ORDER BY 
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

-- Note: To enable X (Twitter) OAuth, configure in Supabase Dashboard:
-- Authentication > Providers > Twitter (X)
-- You'll need to create an app at https://developer.twitter.com/en/portal/projects-and-apps