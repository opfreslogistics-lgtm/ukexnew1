# UKEX Vault - Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Supabase**
   - Create a new Supabase project at https://supabase.com
   - Go to SQL Editor and run the migration file: `supabase/migrations/001_initial_schema.sql`
   - Copy your Supabase URL and anon key from Settings > API

3. **Configure Environment Variables**
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
     ENCRYPTION_KEY=your_32_byte_hex_encryption_key
     ```
   - Generate an encryption key (32 bytes hex):
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

5. **Open the Application**
   - Navigate to http://localhost:3000
   - Create an account and start using the vault!

## Features Implemented

✅ **Authentication**
- Email/password signup and login
- Session management
- Protected routes

✅ **Vault Management**
- Create, view, edit, and delete vault items
- Support for credentials, credit cards, contacts, notes
- Secure reveal functionality with confirmation dialogs
- Copy to clipboard with auto-clear
- Item access logging

✅ **Collection Links ("Ask for Info")**
- Generate secure collection links
- One-time or multi-use links
- Configurable expiry (default 7 days)
- Recipient authentication requirement
- Automatic item creation in sender's vault
- Submission tracking and audit logs

✅ **Sharing**
- Share items with other users
- Permission levels: view, reveal, edit
- Share revocation
- Shared items view

✅ **Password Management**
- Password generator with entropy calculation
- Password strength analysis
- Password health dashboard
- Weak/reused/exposed password detection

✅ **Organization**
- Folders for organizing items
- Tags support
- Trash with 30-day retention
- Restore deleted items

✅ **Email Aliases**
- Create email aliases
- Rotate aliases
- Retire aliases
- Link aliases to vault items

✅ **Security Features**
- Client-side encryption for sensitive data
- Audit logging for all sensitive operations
- Masked display of sensitive fields
- Confirmation dialogs for reveal actions
- Access tracking

## Security Architecture

### Encryption Model
- **Client-side encryption**: All sensitive fields are encrypted before being sent to Supabase
- **Server-side encryption**: Supabase provides additional encryption at rest
- **Zero-knowledge**: The server cannot decrypt sensitive data without the client-side key

### Authentication
- Supabase Auth handles user authentication
- MFA can be enabled via Supabase dashboard
- Session management with automatic refresh

### Audit Logging
- All reveal, copy, share, create, update, and delete actions are logged
- Logs include user ID, item ID, action type, metadata, and timestamp
- Immutable audit trail

## Database Schema

The application uses the following main tables:
- `vault_items`: Stores encrypted vault items
- `folders`: Folder organization
- `shared_items`: Sharing relationships
- `collection_links`: Collection link definitions
- `collection_submissions`: Submitted data via collection links
- `audit_logs`: Audit trail
- `email_aliases`: Email alias management
- `passkeys`: WebAuthn passkey storage

## Default Configuration

- Collection link TTL: 7 days
- Trash retention: 30 days
- Session timeout: 24 hours (Supabase default)
- Password minimum length: 8 characters

## Production Considerations

1. **Encryption Key Management**
   - In production, derive encryption keys from user's master password
   - Never store encryption keys in environment variables for production
   - Consider using a key derivation function (PBKDF2, Argon2)

2. **PCI-DSS Compliance**
   - For credit card storage, consider tokenization
   - Minimize storage of full PANs
   - Use third-party payment processors when possible
   - Implement additional audit requirements

3. **MFA**
   - Enable MFA in Supabase dashboard
   - Consider WebAuthn/passkeys for passwordless authentication

4. **Backup & Recovery**
   - Implement regular database backups
   - Test restore procedures
   - Consider encrypted backups

5. **Monitoring**
   - Set up error tracking (Sentry, etc.)
   - Monitor audit logs for suspicious activity
   - Set up alerts for failed authentication attempts

## Troubleshooting

### Linter Errors
If you see TypeScript errors about missing modules, run:
```bash
npm install
```

### Supabase Connection Issues
- Verify your environment variables are set correctly
- Check that the migration has been run
- Ensure RLS policies are enabled

### Encryption Issues
- Verify ENCRYPTION_KEY is set and is 32 bytes (64 hex characters)
- Ensure the same key is used for encryption and decryption

## Next Steps

1. Customize the UI styling to match your brand
2. Add email notifications for shares and submissions
3. Implement password breach checking (Have I Been Pwned API)
4. Add WebAuthn/passkey support
5. Implement folder sharing
6. Add document upload functionality
7. Create mobile app versions

