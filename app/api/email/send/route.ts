import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { template_id, recipients, subject, emailBody } = body;

  // Get SMTP settings
  const { data: smtpSettings, error: smtpError } = await supabase
    .from('smtp_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (smtpError || !smtpSettings) {
    return NextResponse.json({ error: 'SMTP settings not configured' }, { status: 400 });
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: smtpSettings.smtp_host,
    port: smtpSettings.smtp_port,
    secure: smtpSettings.smtp_port === 465, // true for 465, false for other ports
    auth: {
      user: smtpSettings.smtp_user,
      pass: smtpSettings.smtp_password,
    },
  });

  const results = [];
  const errors = [];

  // Send emails one by one
  for (const recipient of recipients) {
    try {
      // Personalize the email body with recipient name if available
      const personalizedBody = emailBody.replace(/\{name\}/g, recipient.name || 'there');

      // Create beautiful HTML email
      const htmlEmail = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px;">
  <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
        <div style="background: white; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
          <span style="font-size: 40px;">🔐</span>
        </div>
        <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 800; text-shadow: 0 2px 10px rgba(0,0,0,0.2);">Security Reminder</h1>
      </td>
    </tr>
    
    <!-- Body -->
    <tr>
      <td style="padding: 40px 30px;">
        <div style="color: #333; font-size: 16px; line-height: 1.8;">
          ${personalizedBody.split('\n').map((line: string) => {
            if (line.trim().startsWith('──────')) {
              return '<hr style="border: none; border-top: 2px solid #e5e7eb; margin: 30px 0;">';
            }
            if (line.trim().startsWith('🔐')) {
              return `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin: 20px 0; font-weight: 600;">${line}</div>`;
            }
            if (line.includes('http://') || line.includes('https://')) {
              return `<div style="margin: 20px 0;"><a href="${line.trim()}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 12px; font-weight: 700; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">${line.trim()}</a></div>`;
            }
            return line ? `<p style="margin: 0 0 15px 0;">${line}</p>` : '<br>';
          }).join('')}
        </div>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
          This is an automated security reminder to help keep your accounts safe.<br>
          If you have any questions, feel free to reach out.
        </p>
        <div style="margin-top: 20px;">
          <span style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 700;">
            🔒 OPFRES Vault - Secure & Private
          </span>
        </div>
      </td>
    </tr>
  </table>
  
  <!-- Footer Text -->
  <div style="text-align: center; margin-top: 30px; color: white; font-size: 13px; opacity: 0.9;">
    <p style="margin: 5px 0;">Sent with care to keep you safe online</p>
  </div>
</body>
</html>
      `;

      await transporter.sendMail({
        from: smtpSettings.smtp_from_name 
          ? `"${smtpSettings.smtp_from_name}" <${smtpSettings.smtp_from_email}>`
          : smtpSettings.smtp_from_email,
        to: recipient.email,
        subject: subject,
        text: personalizedBody,
        html: htmlEmail,
      });

      // Log success
      await supabase.from('email_send_history').insert({
        user_id: user.id,
        template_id: template_id || null,
        recipient_email: recipient.email,
        subject: subject,
        status: 'success',
      });

      results.push({ email: recipient.email, status: 'success' });
    } catch (error: any) {
      // Log failure
      await supabase.from('email_send_history').insert({
        user_id: user.id,
        template_id: template_id || null,
        recipient_email: recipient.email,
        subject: subject,
        status: 'failed',
        error_message: error.message,
      });

      errors.push({ email: recipient.email, error: error.message });
    }
  }

  return NextResponse.json({ 
    success: true,
    sent: results.length,
    failed: errors.length,
    results,
    errors 
  });
}
