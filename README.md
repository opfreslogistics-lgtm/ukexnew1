# UKEX Vault - Password & Secrets Manager

A modern, secure password and secrets manager built with Next.js, Supabase, and TypeScript. Features zero-knowledge encryption, real-time collaboration, and a beautiful UI.

## 🚀 Features

- **Secure Vault Management**: Store credentials, credit cards, contacts, notes, and documents
- **Zero-Knowledge Encryption**: All sensitive data is encrypted client-side
- **Password Health Analysis**: Detect weak, reused, and exposed passwords
- **Real-Time Collaboration**: Share items with team members with granular permissions
- **Collection Links**: Request information from users via customizable forms
- **Live Messaging**: Real-time chat with file attachments
- **Dark Mode**: Beautiful dark/light theme support
- **Mobile Responsive**: Works seamlessly on all devices

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Git

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd ukex-vault
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at https://supabase.com
2. Get your project URL and anon key from Settings → API
3. Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_ENCRYPTION_KEY=your-strong-encryption-key-32-chars-min
ENCRYPTION_KEY=your-strong-encryption-key-32-chars-min
```

**Important**: Generate a strong encryption key:
```bash
openssl rand -base64 32
```

### 3. Run Database Migrations

1. Go to Supabase Dashboard → SQL Editor
2. Run all migration files in `supabase/migrations/` in order (001 through 015)
3. See `SETUP.md` for detailed instructions

### 4. Set Up Storage Buckets

Create these buckets in Supabase Storage:
- `folder-files` (private)
- `avatars` (private)
- `message-attachments` (private)

See `STORAGE_SETUP.md` and `STORAGE_SETUP_MESSAGES.md` for RLS policies.

### 5. Enable Realtime

1. Go to Database → Replication
2. Enable replication for the `messages` table

### 6. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## 📚 Documentation

- **`SETUP.md`** - Detailed setup instructions
- **`STORAGE_SETUP.md`** - Storage bucket setup guide
- **`STORAGE_SETUP_MESSAGES.md`** - Message attachments storage setup
- **`VERCEL_DEPLOYMENT.md`** - Complete Vercel deployment guide
- **`DEPLOYMENT_READY.md`** - Quick deployment checklist

## 🚀 Deploy to Vercel

See `DEPLOYMENT_READY.md` for quick start or `VERCEL_DEPLOYMENT.md` for detailed guide.

**Quick steps:**
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

## 🔐 Security

- All sensitive data encrypted client-side
- Row Level Security (RLS) on all database tables
- Secure file storage with signed URLs
- Zero-knowledge architecture

## 📝 License

Private - All rights reserved

## 🤝 Support

For issues or questions, check the documentation files or create an issue in the repository.
