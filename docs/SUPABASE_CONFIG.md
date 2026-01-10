# Supabase Configuration for Direct Login

## Important: Disable Email Confirmation

For the direct login flow to work, you MUST disable email confirmation in Supabase:

### Steps:

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers** → **Email**
3. **Disable** "Confirm email" option
4. Click **Save**

This allows users to sign up and log in immediately without waiting for email confirmation.

## Email Issues in Development

### Problem: Not Receiving Login Emails

If returning users don't receive magic link emails when signing in, this is because:
- **Supabase doesn't send emails in local development by default**
- You need to configure SMTP settings OR use an alternative approach

### Solution 1: Configure SMTP (Recommended for Production)

1. Go to Supabase Dashboard → **Project Settings** → **Auth**
2. Scroll to **SMTP Settings**
3. Configure your email provider (Gmail, SendGrid, etc.)
4. Test email sending

### Solution 2: Use Supabase Inbucket (Development Only)

1. Go to your Supabase project
2. Navigate to **Authentication** → **Email Templates**
3. At the bottom, you'll see **Inbucket** link
4. Click it to view emails sent in development
5. Users can copy the magic link from there

### Solution 3: Store Passwords (Simplest)

Instead of magic links for returning users, we can:
1. Store the auto-generated password in the database
2. Allow users to set their own password
3. Use password-based login for returning users

**This is the recommended approach for your use case!**

## Alternative: Enable Email Confirmation

If you want to keep email confirmation enabled:
- Users will need to check their email and click the confirmation link
- After confirmation, they can log in
- The current flow will show a message asking them to check their email

## Security Note

- Each user gets a unique, randomly generated password
- Users don't need to remember passwords
- For returning users, implement a "forgot password" or magic link flow

