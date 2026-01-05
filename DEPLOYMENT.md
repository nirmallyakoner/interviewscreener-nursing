# 🚀 Deployment Guide - Vercel Hosting

## Why Vercel?
- ✅ **Free tier** - Perfect for your app
- ✅ **Made for Next.js** - Zero configuration
- ✅ **Automatic HTTPS** - Free SSL certificate
- ✅ **Global CDN** - Fast worldwide
- ✅ **Auto deployments** - Push to GitHub = auto deploy

---

## Step 1: Push Code to GitHub

### 1.1 Create a GitHub Repository

1. Go to https://github.com/new
2. Repository name: `interviewscreener-nursing`
3. Make it **Private** (recommended)
4. Click "Create repository"

### 1.2 Initialize Git and Push

Open your terminal in the project folder and run:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Interviewscreener Nursing SaaS"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/interviewscreener-nursing.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy to Vercel

### 2.1 Create Vercel Account

1. Go to https://vercel.com/signup
2. Sign up with your **GitHub account** (easiest)
3. Authorize Vercel to access your GitHub

### 2.2 Import Your Project

1. Click **"Add New..."** → **"Project"**
2. Find `interviewscreener-nursing` in the list
3. Click **"Import"**

### 2.3 Configure Project

**Framework Preset:** Next.js (auto-detected)  
**Root Directory:** `./` (leave as is)  
**Build Command:** `npm run build` (auto-filled)  
**Output Directory:** `.next` (auto-filled)

### 2.4 Add Environment Variables

Click **"Environment Variables"** and add these:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `RETELL_API_KEY` | Your Retell AI API key (if you have it) |

**Where to find Supabase credentials:**
- Go to your Supabase project
- Settings → API
- Copy "Project URL" and "anon/public" key

### 2.5 Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://interviewscreener-nursing.vercel.app`

---

## Step 3: Configure Supabase for Production

### 3.1 Update Supabase Auth Settings

1. Go to your Supabase Dashboard
2. **Authentication** → **URL Configuration**
3. Add your Vercel URL to **Site URL**:
   ```
   https://your-project-name.vercel.app
   ```
4. Add to **Redirect URLs**:
   ```
   https://your-project-name.vercel.app/auth/callback
   https://your-project-name.vercel.app/**
   ```

### 3.2 Disable Email Confirmation (if not done)

1. **Authentication** → **Providers** → **Email**
2. **Disable** "Confirm email"
3. Click **Save**

---

## Step 4: Test Your Production Site

1. Visit your Vercel URL
2. Test the complete flow:
   - ✅ Landing page loads
   - ✅ Sign up with email/password
   - ✅ Redirects to dashboard
   - ✅ Profile page works
   - ✅ Sign out works
   - ✅ Sign in works

---

## Step 5: Custom Domain (Optional)

### If you have a domain (e.g., interviewscreener.com):

1. In Vercel dashboard, go to your project
2. Click **"Settings"** → **"Domains"**
3. Add your domain
4. Follow DNS instructions to point your domain to Vercel
5. Vercel automatically provisions SSL certificate

---

## Automatic Deployments

Once set up, every time you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push
```

Vercel will **automatically**:
- Detect the push
- Build your app
- Deploy to production
- Update your live site

---

## Troubleshooting

### Build Fails

**Check build logs in Vercel dashboard**

Common issues:
- Missing environment variables
- TypeScript errors
- Missing dependencies

### Authentication Not Working

1. Check Supabase redirect URLs include your Vercel domain
2. Verify environment variables are set correctly
3. Check browser console for errors

### Database Connection Issues

1. Verify Supabase credentials in Vercel environment variables
2. Check Supabase project is not paused (free tier pauses after inactivity)

---

## Production Checklist

Before going live:

- [ ] All environment variables set in Vercel
- [ ] Supabase redirect URLs updated
- [ ] Email confirmation disabled in Supabase
- [ ] Database schema created (run SQL from database-schema.sql)
- [ ] Test signup flow
- [ ] Test signin flow
- [ ] Test profile updates
- [ ] Test on mobile devices
- [ ] Check all pages load correctly

---

## Monitoring

### Vercel Dashboard

- View deployment logs
- Monitor performance
- Check analytics (free tier has basic analytics)

### Supabase Dashboard

- Monitor database usage
- Check authentication logs
- View API usage

---

## Cost

**Free Tier Includes:**
- ✅ Vercel: Unlimited deployments, 100GB bandwidth/month
- ✅ Supabase: 500MB database, 50,000 monthly active users
- ✅ Custom domain support
- ✅ Automatic HTTPS

**Perfect for your nursing interview app!**

---

## Next Steps After Deployment

1. Share your live URL with test users
2. Gather feedback
3. Implement Retell AI integration
4. Add payment system for credits
5. Monitor usage and scale as needed

---

## Support

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs

**Your app will be live at:** `https://your-project-name.vercel.app`

🎉 **Congratulations on deploying to production!**
