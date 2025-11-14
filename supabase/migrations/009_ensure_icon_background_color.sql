-- Ensure icon_background_color column exists in collection_links
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'collection_links' 
    AND column_name = 'icon_background_color'
  ) THEN
    ALTER TABLE collection_links ADD COLUMN icon_background_color TEXT;
  END IF;
END $$;


