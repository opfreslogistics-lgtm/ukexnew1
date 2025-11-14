# 🚀 Vercel Deployment Checklist & Code Review

## ✅ Pre-Deployment Code Review

### 1. Environment Variables ✅
Your app uses these environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Required
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Required  
- `NEXT_PUBLIC_ENCRYPTION_KEY` - Required (client-side)
- `ENCRYPTION_KEY` - Required (server-side)

**Status**: ✅ All properly referenced in code

### 2. Next.js Configuration ✅
- `next.config.js` properly configured
- Image domains configured for Supabase
- React strict mode enabled

**Status**: ✅ Ready for deployment

### 3. Dependencies ✅
- All dependencies in `package.json`
- No missing packages
- TypeScript properly configured

**Status**: ✅ Ready

### 4. Build Scripts ✅
- `npm run build` - ✅ Present
- `npm run start` - ✅ Present
- `npm run dev` - ✅ Present

**Status**: ✅ Ready

### 5. Git Configuration ✅
- `.gitignore` properly excludes:
  - `.env.local`
  - `.env`
  - `node_modules/`
  - `.next/`
  - `.vercel/`

**Status**: ✅ Ready

---

## 📋 Step-by-Step Deployment Guide

### Step 1: Prepare Your Code

1. **Ensure all changes are committed:**
   ```bash
   git status
   git add .
   git commit -m "Ready for Vercel deployment"
   ```

2. **Verify no sensitive files are tracked:**
   ```bash
   git ls-files | grep -E "\.env|\.local"
   ```
   Should return nothing. If it shows `.env.local`, remove it:
   ```bash
   git rm --cached .env.local
   git commit -m "Remove .env.local from tracking"
   ```

### Step 2: Push to GitHub

1. **Create a GitHub repository** (if not already done):
   - Go to https://github.com/new
   - Name it (e.g., `ukex-vault`)
   - Choose Public or Private
   - **Don't** initialize with README
   - Click "Create repository"

2. **Push your code:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/ukex-vault.git
   git branch -M main
   git push -u origin main
   ```

### Step 3: Deploy to Vercel

1. **Sign up/Login to Vercel:**
   - Go to https://vercel.com
   - Click "Sign Up"
   - Choose "Continue with GitHub" (recommended)

2. **Import your project:**
   - Click "Add New..." → "Project"
   - Find your repository and click "Import"

3. **Configure project:**
   - Framework: Next.js (auto-detected) ✅
   - Root Directory: `./` ✅
   - Build Command: `npm run build` ✅
   - Output Directory: `.next` ✅

4. **Add Environment Variables** (CRITICAL):
   
   Click "Environment Variables" and add:

   | Variable Name | Value | Environments |
   |--------------|-------|--------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | Production, Preview, Development |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Key | Production, Preview, Development |
   | `NEXT_PUBLIC_ENCRYPTION_KEY` | Your encryption key | Production, Preview, Development |
   | `ENCRYPTION_KEY` | Same as above | Production, Preview, Development |

   **How to get your values:**
   - Supabase URL & Key: Supabase Dashboard → Settings → API
   - Encryption Key: Use a strong random string (generate with: `openssl rand -base64 32`)

5. **Deploy:**
   - Click "Deploy" button
   - Wait 2-3 minutes
   - You'll get a URL like: `your-project.vercel.app`

### Step 4: Configure Supabase

1. **Update Authentication URLs:**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - **Site URL:** `https://your-project.vercel.app`
   - **Redirect URLs:** Add:
     ```
     https://your-project.vercel.app/auth/callback
     https://your-project.vercel.app/**
     ```

2. **Update CORS (if needed):**
   - Go to Settings → API
   - Under "CORS", add: `https://your-project.vercel.app`

### Step 5: Run Database Migrations

1. **In Supabase SQL Editor**, run these migrations in order:
   ```
   001_initial_schema.sql
   002_add_collection_link_fields.sql
   003_add_folder_files.sql
   007_fix_find_user_by_email.sql
   008_create_notifications.sql
   009_ensure_icon_background_color.sql
   010_fix_shared_items_rls.sql
   011_ensure_all_collection_link_fields.sql
   012_add_collection_submission_notifications.sql
   013_create_messaging.sql
   014_add_user_email_lookup.sql
   015_add_message_attachments.sql
   ```

2. **Set up Storage Buckets:**
   - Create `folder-files` bucket (private)
   - Create `avatars` bucket (private)
   - Create `message-attachments` bucket (private)
   - Set up RLS policies (see `STORAGE_SETUP.md` and `STORAGE_SETUP_MESSAGES.md`)

3. **Enable Realtime:**
   - Go to Database → Replication
   - Enable for `messages` table

### Step 6: Test Your Deployment

1. **Visit your Vercel URL:**
   - Test signup/login
   - Test creating vault items
   - Test sharing items
   - Test messaging
   - Test file uploads

2. **Check for errors:**
   - Open browser console (F12)
   - Check Vercel deployment logs
   - Check Supabase logs

---

## 🔧 Common Issues & Solutions

### Issue: Build Fails
**Solution:**
- Check build logs in Vercel
- Ensure all environment variables are set
- Verify TypeScript compiles: `npm run build` locally

### Issue: Authentication Not Working
**Solution:**
- Verify Supabase URLs in environment variables
- Check redirect URLs in Supabase settings
- Ensure callback URL matches exactly

### Issue: Database Errors
**Solution:**
- Verify all migrations are run
- Check RLS policies are set
- Verify Supabase keys are correct

### Issue: Images Not Loading
**Solution:**
- Check `next.config.js` has correct image domains
- Verify storage bucket policies
- Check if buckets are public or have proper RLS

### Issue: Encryption Errors
**Solution:**
- Ensure `NEXT_PUBLIC_ENCRYPTION_KEY` and `ENCRYPTION_KEY` are identical
- Use a strong, unique key (32+ characters)
- Never use the default key in production

---

## 🔐 Security Checklist

- [ ] Use strong, unique encryption keys (32+ characters)
- [ ] Never commit `.env.local` to Git
- [ ] Enable 2FA on GitHub and Vercel
- [ ] Review Supabase RLS policies
- [ ] Set up database backups in Supabase
- [ ] Monitor Vercel analytics
- [ ] Keep dependencies updated
- [ ] Use HTTPS only (Vercel provides this automatically)

---

## 📊 Post-Deployment

### Monitor Your App:
- Vercel Dashboard → Analytics
- Supabase Dashboard → Logs
- Check error rates
- Monitor performance

### Set Up Custom Domain (Optional):
1. In Vercel: Settings → Domains
2. Add your domain
3. Configure DNS as shown
4. Update Supabase URLs with custom domain

---

## 🆘 Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Vercel Support:** https://vercel.com/support
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs

---

## ✅ Quick Verification Commands

Before deploying, run these locally:

```bash
# Check build works
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Check for linting errors
npm run lint

# Verify environment variables are not committed
git ls-files | grep env
```

---

## 🎉 You're Ready!

Your codebase is ready for deployment. Follow the steps above and your app will be live on Vercel!

