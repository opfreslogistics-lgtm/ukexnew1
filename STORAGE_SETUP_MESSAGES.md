# Message Attachments Storage Setup

## Create Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Click "New bucket"
3. Name: `message-attachments`
4. **Public bucket**: NO (private)
5. Click "Create bucket"

## Set Up Storage Policies

Go to Storage → Policies → `message-attachments` bucket

### INSERT Policy (Users can upload files to conversations they're part of)

**Policy Name**: Users can upload message attachments

**Policy Definition**:
```sql
(bucket_id = 'message-attachments' AND 
 (storage.foldername(name))[1] IN (
   SELECT id::text FROM conversations 
   WHERE user1_id = auth.uid() OR user2_id = auth.uid()
 ))
)
```

**Allowed Operation**: INSERT

### SELECT Policy (Users can view files from their conversations)

**Policy Name**: Users can view message attachments

**Policy Definition**:
```sql
(bucket_id = 'message-attachments' AND 
 (storage.foldername(name))[1] IN (
   SELECT id::text FROM conversations 
   WHERE user1_id = auth.uid() OR user2_id = auth.uid()
 ))
)
```

**Allowed Operation**: SELECT

### DELETE Policy (Users can delete their own uploaded files)

**Policy Name**: Users can delete their message attachments

**Policy Definition**:
```sql
(bucket_id = 'message-attachments' AND 
 (storage.foldername(name))[1] IN (
   SELECT id::text FROM conversations 
   WHERE user1_id = auth.uid() OR user2_id = auth.uid()
 ))
)
```

**Allowed Operation**: DELETE

## Important Notes

- Files are stored in folders named by conversation_id
- Path format: `{conversation_id}/{filename}`
- Maximum file size: 10MB (enforced in the app)
- Supported file types: Images, PDFs, Documents, Text files
- Files are accessed via signed URLs (valid for 1 year)

