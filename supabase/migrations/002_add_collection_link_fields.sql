-- Add missing columns to collection_links table
DO $$
BEGIN
  -- Add website_url if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'collection_links' 
                 AND column_name = 'website_url') THEN
    ALTER TABLE collection_links ADD COLUMN website_url TEXT;
  END IF;

  -- Add logo_url if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'collection_links' 
                 AND column_name = 'logo_url') THEN
    ALTER TABLE collection_links ADD COLUMN logo_url TEXT;
  END IF;

  -- Add form_background_color if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'collection_links' 
                 AND column_name = 'form_background_color') THEN
    ALTER TABLE collection_links ADD COLUMN form_background_color TEXT DEFAULT '#ffffff';
  END IF;

  -- Add page_background_color if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'collection_links' 
                 AND column_name = 'page_background_color') THEN
    ALTER TABLE collection_links ADD COLUMN page_background_color TEXT DEFAULT '#f3f4f6';
  END IF;

  -- Add button_background_color if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'collection_links' 
                 AND column_name = 'button_background_color') THEN
    ALTER TABLE collection_links ADD COLUMN button_background_color TEXT DEFAULT '#ec4899';
  END IF;

  -- Add button_text_color if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'collection_links' 
                 AND column_name = 'button_text_color') THEN
    ALTER TABLE collection_links ADD COLUMN button_text_color TEXT DEFAULT '#ffffff';
  END IF;

  -- Add button_text if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'collection_links' 
                 AND column_name = 'button_text') THEN
    ALTER TABLE collection_links ADD COLUMN button_text TEXT DEFAULT 'Submit';
  END IF;

  -- Add button_alignment if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'collection_links' 
                 AND column_name = 'button_alignment') THEN
    ALTER TABLE collection_links ADD COLUMN button_alignment TEXT DEFAULT 'center';
  END IF;

  -- Add label_text_color if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'collection_links' 
                 AND column_name = 'label_text_color') THEN
    ALTER TABLE collection_links ADD COLUMN label_text_color TEXT;
  END IF;

  -- Add label_background_color if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'collection_links' 
                 AND column_name = 'label_background_color') THEN
    ALTER TABLE collection_links ADD COLUMN label_background_color TEXT;
  END IF;

  -- Add input_background_color if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'collection_links' 
                 AND column_name = 'input_background_color') THEN
    ALTER TABLE collection_links ADD COLUMN input_background_color TEXT;
  END IF;

  -- Add input_text_color if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'collection_links' 
                 AND column_name = 'input_text_color') THEN
    ALTER TABLE collection_links ADD COLUMN input_text_color TEXT;
  END IF;

  -- Add input_border_color if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'collection_links' 
                 AND column_name = 'input_border_color') THEN
    ALTER TABLE collection_links ADD COLUMN input_border_color TEXT;
  END IF;

  -- Add icon_background_color if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'collection_links' 
                 AND column_name = 'icon_background_color') THEN
    ALTER TABLE collection_links ADD COLUMN icon_background_color TEXT;
  END IF;

  -- Add form_width if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'collection_links' 
                 AND column_name = 'form_width') THEN
    ALTER TABLE collection_links ADD COLUMN form_width INTEGER;
  END IF;
END $$;

