-- Add site branding fields to collection_links table
-- This allows customizing the appearance of collection links with site name, tagline, and favicon

DO $$ 
BEGIN
  -- Add site_name if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'collection_links' 
    AND column_name = 'site_name'
  ) THEN
    ALTER TABLE collection_links ADD COLUMN site_name TEXT;
  END IF;

  -- Add site_tagline if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'collection_links' 
    AND column_name = 'site_tagline'
  ) THEN
    ALTER TABLE collection_links ADD COLUMN site_tagline TEXT;
  END IF;

  -- Add custom_favicon_url if it doesn't exist (for manually uploaded favicons)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'collection_links' 
    AND column_name = 'custom_favicon_url'
  ) THEN
    ALTER TABLE collection_links ADD COLUMN custom_favicon_url TEXT;
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN collection_links.site_name IS 'Custom site name displayed on the collection form';
COMMENT ON COLUMN collection_links.site_tagline IS 'Custom tagline/description displayed on the collection form';
COMMENT ON COLUMN collection_links.custom_favicon_url IS 'Custom favicon URL for the collection page, overrides logo_url if provided';
