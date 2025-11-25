import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getEmailTemplate } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { template_id, recipients, subject, emailBody, accountType } = body;

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

      // Get branded email template
      const htmlEmail = getEmailTemplate(accountType || 'facebook', subject, personalizedBody);

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
