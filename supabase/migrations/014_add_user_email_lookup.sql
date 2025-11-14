-- Create a function to get user email (for messaging)
-- This is a simpler approach that works with RLS

CREATE OR REPLACE FUNCTION get_user_email(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_email TEXT;
BEGIN
  SELECT email INTO v_email
  FROM auth.users
  WHERE id = p_user_id
  LIMIT 1;
  
  RETURN v_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for conversation participants with emails
CREATE OR REPLACE VIEW conversation_participants AS
SELECT 
  c.id as conversation_id,
  c.user1_id,
  c.user2_id,
  get_user_email(c.user1_id) as user1_email,
  get_user_email(c.user2_id) as user2_email,
  c.last_message_at,
  c.created_at
FROM conversations c;

