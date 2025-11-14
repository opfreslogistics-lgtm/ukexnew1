-- Add notification trigger for collection submissions
-- When an item is created from a collection submission, notify the owner

CREATE OR REPLACE FUNCTION notify_collection_submission()
RETURNS TRIGGER AS $$
DECLARE
  v_link_owner_id UUID;
  v_item_type TEXT;
  v_submitter_email TEXT;
BEGIN
  -- Only create notification if item was created from a collection link
  IF NEW.source_link_id IS NOT NULL THEN
    -- Get the link owner
    SELECT owner_id, item_type INTO v_link_owner_id, v_item_type
    FROM collection_links
    WHERE id = NEW.source_link_id;
    
    -- Get submitter email if available
    IF NEW.submitter_id IS NOT NULL THEN
      SELECT email INTO v_submitter_email
      FROM auth.users
      WHERE id = NEW.submitter_id;
    END IF;
    
    -- Create notification for the link owner
    IF v_link_owner_id IS NOT NULL THEN
      PERFORM create_notification(
        v_link_owner_id,
        'collection_submission',
        'New Collection Submission',
        COALESCE(
          CASE 
            WHEN v_submitter_email IS NOT NULL THEN v_submitter_email || ' submitted a ' || COALESCE(v_item_type, 'item')
            ELSE 'Someone submitted a ' || COALESCE(v_item_type, 'item')
          END,
          'New item submitted via collection link'
        ),
        NEW.id,
        NEW.source_link_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_notify_collection_submission ON vault_items;
CREATE TRIGGER trigger_notify_collection_submission
  AFTER INSERT ON vault_items
  FOR EACH ROW
  WHEN (NEW.source_link_id IS NOT NULL)
  EXECUTE FUNCTION notify_collection_submission();

