-- ============================================
-- Interviewscreener-Nursing Database Schema
-- ============================================

-- Create profiles table with enhanced fields
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  course_type TEXT NOT NULL CHECK (course_type IN ('BSc Nursing', 'Post Basic', 'GNM')),
  interview_credits INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Create policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, course_type, interview_credits)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Student'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'course_type', 'BSc Nursing'),
    3  -- Give 3 free credits to new users
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Migration for existing databases
-- ============================================
-- If you already have a profiles table, run these commands instead:

-- Add new columns
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name TEXT;
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS course_type TEXT CHECK (course_type IN ('BSc Nursing', 'Post Basic', 'GNM'));

-- Update existing records with default values
-- UPDATE profiles SET name = 'Student' WHERE name IS NULL;
-- UPDATE profiles SET course_type = 'BSc Nursing' WHERE course_type IS NULL;

-- Make columns NOT NULL after setting defaults
-- ALTER TABLE profiles ALTER COLUMN name SET NOT NULL;
-- ALTER TABLE profiles ALTER COLUMN course_type SET NOT NULL;

-- Remove old is_gnm column if it exists
-- ALTER TABLE profiles DROP COLUMN IF EXISTS is_gnm;
