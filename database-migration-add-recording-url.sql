-- Add recording_url column to interview_sessions table
ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS recording_url TEXT;

-- Add comment
COMMENT ON COLUMN interview_sessions.recording_url IS 'URL to the call recording from Retell';
