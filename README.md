# Interviewscreener-Nursing SaaS

A Next.js 14 App Router SaaS application for nursing interview practice, powered by Supabase and Retell AI.

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend/Database/Auth**: Supabase (Database + Auth + SSR)
- **Voice Engine**: Retell AI SDK (integration ready)

## 🎯 User Flow

1. **Landing Page** (`/`) - Users see the marketing page with course information
2. **Registration** (`/login`) - Users enter their name, email, and select course (BSc/Post Basic/GNM)
3. **Magic Link** - Users receive a secure login link via email
4. **Dashboard** (`/dashboard`) - Users access their personalized dashboard with credits and interview options

## 📁 Project Structure

```
interviewscreener-nursing/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── interview/
│   │   │       └── route.ts          # Interview API with credit checking
│   │   ├── auth/
│   │   │   ├── callback/
│   │   │   │   └── route.ts          # Auth callback handler
│   │   │   └── signout/
│   │   │       └── route.ts          # Sign out route
│   │   ├── components/
│   │   │   └── StartInterviewButton.tsx  # Client component for interview
│   │   ├── dashboard/
│   │   │   └── page.tsx              # User dashboard
│   │   ├── login/
│   │   │   └── page.tsx              # Registration/Login page
│   │   ├── layout.tsx
│   │   └── page.tsx                  # Landing page
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts             # Browser Supabase client
│   │       ├── server.ts             # Server Supabase client
│   │       └── middleware.ts         # Session management helper
│   └── middleware.ts                 # Next.js middleware
├── database-schema.sql               # Complete database schema
├── env.example.txt                   # Environment variables template
└── package.json
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd interviewscreener-nursing
npm install
```

### 2. Configure Supabase

#### Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned

#### Set Up Database Schema

Navigate to your Supabase project dashboard → **SQL Editor** and execute the SQL from `database-schema.sql`:

```sql
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
```

#### Configure Email Authentication

1. In Supabase Dashboard → **Authentication** → **Providers**
2. Enable **Email** provider
3. **IMPORTANT**: **Disable** "Confirm email" option for instant login
4. Click **Save**

> **Critical**: For the direct login flow to work, you MUST disable email confirmation. This allows users to sign up and log in immediately without waiting for email verification. See `SUPABASE_CONFIG.md` for more details.

### 3. Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
RETELL_API_KEY=your-retell-api-key
```

**To find your Supabase credentials:**
- Go to Project Settings → API
- Copy the **Project URL** and **anon/public key**

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Authentication Flow

### For New Users (Sign Up)
1. User visits landing page (`/`) and clicks "Get Started"
2. User is redirected to `/login` and selects **"Sign Up"** tab
3. User enters:
   - Full name
   - Email address
   - **Password** (minimum 6 characters)
   - Course type (BSc Nursing, Post Basic, or GNM)
4. User clicks "Create Account" button
5. Account is created and user is **immediately logged in**
6. Redirected to `/dashboard`

### For Returning Users (Sign In)
1. User visits `/login` and selects **"Sign In"** tab
2. User enters:
   - Email address
   - **Password**
3. User clicks "Sign In" button
4. User is logged in and redirected to `/dashboard`

> **Note**: Disable email confirmation in Supabase for instant login. See `SUPABASE_CONFIG.md` for instructions.

## 🎯 API Endpoints

### POST `/api/interview`

Starts an interview session with credit validation.

**Authentication**: Required (via Supabase session)

**Response**:
```json
{
  "success": true,
  "message": "Interview session started",
  "remaining_credits": 2
}
```

**Error Responses**:
- `401`: Unauthorized (not logged in)
- `403`: Insufficient credits
- `500`: Server error

## 📊 Database Schema

### `profiles` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, references `auth.users(id)` |
| `name` | TEXT | User's full name (required) |
| `email` | TEXT | User's email address (unique) |
| `course_type` | TEXT | Course selection: 'BSc Nursing', 'Post Basic', or 'GNM' |
| `interview_credits` | INTEGER | Number of available interview credits |
| `created_at` | TIMESTAMP | Account creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

**Default Credits**: New users receive 3 free credits automatically via database trigger.

**Course Types**: The system supports three nursing courses:
- **BSc Nursing** - Bachelor of Science in Nursing
- **Post Basic** - Post Basic Nursing certification
- **GNM** - General Nursing and Midwifery

## 🔌 Retell AI Integration

The `/api/interview` route includes a placeholder for Retell AI SDK integration. To complete the integration:

1. Install Retell AI SDK (check their documentation for the package name)
2. Add your `RETELL_API_KEY` to `.env.local`
3. Uncomment and configure the Retell AI API call in `src/app/api/interview/route.ts`
4. Update the response to include Retell session data

## 🚧 Next Steps

- [ ] Integrate Retell AI SDK for voice interviews
- [ ] Create dashboard page to display user credits
- [ ] Add payment integration for purchasing credits
- [ ] Build interview history page
- [ ] Add admin panel for managing users and credits
- [ ] Implement Shadcn/UI components for better UX

## 📝 Notes

- **Magic Links**: No password required - users receive a secure login link via email
- **Row Level Security**: Enabled on profiles table to ensure users can only access their own data
- **Automatic Profile Creation**: New users automatically get a profile with 3 free credits
- **Credit System**: Each interview consumes 1 credit; API validates before allowing access

## 🤝 Contributing

This is a SaaS application template. Customize it according to your needs.

## 📄 License

MIT
