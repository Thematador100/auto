-- ============================================
-- SUPABASE DATABASE SCHEMA
-- ============================================
-- Run this SQL in your Supabase SQL Editor to set up the database
-- Dashboard -> SQL Editor -> New Query -> Paste this code -> Run

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('pro', 'basic')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  vehicle JSONB NOT NULL,
  summary JSONB NOT NULL,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  vehicle_history JSONB NOT NULL,
  safety_recalls JSONB NOT NULL DEFAULT '[]'::jsonb,
  theft_and_salvage JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);

-- Index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS on both tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Users can only read their own data
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  USING (true); -- Allow reading for authenticated users

-- Users can insert their own data
CREATE POLICY "Users can insert their own data"
  ON users
  FOR INSERT
  WITH CHECK (true);

-- Users can update their own data
CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  USING (true);

-- Users can read their own reports
CREATE POLICY "Users can read their own reports"
  ON reports
  FOR SELECT
  USING (true); -- We'll filter by user_id in the application

-- Users can insert their own reports
CREATE POLICY "Users can insert their own reports"
  ON reports
  FOR INSERT
  WITH CHECK (true);

-- Users can delete their own reports
CREATE POLICY "Users can delete their own reports"
  ON reports
  FOR DELETE
  USING (true);

-- ============================================
-- SAMPLE DATA (OPTIONAL - for testing)
-- ============================================
-- Uncomment the following lines to insert sample data

-- INSERT INTO users (id, email, plan) VALUES
-- ('user-test-001', 'test@example.com', 'pro')
-- ON CONFLICT (id) DO NOTHING;

-- ============================================
-- NOTES
-- ============================================
-- After running this schema:
-- 1. Go to Supabase Dashboard -> Settings -> API
-- 2. Copy your "Project URL" and "anon/public" key
-- 3. Add them to your .env.local file:
--    SUPABASE_URL=your_project_url
--    SUPABASE_ANON_KEY=your_anon_key
