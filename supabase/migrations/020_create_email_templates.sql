-- Create table for SMTP settings
CREATE TABLE IF NOT EXISTS smtp_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  smtp_host TEXT NOT NULL,
  smtp_port INTEGER NOT NULL,
  smtp_user TEXT NOT NULL,
  smtp_password TEXT NOT NULL, -- Should be encrypted in production
  smtp_from_email TEXT NOT NULL,
  smtp_from_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create table for email templates
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for email sending history
CREATE TABLE IF NOT EXISTS email_send_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL, -- 'success', 'failed', 'pending'
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE smtp_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_send_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for smtp_settings
CREATE POLICY "Users can view their own SMTP settings"
  ON smtp_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own SMTP settings"
  ON smtp_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own SMTP settings"
  ON smtp_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SMTP settings"
  ON smtp_settings FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for email_templates
CREATE POLICY "Users can view their own email templates"
  ON email_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email templates"
  ON email_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email templates"
  ON email_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email templates"
  ON email_templates FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for email_send_history
CREATE POLICY "Users can view their own email history"
  ON email_send_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email history"
  ON email_send_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_smtp_settings_user_id ON smtp_settings(user_id);
CREATE INDEX idx_email_templates_user_id ON email_templates(user_id);
CREATE INDEX idx_email_send_history_user_id ON email_send_history(user_id);
CREATE INDEX idx_email_send_history_sent_at ON email_send_history(sent_at DESC);
