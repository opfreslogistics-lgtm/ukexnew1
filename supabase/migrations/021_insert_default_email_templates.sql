-- Insert default email templates for various account types
-- Note: These will be inserted for the first user who accesses the system
-- You can modify this to insert for specific users or all users

-- Function to insert default templates for a user
CREATE OR REPLACE FUNCTION insert_default_email_templates(p_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Check if user already has templates
  IF NOT EXISTS (SELECT 1 FROM email_templates WHERE user_id = p_user_id) THEN
    
    -- Facebook Security Reminder
    INSERT INTO email_templates (user_id, template_name, subject, body)
    VALUES (
      p_user_id,
      'Facebook Security Reminder',
      'Important: Check Your Facebook Security Settings',
      E'Hi my dear ones,

I hope you\'re all okay. I just wanted to remind you to check your Facebook security settings from time to time. There are a lot of unusual login attempts happening these days, so it\'s good to make sure everything is protected.

Please take a moment to review your login alerts, active sessions, and make sure your recovery email and phone number are correct. If you need help with anything, feel free to ask me — I just want to make sure you\'re all safe online.

Best regards'
    );

    -- Gmail/Google Account Security
    INSERT INTO email_templates (user_id, template_name, subject, body)
    VALUES (
      p_user_id,
      'Gmail Security Reminder',
      'Reminder: Secure Your Gmail Account',
      E'Hello there,

I wanted to reach out about keeping your Gmail account secure. With all the phishing attempts going around, it\'s important to take a few minutes to review your account security.

Here\'s what I recommend checking:
• Enable 2-factor authentication if you haven\'t already
• Review your recent account activity
• Check which apps have access to your Gmail
• Update your recovery email and phone number
• Review your email forwarding settings

Stay safe online!

Best wishes'
    );

    -- Instagram Security
    INSERT INTO email_templates (user_id, template_name, subject, body)
    VALUES (
      p_user_id,
      'Instagram Security Alert',
      'Keep Your Instagram Account Safe',
      E'Hey everyone,

Just a quick reminder to check your Instagram security settings. There have been many cases of account hacking lately, and I want to make sure you\'re all protected.

Please take a moment to:
• Enable two-factor authentication
• Check your login activity
• Review apps connected to your account
• Make sure your email and phone number are up to date
• Be careful of suspicious DMs or links

Let me know if you need any help with this!

Take care'
    );

    -- Banking Security
    INSERT INTO email_templates (user_id, template_name, subject, body)
    VALUES (
      p_user_id,
      'Banking Security Reminder',
      'Important: Review Your Banking Security',
      E'Dear friends,

I wanted to remind you about the importance of keeping your online banking secure. With increasing fraud attempts, it\'s crucial to stay vigilant.

Please consider:
• Reviewing your recent transactions regularly
• Enabling SMS or app notifications for all transactions
• Using strong, unique passwords for each banking app
• Never sharing your banking details via email or phone
• Being cautious of phishing emails claiming to be from your bank

Your financial security is important!

Stay safe'
    );

    -- WhatsApp Security
    INSERT INTO email_templates (user_id, template_name, subject, body)
    VALUES (
      p_user_id,
      'WhatsApp Security Tips',
      'Secure Your WhatsApp Account',
      E'Hi everyone,

I hope you\'re doing well. I wanted to share some important tips about WhatsApp security since we all use it so much.

Please make sure to:
• Enable two-step verification in Settings > Account
• Check which devices are logged into your account
• Be careful about suspicious messages or links
• Don\'t share verification codes with anyone
• Enable biometric lock for extra security

Let me know if you need help setting any of this up!

Best regards'
    );

    -- LinkedIn Security
    INSERT INTO email_templates (user_id, template_name, subject, body)
    VALUES (
      p_user_id,
      'LinkedIn Security Reminder',
      'Protect Your LinkedIn Profile',
      E'Hello,

Just a friendly reminder to check your LinkedIn security settings. Since it contains professional information, it\'s important to keep it secure.

Please review:
• Your account access and login history
• Connected apps and services
• Privacy settings for your profile
• Two-step verification settings
• Suspicious connection requests

Stay safe and professional!

Best wishes'
    );

    -- Twitter/X Security
    INSERT INTO email_templates (user_id, template_name, subject, body)
    VALUES (
      p_user_id,
      'Twitter/X Security Alert',
      'Keep Your Twitter/X Account Secure',
      E'Hi friends,

With all the recent security concerns on social media, I wanted to remind you to check your Twitter/X security settings.

Please take a moment to:
• Enable two-factor authentication
• Review your login history and sessions
• Check apps with access to your account
• Update your password if it\'s old
• Be careful of phishing attempts via DM

Let me know if you need any assistance!

Take care'
    );

    -- Apple ID Security
    INSERT INTO email_templates (user_id, template_name, subject, body)
    VALUES (
      p_user_id,
      'Apple ID Security Reminder',
      'Secure Your Apple ID',
      E'Hello everyone,

Your Apple ID is the key to all your Apple services, so keeping it secure is crucial. I wanted to remind you to check your security settings.

Please review:
• Two-factor authentication is enabled
• Your trusted devices list
• Recent account activity
• Recovery email and phone number
• Payment methods and subscriptions

Apple ID security is important for protecting your data!

Best regards'
    );

    -- Microsoft Account Security
    INSERT INTO email_templates (user_id, template_name, subject, body)
    VALUES (
      p_user_id,
      'Microsoft Account Security',
      'Review Your Microsoft Account Security',
      E'Hi there,

Just a reminder to check your Microsoft account security settings. This includes your Outlook, OneDrive, and other Microsoft services.

Please make sure to:
• Enable two-step verification
• Review recent sign-in activity
• Check your security info (email/phone)
• Review connected apps and devices
• Update your password if needed

Stay secure online!

Best wishes'
    );

    -- Amazon Account Security
    INSERT INTO email_templates (user_id, template_name, subject, body)
    VALUES (
      p_user_id,
      'Amazon Account Security',
      'Protect Your Amazon Account',
      E'Dear friends,

With so many of us shopping online, I wanted to remind you about Amazon account security. There are many phishing attempts targeting Amazon users.

Please review:
• Enable two-step verification
• Check your recent orders and account activity
• Review your payment methods
• Be cautious of fake Amazon emails
• Never share your password or verification codes

Shop safely!

Take care'
    );

    -- PayPal Security
    INSERT INTO email_templates (user_id, template_name, subject, body)
    VALUES (
      p_user_id,
      'PayPal Security Reminder',
      'Secure Your PayPal Account',
      E'Hello everyone,

PayPal security is crucial since it\'s connected to your finances. I wanted to remind you to review your security settings.

Please check:
• Two-factor authentication is enabled
• Recent account activity and transactions
• Linked bank accounts and cards
• Be aware of phishing emails claiming to be PayPal
• Use a strong, unique password

Your financial security matters!

Best regards'
    );

    -- TikTok Security
    INSERT INTO email_templates (user_id, template_name, subject, body)
    VALUES (
      p_user_id,
      'TikTok Security Tips',
      'Keep Your TikTok Account Safe',
      E'Hi friends,

For those of you using TikTok, I wanted to share some security tips to keep your account safe.

Please make sure to:
• Enable two-factor authentication
• Review your privacy settings
• Check devices logged into your account
• Be careful about suspicious messages or links
• Don\'t share your password with anyone

Stay safe and have fun!

Best wishes'
    );

  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION insert_default_email_templates(UUID) TO authenticated;

-- Optional: Uncomment to auto-insert templates for all existing users
-- DO $$
-- DECLARE
--   user_record RECORD;
-- BEGIN
--   FOR user_record IN SELECT id FROM auth.users LOOP
--     PERFORM insert_default_email_templates(user_record.id);
--   END LOOP;
-- END $$;
