# Step-by-Step Guide: Deploying OPFRES Vault to Vercel

## Prerequisites
- GitHub account (free)
- Vercel account (free tier available)
- Your Supabase project ready
- All environment variables from your `.env.local` file

---

## Step 1: Prepare Your Code for Git

### 1.1 Initialize Git (if not already done)
Open terminal in your project folder and run:

```bash
git init
```

### 1.2 Create a `.gitignore` file (already exists, but verify it includes):
- `.env.local`
- `.env`
- `node_modules/`
- `.next/`
- `.vercel/`

### 1.3 Stage and commit your code
```bash
git add .
git commit -m "Initial commit - Ready for Vercel deployment"
```

---

## Step 2: Push to GitHub

### 2.1 Create a new repository on GitHub
1. Go to [github.com](https://github.com)
2. Click the "+" icon in top right → "New repository"
3. Name it (e.g., "ukex-vault")
4. Choose Public or Private
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

### 2.2 Connect and push your code
GitHub will show you commands. Run these in your terminal:

```bash
# Add GitHub as remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Rename branch to main (if needed)
git branch -M main

# Push your code
git push -u origin main
```

---

## Step 3: Sign Up for Vercel

### 3.1 Create Vercel account
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose "Continue with GitHub" (recommended - easier integration)
4. Authorize Vercel to access your GitHub account

---

## Step 4: Deploy Your Project

### 4.1 Import your repository
1. After logging in, click "Add New..." → "Project"
2. You'll see your GitHub repositories
3. Find and click "Import" next to your repository

### 4.2 Configure project settings
Vercel will auto-detect Next.js. Verify these settings:

- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (leave as is)
- **Build Command**: `npm run build` (auto-filled)
- **Output Directory**: `.next` (auto-filled)
- **Install Command**: `npm install` (auto-filled)

### 4.3 Add Environment Variables
**CRITICAL STEP** - Click "Environment Variables" and add these:

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Value: Your Supabase project URL (from Supabase dashboard)
   - Example: `https://xxxxxxxxxxxxx.supabase.co`
   - Add to: Production, Preview, Development

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Value: Your Supabase anon/public key
   - Add to: Production, Preview, Development

3. **NEXT_PUBLIC_ENCRYPTION_KEY**
   - Value: Your encryption key (same as in `.env.local`)
   - **IMPORTANT**: Use a strong, unique key for production
   - Add to: Production, Preview, Development

4. **ENCRYPTION_KEY**
   - Value: Same as NEXT_PUBLIC_ENCRYPTION_KEY (for server-side)
   - Add to: Production, Preview, Development

**How to add each variable:**
- Click "Add" button
- Enter the name
- Enter the value
- Select all three environments (Production, Preview, Development)
- Click "Save"

### 4.4 Deploy
1. Click "Deploy" button at the bottom
2. Wait 2-3 minutes for build to complete
3. You'll see build logs in real-time
4. When done, you'll get a URL like: `your-project.vercel.app`

---

## Step 5: Update Supabase Settings

### 5.1 Add Vercel URL to Supabase
1. Go to your Supabase Dashboard
2. Navigate to: **Authentication** → **URL Configuration**
3. Add these URLs:

**Site URL:**
```
https://your-project.vercel.app
```

**Redirect URLs:**
```
https://your-project.vercel.app/auth/callback
https://your-project.vercel.app/**
```

4. Click "Save"

### 5.2 Update Allowed Origins (if needed)
1. Go to **Settings** → **API**
2. Under "CORS", add your Vercel URL:
```
https://your-project.vercel.app
```

---

## Step 6: Test Your Deployment

### 6.1 Visit your Vercel URL
- Go to `https://your-project.vercel.app`
- Test signup/login
- Test creating items
- Test sharing items

### 6.2 Check for errors
- Open browser console (F12)
- Look for any errors
- Check Vercel deployment logs if issues occur

---

## Step 7: Add Custom Domain (Optional)

### 7.1 In Vercel Dashboard
1. Go to your project
2. Click **Settings** → **Domains**
3. Enter your domain (e.g., `vault.yourdomain.com`)
4. Click "Add"

### 7.2 Configure DNS
Vercel will show you DNS records to add. You need to add these in your domain registrar:

**Option A: CNAME (Recommended)**
- Type: `CNAME`
- Name: `vault` (or `@` for root domain)
- Value: `cname.vercel-dns.com`

**Option B: A Record**
- Type: `A`
- Name: `vault` (or `@`)
- Value: `76.76.21.21`

### 7.3 Wait for DNS propagation
- Can take 5 minutes to 48 hours
- Vercel will show status: "Valid Configuration" when ready
- SSL certificate is automatically provisioned

### 7.4 Update Supabase with custom domain
Once your custom domain works:
1. Update Supabase **Site URL** to your custom domain
2. Update **Redirect URLs** to include custom domain
3. Update **CORS** settings

---

## Step 8: Run Database Migrations

### 8.1 In Supabase Dashboard
1. Go to **SQL Editor**
2. Run all migration files in order:
   - `001_initial_schema.sql`
   - `002_add_collection_link_fields.sql`
   - `003_add_folder_files.sql`
   - `005_setup_storage_bucket.sql` (reference only - manual setup)
   - `006_setup_avatars_bucket.sql` (reference only - manual setup)
   - `007_fix_find_user_by_email.sql`
   - `008_create_notifications.sql`
   - `009_ensure_icon_background_color.sql`
   - `010_fix_shared_items_rls.sql`
   - `011_ensure_all_collection_link_fields.sql`
   - `012_add_collection_submission_notifications.sql`
   - `013_create_messaging.sql`
   - `014_add_user_email_lookup.sql`
   - `015_add_message_attachments.sql`

### 8.2 Set up Storage Buckets
1. Go to **Storage** in Supabase
2. Create buckets:
   - `folder-files` (private)
   - `avatars` (private)
   - `message-attachments` (private)
3. Set up RLS policies (see `STORAGE_SETUP.md` and `STORAGE_SETUP_MESSAGES.md`)

### 8.3 Enable Realtime
1. Go to **Database** → **Replication** in Supabase
2. Enable replication for the `messages` table
3. This allows real-time messaging to work

---

## Troubleshooting

### Build Fails
- Check build logs in Vercel
- Common issues:
  - Missing environment variables
  - TypeScript errors
  - Missing dependencies

### Authentication Not Working
- Verify Supabase URLs are correct
- Check redirect URLs in Supabase settings
- Ensure environment variables are set

### Database Errors
- Verify all migrations are run
- Check RLS policies
- Verify Supabase keys are correct

### Images Not Loading
- Check `next.config.js` has correct image domains
- Verify Supabase storage bucket is public or policies are set

---

## Continuous Deployment

Once set up, every push to your `main` branch will automatically:
1. Trigger a new deployment
2. Build your app
3. Deploy to production

You can also:
- Create preview deployments for pull requests
- Roll back to previous deployments
- View deployment analytics

---

## Security Checklist

- [ ] Use strong, unique encryption keys
- [ ] Never commit `.env.local` to Git
- [ ] Enable 2FA on GitHub and Vercel
- [ ] Review Supabase RLS policies
- [ ] Set up database backups
- [ ] Monitor Vercel analytics for unusual activity
- [ ] Keep dependencies updated

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Supabase Docs: https://supabase.com/docs

---

## Quick Reference: Environment Variables Needed

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_ENCRYPTION_KEY=your-encryption-key
ENCRYPTION_KEY=your-encryption-key
```

Make sure all are added to Production, Preview, and Development environments in Vercel!


