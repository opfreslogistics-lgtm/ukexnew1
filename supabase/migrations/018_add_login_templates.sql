-- Add login template customization fields to collection_links table
-- Allows selection of pre-built templates and background customization

DO $$ 
BEGIN
  -- Add template_style field (stores which template to use)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'collection_links' 
    AND column_name = 'template_style'
  ) THEN
    ALTER TABLE collection_links ADD COLUMN template_style TEXT DEFAULT 'custom';
  END IF;

  -- Add page_background_type field (color or image)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'collection_links' 
    AND column_name = 'page_background_type'
  ) THEN
    ALTER TABLE collection_links ADD COLUMN page_background_type TEXT DEFAULT 'color';
  END IF;

  -- Add page_background_image_url field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'collection_links' 
    AND column_name = 'page_background_image_url'
  ) THEN
    ALTER TABLE collection_links ADD COLUMN page_background_image_url TEXT;
  END IF;

  -- Add show_url_on_form field (control URL visibility)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'collection_links' 
    AND column_name = 'show_url_on_form'
  ) THEN
    ALTER TABLE collection_links ADD COLUMN show_url_on_form BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN collection_links.template_style IS 'Template style: custom, facebook, gmail, instagram, linkedin, amazon, netflix, etc.';
COMMENT ON COLUMN collection_links.page_background_type IS 'Background type: color or image';
COMMENT ON COLUMN collection_links.page_background_image_url IS 'URL of background image if page_background_type is image';
COMMENT ON COLUMN collection_links.show_url_on_form IS 'Whether to show the website URL on the form (default: false for security)';
