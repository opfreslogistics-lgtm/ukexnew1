-- ============================================================================
-- UKEX Vault - Complete Database Schema
-- ============================================================================
-- This migration creates all tables, indexes, policies, and triggers needed
-- for the password and secrets manager application.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES (in dependency order)
-- ============================================================================

-- Folders: Organize vault items into folders
CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Collection Links: Secure links for requesting information from others
CREATE TABLE IF NOT EXISTS collection_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  link_type TEXT NOT NULL CHECK (link_type IN ('one-time', 'multi-use')),
  item_type TEXT NOT NULL,
  allowed_fields TEXT[] DEFAULT '{}',
  expires_at TIMESTAMPTZ NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0 NOT NULL,
  passphrase_hash TEXT,
  requires_auth BOOLEAN DEFAULT TRUE NOT NULL,
  website_url TEXT,
  logo_url TEXT,
  form_background_color TEXT DEFAULT '#ffffff',
  page_background_color TEXT DEFAULT '#f3f4f6',
  button_background_color TEXT DEFAULT '#ec4899',
  button_text_color TEXT DEFAULT '#ffffff',
  button_text TEXT DEFAULT 'Submit',
  button_alignment TEXT DEFAULT 'center',
  label_text_color TEXT,
  label_background_color TEXT,
  input_background_color TEXT,
  input_text_color TEXT,
  input_border_color TEXT,
  icon_background_color TEXT,
  form_width INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Vault Items: Main table for storing encrypted secrets
CREATE TABLE IF NOT EXISTS vault_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('credential', 'card', 'note', 'contact', 'document', 'passkey')),
  title TEXT NOT NULL,
  encrypted_data TEXT NOT NULL,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  is_trashed BOOLEAN DEFAULT FALSE NOT NULL,
  trashed_at TIMESTAMPTZ,
  source_link_id UUID REFERENCES collection_links(id) ON DELETE SET NULL,
  submitter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_accessed_at TIMESTAMPTZ
);

-- Shared Items: Items shared between users with permissions
CREATE TABLE IF NOT EXISTS shared_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES vault_items(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL CHECK (permission IN ('view', 'reveal', 'edit', 'owner')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  revoked_at TIMESTAMPTZ,
  CONSTRAINT shared_items_unique UNIQUE (item_id, shared_with_id)
);

-- Collection Submissions: Data submitted via collection links
CREATE TABLE IF NOT EXISTS collection_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id UUID NOT NULL REFERENCES collection_links(id) ON DELETE CASCADE,
  submitter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  encrypted_data TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Audit Logs: Track all sensitive operations
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES vault_items(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('reveal', 'copy', 'share', 'create', 'update', 'delete', 'restore', 'submit')),
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- User Profiles: Additional user information and profile data
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Email Aliases: Email masking for privacy
CREATE TABLE IF NOT EXISTS email_aliases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  linked_item_id UUID REFERENCES vault_items(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_used_at TIMESTAMPTZ,
  CONSTRAINT email_aliases_unique UNIQUE (user_id, alias)
);

-- Passkeys: WebAuthn passkey storage
CREATE TABLE IF NOT EXISTS passkeys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES vault_items(id) ON DELETE SET NULL,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  device_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_used_at TIMESTAMPTZ
);

-- ============================================================================
-- INDEXES (for performance)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);

CREATE INDEX IF NOT EXISTS idx_collection_links_owner_id ON collection_links(owner_id);
CREATE INDEX IF NOT EXISTS idx_collection_links_expires_at ON collection_links(expires_at);

