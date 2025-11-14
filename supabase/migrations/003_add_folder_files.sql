-- Create folder_files table for storing file metadata
CREATE TABLE IF NOT EXISTS folder_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  folder_id UUID NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_folder_files_folder_id ON folder_files(folder_id);
CREATE INDEX IF NOT EXISTS idx_folder_files_uploaded_at ON folder_files(uploaded_at DESC);

-- Enable RLS
ALTER TABLE folder_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view files in their folders" ON folder_files;
CREATE POLICY "Users can view files in their folders"
  ON folder_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM folders
      WHERE folders.id = folder_files.folder_id
      AND folders.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can upload files to their folders" ON folder_files;
CREATE POLICY "Users can upload files to their folders"
  ON folder_files FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM folders
      WHERE folders.id = folder_files.folder_id
      AND folders.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete files from their folders" ON folder_files;
CREATE POLICY "Users can delete files from their folders"
  ON folder_files FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM folders
      WHERE folders.id = folder_files.folder_id
      AND folders.user_id = auth.uid()
    )
  );


