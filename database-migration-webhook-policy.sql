-- Migration: Add RLS policy for webhook to update interview sessions
-- Run this in your Supabase SQL Editor

-- This policy allows the service role (used by webhooks) to update interview sessions
-- This is required for the Retell webhook to store call analysis data

-- Drop the policy if it exists (to avoid errors on re-run)
DROP POLICY IF EXISTS "Service role can update sessions" ON interview_sessions;

-- Create the policy
CREATE POLICY "Service role can update sessions"
  ON interview_sessions FOR UPDATE
  USING (true)
  WITH CHECK (true);
