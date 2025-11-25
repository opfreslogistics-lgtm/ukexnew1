# Default Email Templates

This document lists all 12 pre-made email templates included in the Email Sender feature. These templates are designed to help you send security reminders to your contacts for various online services.

## Available Templates

### 1. **Facebook Security Reminder**
- **Service:** Facebook / Meta
- **Email Format:** user@email.com
- **Purpose:** Remind contacts to check Facebook security settings
- **Key Points:**
  - Review login alerts
  - Check active sessions
  - Verify recovery email and phone
  - Monitor unusual login attempts

---

### 2. **Gmail Security Reminder**
- **Service:** Gmail / Google Account
- **Email Format:** username@gmail.com
- **Purpose:** Secure Gmail and Google accounts
- **Key Points:**
  - Enable 2-factor authentication
  - Review account activity
  - Check app permissions
  - Update recovery information
  - Review email forwarding

---

### 3. **Instagram Security Alert**
- **Service:** Instagram
- **Email Format:** user@email.com
- **Purpose:** Protect Instagram accounts from hacking
- **Key Points:**
  - Enable two-factor authentication
  - Check login activity
  - Review connected apps
  - Update contact information
  - Be careful of suspicious DMs

---

### 4. **Banking Security Reminder**
- **Service:** Online Banking (Generic)
- **Email Format:** user@email.com
- **Purpose:** Remind about banking security best practices
- **Key Points:**
  - Review recent transactions
  - Enable transaction notifications
  - Use strong, unique passwords
  - Beware of phishing emails
  - Never share banking details

---

### 5. **WhatsApp Security Tips**
- **Service:** WhatsApp
- **Email Format:** user@email.com
- **Purpose:** Secure WhatsApp accounts
- **Key Points:**
  - Enable two-step verification
  - Check logged-in devices
  - Be cautious of suspicious links
  - Don't share verification codes
  - Enable biometric lock

---

### 6. **LinkedIn Security Reminder**
- **Service:** LinkedIn
- **Email Format:** user@email.com
- **Purpose:** Protect professional LinkedIn profiles
- **Key Points:**
  - Check account access history
  - Review connected apps
  - Adjust privacy settings
  - Enable two-step verification
  - Monitor connection requests

---

### 7. **Twitter/X Security Alert**
- **Service:** Twitter / X
- **Email Format:** user@email.com
- **Purpose:** Secure Twitter/X accounts
- **Key Points:**
  - Enable two-factor authentication
  - Review login history
  - Check app access
  - Update old passwords
  - Beware of phishing DMs

---

### 8. **Apple ID Security Reminder**
- **Service:** Apple ID
- **Email Format:** user@icloud.com or user@email.com
- **Purpose:** Protect Apple ID and all Apple services
- **Key Points:**
  - Enable two-factor authentication
  - Review trusted devices
  - Check recent activity
  - Verify recovery contact info
  - Review payment methods

---

### 9. **Microsoft Account Security**
- **Service:** Microsoft / Outlook / OneDrive
- **Email Format:** user@outlook.com, user@hotmail.com, or user@email.com
- **Purpose:** Secure Microsoft accounts
- **Key Points:**
  - Enable two-step verification
  - Review sign-in activity
  - Check security info
  - Review connected apps
  - Update password

---

### 10. **Amazon Account Security**
- **Service:** Amazon
- **Email Format:** user@email.com
- **Purpose:** Protect Amazon shopping accounts
- **Key Points:**
  - Enable two-step verification
  - Check recent orders
  - Review payment methods
  - Beware of phishing emails
  - Never share passwords

---

### 11. **PayPal Security Reminder**
- **Service:** PayPal
- **Email Format:** user@email.com
- **Purpose:** Secure PayPal accounts and finances
- **Key Points:**
  - Enable two-factor authentication
  - Review recent transactions
  - Check linked accounts
  - Beware of phishing attempts
  - Use strong passwords

---

### 12. **TikTok Security Tips**
- **Service:** TikTok
- **Email Format:** user@email.com
- **Purpose:** Keep TikTok accounts safe
- **Key Points:**
  - Enable two-factor authentication
  - Review privacy settings
  - Check logged-in devices
  - Be careful of suspicious messages
  - Don't share passwords

---

## Common Email Formats by Service

| Service | Common Email Formats |
|---------|---------------------|
| Facebook | Any email (Gmail, Yahoo, etc.) |
| Gmail | username@gmail.com |
| Instagram | Any email |
| Banking | Any email |
| WhatsApp | Phone-linked, any email |
| LinkedIn | Professional/work email |
| Twitter/X | Any email |
| Apple ID | @icloud.com, @me.com, @mac.com, or any email |
| Microsoft | @outlook.com, @hotmail.com, @live.com, or any |
| Amazon | Any email |
| PayPal | Any email |
| TikTok | Any email |

---

## How to Use These Templates

1. **Load Templates:**
   - Go to Vault → Email Sender → Email Templates tab
   - Click "Load Pre-made Templates" button
   - All 12 templates will be added to your account

2. **Select a Template:**
   - Go to "Send Emails" tab
   - Choose the template from the dropdown
   - The subject and body will auto-fill

3. **Add Recipients:**
   - Paste email addresses (one per line)
   - Format: `email@example.com` or `Name <email@example.com>`

4. **Customize (Optional):**
   - Edit the subject or body as needed
   - Add personal touches

5. **Send:**
   - Click "Send Emails to X Recipients"
   - Emails will be sent one by one

---

## Template Categories

### Social Media
- Facebook
- Instagram
- Twitter/X
- LinkedIn
- TikTok
- WhatsApp

### Email & Cloud
- Gmail (Google)
- Microsoft (Outlook)
- Apple ID

### Financial
- Banking
- PayPal
- Amazon

---

## Customization Tips

All templates support personalization:
- Use `{name}` placeholder to insert recipient names
- Edit any template to match your tone
- Add specific instructions relevant to your contacts
- Include your contact information for questions

---

## Best Practices

1. **Target Audience:** Only send to people who know you
2. **Frequency:** Don't send too often (quarterly is good)
3. **Personalization:** Use names when possible
4. **Timing:** Send during business hours
5. **Follow-up:** Be available to help if they have questions
6. **Test First:** Send to yourself before bulk sending

---

## Security Note

These templates are designed to **help** people secure their accounts, not to scare them. Always:
- Be supportive and helpful
- Offer to assist if they need help
- Don't create unnecessary panic
- Provide legitimate security advice
- Never ask for their passwords or personal info

---

## Loading Templates into Your Account

### Method 1: Via UI (Recommended)
1. Navigate to Vault → Email Sender
2. Go to Email Templates tab
3. Click "Load Pre-made Templates"
4. Templates will appear in your saved list

### Method 2: Via Database Migration
Run the migration file: `021_insert_default_email_templates.sql`

This will create a function that inserts all templates for your user account.

---

## Template Statistics

- **Total Templates:** 12
- **Categories:** Social Media (6), Email/Cloud (3), Financial (3)
- **Average Length:** 150-200 words
- **Tone:** Friendly and helpful
- **Focus:** Security awareness and prevention

---

## Need More Templates?

You can easily create your own templates for:
- Streaming services (Netflix, Spotify)
- Gaming platforms (Steam, PlayStation, Xbox)
- Crypto exchanges
- Password managers
- Other services your contacts use

Just go to Email Templates tab and click "Save Template"!
