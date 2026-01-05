# Email Not Working - Quick Fix Guide

## Problem
You're not receiving login emails when using "Sign In" mode because Supabase doesn't send emails in local development without SMTP configuration.

## Quick Solutions

### Option 1: Check Supabase Inbucket (Easiest for Testing)

1. Go to your Supabase project dashboard
2. Click on **Authentication** in the sidebar
3. Scroll down and look for **"Inbucket"** or **"Email Testing"** link
4. Click it - you'll see all emails sent by Supabase
5. Find your magic link email and click the link

**Inbucket URL format**: `https://[your-project-ref].supabase.co/project/default/auth/emails`

### Option 2: Use Sign Up Instead (Temporary Workaround)

For now, if you need to test:
1. Use **"Sign Up"** tab instead of "Sign In"
2. Enter your email and details
3. You'll be logged in immediately
4. This creates a new account each time (not ideal for production)

### Option 3: Configure SMTP (For Production)

To actually send emails:

1. Go to Supabase Dashboard
2. **Project Settings** → **Auth** → **SMTP Settings**
3. Configure with your email provider:
   - **Gmail**: Use app-specific password
   - **SendGrid**: Free tier available
   - **Resend**: Developer-friendly

### Option 4: Simplify Login (Recommended)

I can modify the app to:
- Store a simple password for each user
- Let users set their own password
- Use regular email/password login for returning users

**Would you like me to implement Option 4?** This would eliminate the need for magic links entirely.

## Why This Happens

- Supabase requires SMTP configuration to send emails
- In development, emails are captured in Inbucket instead of being sent
- In production, you must configure SMTP or use Supabase's email service

## Next Steps

Let me know which option you'd prefer:
1. **Check Inbucket** (quick test)
2. **Configure SMTP** (production-ready)
3. **Simplify to password login** (easiest for users)
