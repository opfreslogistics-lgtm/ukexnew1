'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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

export default function EmailSenderPage() {
  const [activeTab, setActiveTab] = useState<'smtp' | 'templates' | 'send'>('smtp');
  const [smtpSettings, setSmtpSettings] = useState<SMTPSettings>({
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    smtp_from_email: '',
    smtp_from_name: '',
  });
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [newTemplate, setNewTemplate] = useState({
    template_name: '',
    subject: '',
    body: '',
  });
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [emailList, setEmailList] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [sendProgress, setSendProgress] = useState<{ sent: number; failed: number; total: number } | null>(null);

  useEffect(() => {
    loadSMTPSettings();
    loadTemplates();
  }, []);

  const loadSMTPSettings = async () => {
    try {
      const res = await fetch('/api/smtp/config');
      const result = await res.json();
      if (result.data) {
        setSmtpSettings(result.data);
      }
    } catch (error) {
      console.error('Error loading SMTP settings:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const res = await fetch('/api/email-templates');
      const result = await res.json();
      if (result.data) {
        setTemplates(result.data);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const saveSMTPSettings = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/smtp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smtpSettings),
      });
      const result = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'SMTP settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving SMTP settings' });
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async () => {
    if (!newTemplate.template_name || !newTemplate.subject || !newTemplate.body) {
      setMessage({ type: 'error', text: 'Please fill in all template fields' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate),
      });
      const result = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Template saved successfully!' });
        setNewTemplate({ template_name: '', subject: '', body: '' });
        loadTemplates();
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save template' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving template' });
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/email-templates?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Template deleted successfully!' });
        loadTemplates();
      } else {
        const result = await res.json();
        setMessage({ type: 'error', text: result.error || 'Failed to delete template' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error deleting template' });
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setNewTemplate({
        template_name: '',
        subject: template.subject,
        body: template.body,
      });
      setSelectedTemplate(templateId);
    }
  };

  const parseEmailList = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const parsed: Recipient[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Support formats: email@example.com or "Name <email@example.com>"
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
    if (recipients.length === 0) {
      setMessage({ type: 'error', text: 'Please add recipients' });
      return;
    }

    if (!newTemplate.subject || !newTemplate.body) {
      setMessage({ type: 'error', text: 'Please fill in subject and body' });
      return;
    }

    setLoading(true);
    setMessage(null);
    setSendProgress({ sent: 0, failed: 0, total: recipients.length });

    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: selectedTemplate || null,
          recipients,
          subject: newTemplate.subject,
          emailBody: newTemplate.body,
        }),
      });
      const result = await res.json();
      
      if (res.ok) {
        setSendProgress({ sent: result.sent, failed: result.failed, total: recipients.length });
        setMessage({ 
          type: result.failed > 0 ? 'error' : 'success', 
          text: `Sent ${result.sent} emails successfully. ${result.failed} failed.` 
        });
        
        if (result.errors.length > 0) {
          console.error('Failed emails:', result.errors);
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to send emails' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error sending emails' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Email Sender</h1>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('smtp')}
          className={`pb-2 px-4 ${
            activeTab === 'smtp'
              ? 'border-b-2 border-blue-500 text-blue-600 font-semibold'
              : 'text-gray-600'
          }`}
        >
          SMTP Configuration
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`pb-2 px-4 ${
            activeTab === 'templates'
              ? 'border-b-2 border-blue-500 text-blue-600 font-semibold'
              : 'text-gray-600'
          }`}
        >
          Email Templates
        </button>
        <button
          onClick={() => setActiveTab('send')}
          className={`pb-2 px-4 ${
            activeTab === 'send'
              ? 'border-b-2 border-blue-500 text-blue-600 font-semibold'
              : 'text-gray-600'
          }`}
        >
          Send Emails
        </button>
      </div>

      {/* SMTP Configuration Tab */}
      {activeTab === 'smtp' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">SMTP Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">SMTP Host</label>
              <Input
                type="text"
                value={smtpSettings.smtp_host}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_host: e.target.value })}
                placeholder="smtp.gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SMTP Port</label>
              <Input
                type="number"
                value={smtpSettings.smtp_port}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_port: parseInt(e.target.value) })}
                placeholder="587"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SMTP Username</label>
              <Input
                type="text"
                value={smtpSettings.smtp_user}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_user: e.target.value })}
                placeholder="your-email@gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SMTP Password</label>
              <Input
                type="password"
                value={smtpSettings.smtp_password}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_password: e.target.value })}
                placeholder="Your app password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">From Email</label>
              <Input
                type="email"
                value={smtpSettings.smtp_from_email}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_from_email: e.target.value })}
                placeholder="your-email@gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">From Name (Optional)</label>
              <Input
                type="text"
                value={smtpSettings.smtp_from_name}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_from_name: e.target.value })}
                placeholder="Your Name"
              />
            </div>
            <Button onClick={saveSMTPSettings} disabled={loading}>
              {loading ? 'Saving...' : 'Save SMTP Settings'}
            </Button>
          </div>
        </div>
      )}

      {/* Email Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Create Email Template</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Template Name</label>
                <Input
                  type="text"
                  value={newTemplate.template_name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, template_name: e.target.value })}
                  placeholder="Security Reminder"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <Input
                  type="text"
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                  placeholder="Important: Check Your Security Settings"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Body</label>
                <textarea
                  value={newTemplate.body}
                  onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={12}
                  placeholder="Hi my dear ones,

I hope you're all okay. I just wanted to remind you to check your Facebook security settings from time to time. There are a lot of unusual login attempts happening these days, so it's good to make sure everything is protected.

Please take a moment to review your login alerts, active sessions, and make sure your recovery email and phone number are correct. If you need help with anything, feel free to ask me — I just want to make sure you're all safe online."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Tip: Use {'{name}'} in your template to personalize with recipient names
                </p>
              </div>
              <Button onClick={saveTemplate} disabled={loading}>
                {loading ? 'Saving...' : 'Save Template'}
              </Button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Saved Templates</h2>
            {templates.length === 0 ? (
              <p className="text-gray-500">No templates saved yet.</p>
            ) : (
              <div className="space-y-3">
                {templates.map((template) => (
                  <div key={template.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{template.template_name}</h3>
                        <p className="text-gray-600 text-sm mt-1">Subject: {template.subject}</p>
                        <p className="text-gray-500 text-sm mt-2 whitespace-pre-wrap line-clamp-3">
                          {template.body}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          onClick={() => {
                            loadTemplate(template.id);
                            setActiveTab('send');
                          }}
                          variant="secondary"
                        >
                          Use
                        </Button>
                        <Button
                          onClick={() => deleteTemplate(template.id)}
                          variant="secondary"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Send Emails Tab */}
      {activeTab === 'send' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Select Template (Optional)</h2>
            <select
              value={selectedTemplate}
              onChange={(e) => loadTemplate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select a template --</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.template_name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Email Content</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <Input
                  type="text"
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                  placeholder="Email subject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Body</label>
                <textarea
                  value={newTemplate.body}
                  onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={12}
                  placeholder="Your email content here..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Upload Recipient List</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email List (one email per line, or "Name &lt;email@example.com&gt;" format)
                </label>
                <textarea
                  value={emailList}
                  onChange={(e) => {
                    setEmailList(e.target.value);
                    parseEmailList(e.target.value);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  rows={8}
                  placeholder="john@example.com&#10;Jane Doe <jane@example.com>&#10;bob@example.com"
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium">Recipients: {recipients.length}</p>
                {recipients.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {recipients.slice(0, 5).map((r, i) => (
                      <p key={i} className="text-sm text-gray-600">
                        {r.name ? `${r.name} (${r.email})` : r.email}
                      </p>
                    ))}
                    {recipients.length > 5 && (
                      <p className="text-sm text-gray-500">...and {recipients.length - 5} more</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {sendProgress && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Sending Progress</h3>
              <div className="space-y-2">
                <p className="text-sm">Total: {sendProgress.total}</p>
                <p className="text-sm text-green-600">Sent: {sendProgress.sent}</p>
                <p className="text-sm text-red-600">Failed: {sendProgress.failed}</p>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${((sendProgress.sent + sendProgress.failed) / sendProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-lg shadow-md">
            <Button
              onClick={sendEmails}
              disabled={loading || recipients.length === 0}
              className="w-full"
            >
              {loading ? 'Sending...' : `Send Emails to ${recipients.length} Recipients`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
