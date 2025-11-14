-- Add support for file attachments in messages

-- Add columns to messages table for attachments
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_type TEXT,
ADD COLUMN IF NOT EXISTS attachment_name TEXT,
ADD COLUMN IF NOT EXISTS attachment_size INTEGER;

-- Create storage bucket for message attachments
-- Note: You need to create this bucket manually in Supabase Dashboard
-- Bucket name: 'message-attachments'
-- Public: false (private bucket)

