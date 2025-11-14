-- Fix RLS policy to allow users to view vault_items that are shared with them
-- This is needed for the shared items page to work properly

-- Add policy to allow viewing vault_items that are shared with the user
-- Multiple SELECT policies are combined with OR, so this works alongside the existing policy
DROP POLICY IF EXISTS "Users can view shared vault items" ON vault_items;
CREATE POLICY "Users can view shared vault items"
  ON vault_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shared_items
      WHERE shared_items.item_id = vault_items.id
      AND shared_items.shared_with_id = auth.uid()
      AND shared_items.revoked_at IS NULL
    )
  );

