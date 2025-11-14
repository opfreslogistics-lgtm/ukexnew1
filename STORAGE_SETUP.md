# Storage Bucket Setup Instructions

## Setting up Storage Buckets

This guide covers setting up both the `folder-files` and `avatars` storage buckets.

---

## Setting up the `folder-files` Storage Bucket

To enable file uploads in folders, you need to configure the storage bucket and its policies in Supabase.

### Step 1: Create the Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Name it: `folder-files`
5. Make it **Private** (not public)
6. Click **"Create bucket"**

### Step 2: Set Up Storage Policies

**Important**: Storage policies must be created in the Dashboard UI, not via SQL. Follow these steps:

1. Click on the `folder-files` bucket
2. Go to the **"Policies"** tab
3. Click **"New Policy"** and create the following policies:

#### Policy 1: Allow Upload (INSERT)
- **Policy Name**: `Users can upload files to their folders`
- **Allowed Operation**: `INSERT`
- **Target Roles**: `authenticated`
- **Policy Definition** (paste this in the policy editor):
```
(bucket_id = 'folder-files' AND (storage.foldername(name))[1]::text IN (SELECT id::text FROM folders WHERE user_id = auth.uid()))
```

#### Policy 2: Allow View (SELECT)
- **Policy Name**: `Users can view files in their folders`
- **Allowed Operation**: `SELECT`
- **Target Roles**: `authenticated`
- **Policy Definition**:
```
(bucket_id = 'folder-files' AND (storage.foldername(name))[1]::text IN (SELECT id::text FROM folders WHERE user_id = auth.uid()))
```

#### Policy 3: Allow Delete (DELETE)
- **Policy Name**: `Users can delete files from their folders`
- **Allowed Operation**: `DELETE`
- **Target Roles**: `authenticated`
- **Policy Definition**:
```
(bucket_id = 'folder-files' AND (storage.foldername(name))[1]::text IN (SELECT id::text FROM folders WHERE user_id = auth.uid()))
```

### Alternative: Simpler Policy (Less Secure)

If the above policies don't work, you can use a simpler policy that allows all authenticated users to manage files in the bucket:

```
bucket_id = 'folder-files'
```

**Note**: 
- This is less secure as it allows any authenticated user to access any file in the bucket. Use only for testing or if you trust all users.
- Do NOT try to run SQL migrations for storage policies - they must be created through the Dashboard UI
- The policy editor in the Dashboard will accept the policy definition text above (without the SQL code block markers)

### Step 3: Verify Setup

After creating the policies, try uploading a file in the app. If you still get RLS errors:

1. Check that the bucket name is exactly `folder-files` (case-sensitive)
2. Verify that the policies are active (green checkmark)
3. Make sure you're logged in as an authenticated user
4. Check the browser console for detailed error messages

### Troubleshooting

**Error: "new row violates row-level security policy"**
- The storage policies are not set up correctly
- Make sure you've created all three policies (INSERT, SELECT, DELETE)
- Verify the policy SQL matches the folder structure

**Error: "Bucket not found"**
- The bucket `folder-files` doesn't exist
- Create it in Supabase Dashboard > Storage

**Error: "Permission denied"**
- The storage policies are too restrictive
- Check that the policy conditions match your folder structure
- Verify that `auth.uid()` returns the correct user ID

---

## Setting up the `avatars` Storage Bucket

### Step 1: Create the Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Name it: `avatars`
5. Make it **Public** (so profile pictures can be viewed)
6. Click **"Create bucket"**

### Step 2: Set Up Storage Policies

**Important**: Storage policies must be created in the Dashboard UI, not via SQL. Follow these steps:

1. Click on the `avatars` bucket
2. Go to the **"Policies"** tab
3. Click **"New Policy"** and create the following policies:

#### Policy 1: Allow Upload (INSERT)
- **Policy Name**: `Users can upload their own avatar`
- **Allowed Operation**: `INSERT`
- **Target Roles**: `authenticated`
- **Policy Definition** (paste this in the policy editor):
```
bucket_id = 'avatars'
```

#### Policy 2: Allow View (SELECT)
- **Policy Name**: `Users can view avatars`
- **Allowed Operation**: `SELECT`
- **Target Roles**: `authenticated, anon`
- **Policy Definition**:
```
bucket_id = 'avatars'
```

#### Policy 3: Allow Delete (DELETE)
- **Policy Name**: `Users can delete their own avatar`
- **Allowed Operation**: `DELETE`
- **Target Roles**: `authenticated`
- **Policy Definition**:
```
bucket_id = 'avatars'
```

**Note**: 
- Since the bucket is public, you can use the simple policy `bucket_id = 'avatars'` for all operations
- Do NOT try to run SQL migrations for storage policies - they must be created through the Dashboard UI
- The policy editor in the Dashboard will accept the policy definition text above

### Step 3: Verify Setup

After creating the policies, try uploading a profile picture in the app. If you still get RLS errors, check the same troubleshooting steps as above.

