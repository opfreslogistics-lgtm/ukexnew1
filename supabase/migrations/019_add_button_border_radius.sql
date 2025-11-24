-- Add button styling fields for exact template matching

DO $$ 
BEGIN
  -- Add button_border_radius field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'collection_links' 
    AND column_name = 'button_border_radius'
  ) THEN
    ALTER TABLE collection_links ADD COLUMN button_border_radius TEXT DEFAULT '16px';
  END IF;

  -- Add button_height field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'collection_links' 
    AND column_name = 'button_height'
  ) THEN
    ALTER TABLE collection_links ADD COLUMN button_height TEXT DEFAULT '48px';
  END IF;
END $$;

-- Add comments
COMMENT ON COLUMN collection_links.button_border_radius IS 'Border radius of submit button (e.g., "4px", "24px", "9999px" for pill)';
COMMENT ON COLUMN collection_links.button_height IS 'Height of submit button (e.g., "48px", "52px")';
