/*
  # Create comprehensive_roadmaps table

  This table combines all existing roadmap information and adds new fields for:
  - User inputs (4 fields)
  - LLM response
  - Completion status
  - Checked nodes tracking
*/

CREATE TABLE comprehensive_roadmaps (
  -- Primary key and user reference
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  
  -- Original roadmap fields
  skill text NOT NULL,
  timeframe text NOT NULL,
  current_knowledge text NOT NULL,
  target_level text NOT NULL,
  mermaid_code text NOT NULL,
  nodes jsonb NOT NULL DEFAULT '[]',
  
  -- New user input fields
  input1 text,
  input2 text,
  input3 text,
  input4 text,
  
  -- LLM response and status fields
  llm_response text,
  is_completed boolean DEFAULT false,
  checked_nodes jsonb DEFAULT '[]',  -- Stores the nodes that were clicked
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE comprehensive_roadmaps ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can create their own comprehensive roadmaps"
  ON comprehensive_roadmaps
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own comprehensive roadmaps"
  ON comprehensive_roadmaps
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own comprehensive roadmaps"
  ON comprehensive_roadmaps
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comprehensive roadmaps"
  ON comprehensive_roadmaps
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_comprehensive_roadmaps_updated_at
    BEFORE UPDATE ON comprehensive_roadmaps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
