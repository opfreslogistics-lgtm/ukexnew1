-- Fix find_user_by_email function return type
-- The function should return a single row or null, not a table

DROP FUNCTION IF EXISTS find_user_by_email(TEXT);

CREATE OR REPLACE FUNCTION find_user_by_email(p_email TEXT)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
BEGIN
  SELECT au.id, au.email
  INTO v_user_id, v_user_email
  FROM auth.users au
  WHERE au.email = p_email
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN json_build_object(
    'id', v_user_id,
    'email', v_user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

