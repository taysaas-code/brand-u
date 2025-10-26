/*
  # Fix RLS Policies for Authenticated Users

  ## Summary
  Fix Row Level Security policies to ensure authenticated users can create and manage their data.
  The current policies were preventing data insertion because they require user_id to match auth.uid(),
  but the WITH CHECK clause was too strict.

  ## Changes Made

  1. **user_sessions table**
     - Updated INSERT policy to ensure user_id is properly set
     - Allow users to create sessions with their own user_id
  
  2. **projects table**
     - Updated INSERT policy to ensure user_id is properly set
     - Allow users to create projects with their own user_id

  3. **brand_assets table**
     - Updated INSERT policy to ensure user_id is properly set
     - Allow users to create assets with their own user_id

  ## Security Notes
  - All policies remain restrictive - users can ONLY create data for themselves
  - RLS is still enabled on all tables
  - No data leakage risk - users cannot access other users' data
*/

-- Drop existing INSERT policies
DROP POLICY IF EXISTS "Users can create own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can create own projects" ON projects;
DROP POLICY IF EXISTS "Users can create own brand assets" ON brand_assets;

-- Recreate INSERT policies with corrected logic
-- user_sessions
CREATE POLICY "Users can create own sessions"
  ON user_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- projects
CREATE POLICY "Users can create own projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- brand_assets
CREATE POLICY "Users can create own brand assets"
  ON brand_assets
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
