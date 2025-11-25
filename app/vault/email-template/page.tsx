'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface SmtpSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  smtp_from_email: string;
  smtp_from_name: string;
}

interface EmailTemplate {
  id?: string;
  template_name: string;
  subject: string;
  body: string;
}

interface Recipient {
  email: string;
  name?: string;
}

export default function EmailTemplatePage() {
  const [activeTab, setActiveTab] = useState<'smtp' | 'templates' | 'send'>('smtp');
  const [smtpSettings, setSmtpSettings] = useState<SmtpSettings>({
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    smtp_from_email: '',
    smtp_from_name: '',
  });
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate>({
    template_name: 'Facebook Security Reminder',
    subject: 'Important: Check Your Facebook Security Settings',
    body: `Hi {name},

I hope you're all okay. I just wanted to remind you to check your Facebook security settings from time to time. There are a lot of unusual login attempts happening these days, so it's good to make sure everything is protected.

Please take a moment to review your login alerts, active sessions, and make sure your recovery email and phone number are correct. If you need help with anything, feel free to ask me — I just want to make sure you're all safe online.

Best regards`,
  });
  const [emailList, setEmailList] = useState<Recipient[]>([]);
  const [emailListText, setEmailListText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResults, setSendResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSmtpSettings();
    loadTemplates();
  }, []);

  const loadSmtpSettings = async () => {
    try {
      const response = await fetch('/api/smtp/config');
      const result = await response.json();
      if (result.data) {
        setSmtpSettings(result.data);
      }
    } catch (error) {
      console.error('Error loading SMTP settings:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/email-templates');
      const result = await response.json();
      if (result.data) {
        setTemplates(result.data);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const saveSmtpSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/smtp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smtpSettings),
      });
      const result = await response.json();
      if (response.ok) {
        alert('SMTP settings saved successfully!');
      } else {
        alert('Error saving SMTP settings: ' + result.error);
      }
    } catch (error) {
      alert('Error saving SMTP settings');
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/email-templates', {
        method: currentTemplate.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentTemplate,
          body: currentTemplate.body,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        alert('Template saved successfully!');
        loadTemplates();
        setCurrentTemplate({
          template_name: '',
          subject: '',
          body: '',
        });
      } else {
        alert('Error saving template: ' + result.error);
      }
    } catch (error) {
      alert('Error saving template');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = (template: EmailTemplate) => {
    setCurrentTemplate(template);
    setActiveTab('templates');
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      const response = await fetch(`/api/email-templates?id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Template deleted successfully!');
        loadTemplates();
      }
    } catch (error) {
      alert('Error deleting template');
    }
  };

  const parseEmailList = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const recipients: Recipient[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.includes(',')) {
        // Format: email,name or name,email
        const parts = trimmed.split(',').map(p => p.trim());
        if (parts[0].includes('@')) {
          recipients.push({ email: parts[0], name: parts[1] });
        } else if (parts[1].includes('@')) {
          recipients.push({ email: parts[1], name: parts[0] });
        }
      } else if (trimmed.includes('@')) {
        // Just email
        recipients.push({ email: trimmed });
      }
    }
    
    setEmailList(recipients);
  };

  const sendEmails = async () => {
    if (emailList.length === 0) {
      alert('Please upload an email list first');
      return;
    }
    
    if (!currentTemplate.subject || !currentTemplate.body) {
      alert('Please fill in subject and body');
      return;
    }

    setIsSending(true);
    setSendResults(null);
    
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: currentTemplate.id,
          recipients: emailList,
          subject: currentTemplate.subject,
          emailBody: currentTemplate.body,
        }),
      });
      
      const result = await response.json();
      setSendResults(result);
      
      if (result.success) {
        alert(`Successfully sent ${result.sent} emails! ${result.failed > 0 ? `Failed: ${result.failed}` : ''}`);
      } else {
        alert('Error sending emails: ' + result.error);
      }
    } catch (error) {
      alert('Error sending emails');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Email Template Manager</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          className={`pb-2 px-4 ${activeTab === 'smtp' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('smtp')}
        >
          SMTP Settings
        </button>
        <button
          className={`pb-2 px-4 ${activeTab === 'templates' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('templates')}
        >
          Email Templates
        </button>
        <button
          className={`pb-2 px-4 ${activeTab === 'send' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('send')}
        >
          Send Emails
        </button>
      </div>

      {/* SMTP Settings Tab */}
      {activeTab === 'smtp' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">SMTP Configuration</h2>
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
              <p className="text-xs text-gray-500 mt-1">Use 587 for TLS or 465 for SSL</p>
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
              <p className="text-xs text-gray-500 mt-1">For Gmail, use an App Password instead of your regular password</p>
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
              <label className="block text-sm font-medium mb-1">From Name</label>
              <Input
                type="text"
                value={smtpSettings.smtp_from_name}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, smtp_from_name: e.target.value })}
                placeholder="Your Name"
              />
            </div>
            <Button onClick={saveSmtpSettings} disabled={loading}>
              {loading ? 'Saving...' : 'Save SMTP Settings'}
            </Button>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template List */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Saved Templates</h2>
            {templates.length === 0 ? (
              <p className="text-gray-500">No templates saved yet</p>
            ) : (
              <div className="space-y-2">
                {templates.map((template) => (
                  <div key={template.id} className="border p-3 rounded hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <button
                        onClick={() => loadTemplate(template)}
                        className="text-left flex-1"
                      >
                        <p className="font-medium">{template.template_name}</p>
                        <p className="text-sm text-gray-500 truncate">{template.subject}</p>
                      </button>
                      <button
                        onClick={() => deleteTemplate(template.id!)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Template Editor */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              {currentTemplate.id ? 'Edit Template' : 'Create New Template'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Template Name</label>
                <Input
                  type="text"
                  value={currentTemplate.template_name}
                  onChange={(e) => setCurrentTemplate({ ...currentTemplate, template_name: e.target.value })}
                  placeholder="e.g., Facebook Security Reminder"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <Input
                  type="text"
                  value={currentTemplate.subject}
                  onChange={(e) => setCurrentTemplate({ ...currentTemplate, subject: e.target.value })}
                  placeholder="Email subject line"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Body</label>
                <textarea
                  className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={currentTemplate.body}
                  onChange={(e) => setCurrentTemplate({ ...currentTemplate, body: e.target.value })}
                  placeholder="Email content... Use {name} as a placeholder for recipient name"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tip: Use {'{name}'} in your template to personalize each email
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={saveTemplate} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Template'}
                </Button>
                {currentTemplate.id && (
                  <Button
                    onClick={() => setCurrentTemplate({ template_name: '', subject: '', body: '' })}
                    className="bg-gray-500 hover:bg-gray-600"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Emails Tab */}
      {activeTab === 'send' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Email List Upload */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Upload Email List</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email List</label>
                <textarea
                  className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  value={emailListText}
                  onChange={(e) => {
                    setEmailListText(e.target.value);
                    parseEmailList(e.target.value);
                  }}
                  placeholder="Enter one email per line, or email,name format:&#10;john@example.com&#10;jane@example.com,Jane Doe&#10;Bob Smith,bob@example.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formats: email@example.com OR email@example.com,Name OR Name,email@example.com
                </p>
              </div>
              
              {emailList.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Parsed Recipients ({emailList.length})</h3>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {emailList.map((recipient, idx) => (
                      <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                        <span className="font-medium">{recipient.email}</span>
                        {recipient.name && (
                          <span className="text-gray-600 ml-2">({recipient.name})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Send Configuration */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Email Content</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Template (Optional)</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => {
                    const template = templates.find(t => t.id === e.target.value);
                    if (template) {
                      setCurrentTemplate(template);
                    }
                  }}
                  value={currentTemplate.id || ''}
                >
                  <option value="">-- Select a template --</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.template_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <Input
                  type="text"
                  value={currentTemplate.subject}
                  onChange={(e) => setCurrentTemplate({ ...currentTemplate, subject: e.target.value })}
                  placeholder="Email subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email Body</label>
                <textarea
                  className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={currentTemplate.body}
                  onChange={(e) => setCurrentTemplate({ ...currentTemplate, body: e.target.value })}
                  placeholder="Email content..."
                />
              </div>

              <Button
                onClick={sendEmails}
                disabled={isSending || emailList.length === 0}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isSending ? 'Sending...' : `Send to ${emailList.length} Recipients`}
              </Button>

              {sendResults && (
                <div className={`p-4 rounded ${sendResults.failed > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
                  <h3 className="font-medium mb-2">Send Results</h3>
                  <p className="text-sm">✓ Sent: {sendResults.sent}</p>
                  <p className="text-sm">✗ Failed: {sendResults.failed}</p>
                  {sendResults.errors && sendResults.errors.length > 0 && (
                    <div className="mt-2 text-xs">
                      <p className="font-medium">Errors:</p>
                      {sendResults.errors.map((err: any, idx: number) => (
                        <p key={idx} className="text-red-600">
                          {err.email}: {err.error}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
