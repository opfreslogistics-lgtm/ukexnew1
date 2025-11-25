# Email Sender Feature Guide

## Overview

The Email Sender feature allows you to send personalized emails to multiple recipients using your own SMTP server. This is perfect for sending security reminders, notifications, or any bulk email communication to your contacts.

## Features

- ✅ **SMTP Configuration**: Configure your own SMTP server settings
- ✅ **Email Templates**: Create and save reusable email templates
- ✅ **Bulk Email Sending**: Send emails to multiple recipients one by one
- ✅ **Email List Upload**: Upload recipient list via text input
- ✅ **Personalization**: Use `{name}` placeholder to personalize emails
- ✅ **Send History**: Track all sent emails with success/failure status
- ✅ **Security**: All settings are stored securely with RLS policies

## Setup Instructions

### 1. Configure SMTP Settings

Navigate to **Vault → Email Sender → SMTP Configuration** tab and fill in your SMTP details:

- **SMTP Host**: Your email provider's SMTP server (e.g., `smtp.gmail.com`)
- **SMTP Port**: Usually `587` for TLS or `465` for SSL
- **SMTP Username**: Your email address
- **SMTP Password**: Your email password or app-specific password
- **From Email**: The email address that will appear as sender
- **From Name**: (Optional) The name that will appear as sender

#### Gmail Example:
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP Username: your-email@gmail.com
SMTP Password: your-app-password (generate from Google Account settings)
From Email: your-email@gmail.com
From Name: Your Name
```

**Note**: For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an "App Password" from your Google Account settings
3. Use the app password instead of your regular password

### 2. Create Email Templates

Go to the **Email Templates** tab to create and manage your templates:

1. Enter a **Template Name** (e.g., "Security Reminder")
2. Enter the **Subject** line
3. Write your **Email Body**
4. Click **Save Template**

#### Example Template:

**Template Name**: Facebook Security Reminder

**Subject**: Important: Check Your Facebook Security Settings

**Body**:
```
Hi my dear ones,

I hope you're all okay. I just wanted to remind you to check your Facebook security settings from time to time. There are a lot of unusual login attempts happening these days, so it's good to make sure everything is protected.

Please take a moment to review your login alerts, active sessions, and make sure your recovery email and phone number are correct. If you need help with anything, feel free to ask me — I just want to make sure you're all safe online.

Best regards,
{name}
```

**Tip**: Use `{name}` in your template to personalize with recipient names.

### 3. Send Emails

Navigate to the **Send Emails** tab:

1. **Select a Template** (optional): Choose from your saved templates to pre-fill the content
2. **Email Content**: Edit the subject and body as needed
3. **Upload Recipient List**: Paste email addresses in the text area

#### Email List Format

You can use two formats:

**Simple format** (email only):
```
john@example.com
jane@example.com
bob@example.com
```

**Named format** (name + email):
```
John Doe <john@example.com>
Jane Smith <jane@example.com>
Bob Johnson <bob@example.com>
```

When using the named format, `{name}` in your email will be replaced with the recipient's name.

4. **Send**: Click "Send Emails to X Recipients" button

The system will:
- Send emails one by one to each recipient
- Display progress in real-time
- Show success/failure count
- Log all sends to history

## Database Schema

The feature uses three tables:

### smtp_settings
Stores your SMTP configuration (one per user)

### email_templates
Stores your saved email templates

### email_send_history
Logs all sent emails with status and error messages

## Security Considerations

1. **SMTP Password**: Currently stored in the database. For production use, consider encrypting this field or using environment variables.
2. **Rate Limiting**: Consider adding rate limiting to prevent abuse.
3. **Spam Prevention**: Make sure you have permission to email all recipients to avoid being marked as spam.
4. **App Passwords**: Always use app-specific passwords instead of your main email password.

## Troubleshooting

### Email Not Sending

1. **Check SMTP Settings**: Verify your host, port, username, and password
2. **App Password**: For Gmail, make sure you're using an app password, not your regular password
3. **Firewall**: Ensure your server can connect to the SMTP port
4. **Authentication**: Some providers require "Less Secure Apps" to be enabled

### Gmail-Specific Issues

- Enable 2-factor authentication
- Generate an App Password: Google Account → Security → 2-Step Verification → App passwords
- Use port 587 with TLS

### SMTP Provider Settings

**Gmail**:
- Host: `smtp.gmail.com`
- Port: `587` or `465`

**Outlook/Hotmail**:
- Host: `smtp-mail.outlook.com`
- Port: `587`

**Yahoo**:
- Host: `smtp.mail.yahoo.com`
- Port: `587`

**Custom Domain/cPanel**:
- Host: Usually `mail.yourdomain.com`
- Port: `587` or `465`
- Check with your hosting provider

## Best Practices

1. **Test First**: Send a test email to yourself before sending to multiple recipients
2. **Small Batches**: Start with small batches to ensure everything works correctly
3. **Personalization**: Use the `{name}` placeholder to make emails more personal
4. **Clear Subject**: Use clear, non-spammy subject lines
5. **Unsubscribe Link**: Consider adding an unsubscribe option for bulk emails
6. **Permission**: Only email people who have given you permission

## API Endpoints

- `POST /api/smtp/config` - Save SMTP settings
- `GET /api/smtp/config` - Get SMTP settings
- `GET /api/email-templates` - Get all templates
- `POST /api/email-templates` - Create template
- `PUT /api/email-templates` - Update template
- `DELETE /api/email-templates?id=<id>` - Delete template
- `POST /api/email/send` - Send emails

## Future Enhancements

Potential improvements:
- CSV file upload for recipient lists
- Email scheduling
- Rich text editor for email body
- Email preview before sending
- Attachment support
- Email analytics (open rate, click rate)
- Bounce handling
- Unsubscribe management
