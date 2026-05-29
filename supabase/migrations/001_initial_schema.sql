-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create jerseys table
CREATE TABLE IF NOT EXISTS jerseys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  flocage TEXT NOT NULL,
  size TEXT,
  twitter_handle TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast search
CREATE INDEX IF NOT EXISTS idx_jerseys_flocage ON jerseys USING btree (flocage);

-- Enable Row Level Security
ALTER TABLE jerseys ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read
CREATE POLICY "Allow public read access" ON jerseys
  FOR SELECT USING (true);

-- Create policy to allow anyone to insert (no auth required)
CREATE POLICY "Allow public insert" ON jerseys
  FOR INSERT WITH CHECK (true);

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('jersey-photos', 'jersey-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to jersey-photos bucket
CREATE POLICY "Allow public read access to jersey-photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'jersey-photos');

CREATE POLICY "Allow public upload to jersey-photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'jersey-photos');

-- Add rate limiting function (basic spam protection)
CREATE OR REPLACE FUNCTION check_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM jerseys 
    WHERE created_at > NOW() - INTERVAL '1 minute'
    HAVING COUNT(*) > 10
  ) THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please wait a moment.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for rate limiting
DROP TRIGGER IF EXISTS rate_limit_trigger ON jerseys;
CREATE TRIGGER rate_limit_trigger
  BEFORE INSERT ON jerseys
  EXECUTE FUNCTION check_rate_limit();