CREATE INDEX IF NOT EXISTS idx_vault_items_user_id ON vault_items(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_items_item_type ON vault_items(item_type);
CREATE INDEX IF NOT EXISTS idx_vault_items_folder_id ON vault_items(folder_id);
CREATE INDEX IF NOT EXISTS idx_vault_items_is_trashed ON vault_items(is_trashed);
CREATE INDEX IF NOT EXISTS idx_vault_items_tags ON vault_items USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_shared_items_item_id ON shared_items(item_id);
CREATE INDEX IF NOT EXISTS idx_shared_items_shared_with_id ON shared_items(shared_with_id);
CREATE INDEX IF NOT EXISTS idx_shared_items_owner_id ON shared_items(owner_id);
CREATE INDEX IF NOT EXISTS idx_shared_items_revoked_at ON shared_items(revoked_at) WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_collection_submissions_link_id ON collection_submissions(link_id);
CREATE INDEX IF NOT EXISTS idx_collection_submissions_submitter_id ON collection_submissions(submitter_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_item_id ON audit_logs(item_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_email_aliases_user_id ON email_aliases(user_id);
CREATE INDEX IF NOT EXISTS idx_email_aliases_is_active ON email_aliases(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_passkeys_user_id ON passkeys(user_id);
CREATE INDEX IF NOT EXISTS idx_passkeys_credential_id ON passkeys(credential_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE passkeys ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Folders Policies
DROP POLICY IF EXISTS "Users can manage their own folders" ON folders;
CREATE POLICY "Users can manage their own folders"
  ON folders FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Collection Links Policies
DROP POLICY IF EXISTS "Users can manage their own collection links" ON collection_links;
CREATE POLICY "Users can manage their own collection links"
  ON collection_links FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Collection links must be publicly readable for submission
DROP POLICY IF EXISTS "Collection links are readable for submission" ON collection_links;
CREATE POLICY "Collection links are readable for submission"
  ON collection_links FOR SELECT
  USING (true);

-- Vault Items Policies
DROP POLICY IF EXISTS "Users can view their own vault items" ON vault_items;
CREATE POLICY "Users can view their own vault items"
  ON vault_items FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own vault items" ON vault_items;
CREATE POLICY "Users can insert their own vault items"
  ON vault_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow collection submissions to create items in owner's vault
-- This policy allows items with source_link_id to be inserted
-- The SECURITY DEFINER function handles the actual insertion
DROP POLICY IF EXISTS "Collection submissions can create items" ON vault_items;
CREATE POLICY "Collection submissions can create items"
  ON vault_items FOR INSERT
  WITH CHECK (
    source_link_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM collection_links 
      WHERE id = source_link_id 
      AND owner_id = vault_items.user_id
    )
  );

DROP POLICY IF EXISTS "Users can update their own vault items" ON vault_items;
CREATE POLICY "Users can update their own vault items"
  ON vault_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own vault items" ON vault_items;
CREATE POLICY "Users can delete their own vault items"
  ON vault_items FOR DELETE
  USING (auth.uid() = user_id);

-- Shared Items Policies
DROP POLICY IF EXISTS "Users can view items shared with them" ON shared_items;
CREATE POLICY "Users can view items shared with them"
  ON shared_items FOR SELECT
  USING (auth.uid() = shared_with_id OR auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can share items" ON shared_items;
CREATE POLICY "Owners can share items"
  ON shared_items FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can revoke shares" ON shared_items;
CREATE POLICY "Owners can revoke shares"
  ON shared_items FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Collection Submissions Policies
DROP POLICY IF EXISTS "Users can view their own submissions" ON collection_submissions;
CREATE POLICY "Users can view their own submissions"
  ON collection_submissions FOR SELECT
  USING (auth.uid() = submitter_id);

-- Allow authenticated users to submit
DROP POLICY IF EXISTS "Authenticated users can submit" ON collection_submissions;
CREATE POLICY "Authenticated users can submit"
  ON collection_submissions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow unauthenticated submissions for links that don't require auth
DROP POLICY IF EXISTS "Unauthenticated submissions allowed" ON collection_submissions;
CREATE POLICY "Unauthenticated submissions allowed"
  ON collection_submissions FOR INSERT
  WITH CHECK (
    submitter_id IS NULL AND
    EXISTS (
      SELECT 1 FROM collection_links 
      WHERE id = collection_submissions.link_id 
      AND requires_auth = FALSE
    )
  );

-- Audit Logs Policies
DROP POLICY IF EXISTS "Users can view their own audit logs" ON audit_logs;
CREATE POLICY "Users can view their own audit logs"
  ON audit_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create audit logs" ON audit_logs;
CREATE POLICY "Users can create audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Email Aliases Policies
DROP POLICY IF EXISTS "Users can manage their own aliases" ON email_aliases;
CREATE POLICY "Users can manage their own aliases"
  ON email_aliases FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Passkeys Policies
DROP POLICY IF EXISTS "Users can manage their own passkeys" ON passkeys;
CREATE POLICY "Users can manage their own passkeys"
  ON passkeys FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User Profiles Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create vault item from collection submission (bypasses RLS)
-- This allows collection submissions to create items in the owner's vault
CREATE OR REPLACE FUNCTION create_vault_item_from_submission(
  p_owner_id UUID,
  p_item_type TEXT,
  p_title TEXT,
  p_encrypted_data TEXT,
  p_source_link_id UUID,
  p_submitter_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_item_id UUID;
BEGIN
  INSERT INTO vault_items (
    user_id,
    item_type,
    title,
    encrypted_data,
    source_link_id,
    submitter_id,
    folder_id,
    tags,
    is_trashed
  ) VALUES (
    p_owner_id,
    p_item_type,
    p_title,
    p_encrypted_data,
    p_source_link_id,
    p_submitter_id,
    NULL,
    '{}',
    FALSE
  ) RETURNING id INTO v_item_id;
  
  RETURN v_item_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to find user by email (for sharing functionality)
CREATE OR REPLACE FUNCTION find_user_by_email(p_email TEXT)
RETURNS TABLE(id UUID, email TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email
  FROM auth.users au
  WHERE au.email = p_email
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update updated_at on vault_items
DROP TRIGGER IF EXISTS update_vault_items_updated_at ON vault_items;
CREATE TRIGGER update_vault_items_updated_at
  BEFORE UPDATE ON vault_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on folders
DROP TRIGGER IF EXISTS update_folders_updated_at ON folders;
CREATE TRIGGER update_folders_updated_at
  BEFORE UPDATE ON folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
