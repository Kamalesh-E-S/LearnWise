/*
  # Create roadmaps table

  1. New Tables
    - `roadmaps`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `skill` (text)
      - `timeframe` (text)
      - `current_knowledge` (text)
      - `target_level` (text)
      - `mermaid_code` (text)
      - `nodes` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `roadmaps` table
    - Add policies for CRUD operations
*/

CREATE TABLE roadmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  skill text NOT NULL,
  timeframe text NOT NULL,
  current_knowledge text NOT NULL,
  target_level text NOT NULL,
  mermaid_code text NOT NULL,
  nodes jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own roadmaps"
  ON roadmaps
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own roadmaps"
  ON roadmaps
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own roadmaps"
  ON roadmaps
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roadmaps"
  ON roadmaps
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);