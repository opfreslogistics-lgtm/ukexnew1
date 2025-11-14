-- Create notifications table for sharing and other events
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('share', 'collection_submission', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  item_id UUID REFERENCES vault_items(id) ON DELETE CASCADE,
  link_id UUID REFERENCES collection_links(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- System can insert notifications (via service role or triggers)
-- For now, we'll allow authenticated users to create notifications for others
-- This will be handled via a function with SECURITY DEFINER
CREATE POLICY "Authenticated users can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Function to create a notification (can be called from triggers or application)
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_item_id UUID DEFAULT NULL,
  p_link_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, item_id, link_id)
  VALUES (p_user_id, p_type, p_title, p_message, p_item_id, p_link_id)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create notification when item is shared
CREATE OR REPLACE FUNCTION notify_item_shared()
RETURNS TRIGGER AS $$
DECLARE
  v_item_title TEXT;
  v_owner_email TEXT;
BEGIN
  -- Get item title
  SELECT title INTO v_item_title
  FROM vault_items
  WHERE id = NEW.item_id;
  
  -- Get owner email for the notification message
  SELECT email INTO v_owner_email
  FROM auth.users
  WHERE id = NEW.owner_id;
  
  -- Create notification for the user receiving the share
  PERFORM create_notification(
    NEW.shared_with_id,
    'share',
    'Item Shared with You',
    COALESCE(v_owner_email, 'Someone') || ' shared "' || COALESCE(v_item_title, 'an item') || '" with you.',
    NEW.item_id,
    NULL
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_notify_item_shared ON shared_items;
CREATE TRIGGER trigger_notify_item_shared
  AFTER INSERT ON shared_items
  FOR EACH ROW
  WHEN (NEW.revoked_at IS NULL)
  EXECUTE FUNCTION notify_item_shared();

