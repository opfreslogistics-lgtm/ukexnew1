-- Add detailed input field styling controls to collection_links table
-- This allows precise control over input appearance: height, padding, gaps, border radius, etc.

DO $$ 
BEGIN
  -- Add input_height if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'collection_links' 
    AND column_name = 'input_height'
  ) THEN
    ALTER TABLE collection_links ADD COLUMN input_height TEXT DEFAULT '56px';
  END IF;

  -- Add input_padding if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'collection_links' 
    AND column_name = 'input_padding'
  ) THEN
    ALTER TABLE collection_links ADD COLUMN input_padding TEXT DEFAULT '16px 20px';
  END IF;

  -- Add form_gap if it doesn't exist (gap between form fields)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'collection_links' 
    AND column_name = 'form_gap'
  ) THEN
    ALTER TABLE collection_links ADD COLUMN form_gap TEXT DEFAULT '24px';
  END IF;

  -- Add input_border_radius if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'collection_links' 
    AND column_name = 'input_border_radius'
  ) THEN
    ALTER TABLE collection_links ADD COLUMN input_border_radius TEXT DEFAULT '16px';
  END IF;

  -- Add input_border_width if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'collection_links' 
    AND column_name = 'input_border_width'
  ) THEN
    ALTER TABLE collection_links ADD COLUMN input_border_width TEXT DEFAULT '2px';
  END IF;

  -- Add label_margin_bottom if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'collection_links' 
    AND column_name = 'label_margin_bottom'
  ) THEN
    ALTER TABLE collection_links ADD COLUMN label_margin_bottom TEXT DEFAULT '8px';
  END IF;

  -- Add input_font_size if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'collection_links' 
    AND column_name = 'input_font_size'
  ) THEN
    ALTER TABLE collection_links ADD COLUMN input_font_size TEXT DEFAULT '16px';
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN collection_links.input_height IS 'Height of input fields (e.g., "48px", "56px", "64px")';
COMMENT ON COLUMN collection_links.input_padding IS 'Padding inside input fields (e.g., "12px 16px", "16px 20px")';
COMMENT ON COLUMN collection_links.form_gap IS 'Gap between form fields (e.g., "16px", "24px", "32px")';
COMMENT ON COLUMN collection_links.input_border_radius IS 'Border radius of input fields (e.g., "8px", "16px", "24px")';
COMMENT ON COLUMN collection_links.input_border_width IS 'Border width of input fields (e.g., "1px", "2px", "3px")';
COMMENT ON COLUMN collection_links.label_margin_bottom IS 'Margin below labels (e.g., "4px", "8px", "12px")';
COMMENT ON COLUMN collection_links.input_font_size IS 'Font size for input text (e.g., "14px", "16px", "18px")';
