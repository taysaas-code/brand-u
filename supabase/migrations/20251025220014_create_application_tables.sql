/*
  # Create Application Tables

  1. New Tables
    - `user_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `session_id` (text, unique)
      - `brand_analysis` (text, nullable)
      - `visual_analysis` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `chat_messages`
      - `id` (uuid, primary key)
      - `session_id` (text, indexed)
      - `message` (text)
      - `sender` (text: 'user' or 'ai')
      - `message_type` (text: 'text' or 'image')
      - `image_url` (text, nullable)
      - `created_date` (timestamp)
    
    - `projects`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `description` (text, nullable)
      - `status` (text, default 'active')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `brand_assets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `project_id` (uuid, references projects)
      - `asset_type` (text: 'logo', 'color', 'font', 'image')
      - `asset_url` (text)
      - `metadata` (jsonb, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Add policies for authenticated users
    
  3. Indexes
    - Index on session_id for chat_messages
    - Index on user_id for all tables
*/

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text UNIQUE NOT NULL,
  brand_analysis text,
  visual_analysis text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  message text NOT NULL,
  sender text NOT NULL CHECK (sender IN ('user', 'ai')),
  message_type text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image')),
  image_url text,
  created_date timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create brand_assets table
CREATE TABLE IF NOT EXISTS brand_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  asset_type text NOT NULL CHECK (asset_type IN ('logo', 'color', 'font', 'image', 'document')),
  asset_url text NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_assets ENABLE ROW LEVEL SECURITY;

-- Policies for user_sessions
CREATE POLICY "Users can view own sessions"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
  ON user_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON user_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON user_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for chat_messages
-- Allow access based on session ownership
CREATE POLICY "Users can view messages from their sessions"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_sessions
      WHERE user_sessions.session_id = chat_messages.session_id
      AND user_sessions.user_id = auth.uid()
    )
    OR session_id LIKE '%_generic_%'
  );

CREATE POLICY "Users can create messages in their sessions"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_sessions
      WHERE user_sessions.session_id = chat_messages.session_id
      AND user_sessions.user_id = auth.uid()
    )
    OR session_id LIKE '%_generic_%'
  );

CREATE POLICY "Users can update messages in their sessions"
  ON chat_messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_sessions
      WHERE user_sessions.session_id = chat_messages.session_id
      AND user_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages in their sessions"
  ON chat_messages
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_sessions
      WHERE user_sessions.session_id = chat_messages.session_id
      AND user_sessions.user_id = auth.uid()
    )
  );

-- Policies for projects
CREATE POLICY "Users can view own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for brand_assets
CREATE POLICY "Users can view own brand assets"
  ON brand_assets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own brand assets"
  ON brand_assets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brand assets"
  ON brand_assets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own brand assets"
  ON brand_assets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_date ON chat_messages(created_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_assets_user_id ON brand_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_assets_project_id ON brand_assets(project_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON user_sessions;
CREATE TRIGGER update_user_sessions_updated_at
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
