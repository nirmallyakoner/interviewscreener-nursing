-- Create interview_sessions table for Retell AI calls
CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  retell_call_id TEXT UNIQUE NOT NULL,
  agent_id TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  actual_duration_seconds INTEGER,
  status TEXT DEFAULT 'started' CHECK (status IN ('started', 'completed', 'failed', 'timeout')),
  transcript TEXT,
  analysis JSONB,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
  ON interview_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can insert own sessions"
  ON interview_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can update sessions (for webhook)
CREATE POLICY "Service role can update sessions"
  ON interview_sessions FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_retell_call_id ON interview_sessions(retell_call_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_status ON interview_sessions(status);
