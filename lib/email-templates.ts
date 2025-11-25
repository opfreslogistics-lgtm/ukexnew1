// Branded email templates for each account type

export const getEmailTemplate = (accountType: string, subject: string, body: string) => {
  const templates: { [key: string]: any } = {
    facebook: {
      colors: {
        primary: '#1877F2',
        secondary: '#0866FF',
        background: 'linear-gradient(135deg, #1877F2 0%, #0866FF 100%)',
      },
      logo: '📘',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
    },
    gmail: {
      colors: {
        primary: '#EA4335',
        secondary: '#FBBC04',
        background: 'linear-gradient(135deg, #EA4335 0%, #FBBC04 50%, #34A853 100%)',
      },
      logo: '📧',
      icon: 'M',
    },
    instagram: {
      colors: {
        primary: '#E4405F',
        secondary: '#833AB4',
        background: 'linear-gradient(135deg, #F58529 0%, #DD2A7B 50%, #8134AF 100%)',
      },
      logo: '📷',
      icon: 'IG',
    },
    banking: {
      colors: {
        primary: '#10B981',
        secondary: '#059669',
        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      },
      logo: '🏦',
      icon: '$',
    },
    whatsapp: {
      colors: {
        primary: '#25D366',
        secondary: '#128C7E',
        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
      },
      logo: '💬',
      icon: 'W',
    },
    linkedin: {
      colors: {
        primary: '#0A66C2',
        secondary: '#004182',
        background: 'linear-gradient(135deg, #0A66C2 0%, #004182 100%)',
      },
      logo: '💼',
      icon: 'in',
    },
    twitter: {
      colors: {
        primary: '#1DA1F2',
        secondary: '#0C85D0',
        background: 'linear-gradient(135deg, #1DA1F2 0%, #0C85D0 100%)',
      },
      logo: '🐦',
      icon: '𝕏',
    },
    apple: {
      colors: {
        primary: '#000000',
        secondary: '#555555',
        background: 'linear-gradient(135deg, #000000 0%, #555555 100%)',
      },
      logo: '🍎',
      icon: '',
    },
    microsoft: {
      colors: {
        primary: '#00A4EF',
        secondary: '#7FBA00',
        background: 'linear-gradient(135deg, #F25022 0%, #00A4EF 25%, #7FBA00 75%, #FFB900 100%)',
      },
      logo: '🪟',
      icon: 'M',
    },
    amazon: {
      colors: {
        primary: '#FF9900',
        secondary: '#146EB4',
        background: 'linear-gradient(135deg, #FF9900 0%, #146EB4 100%)',
      },
      logo: '📦',
      icon: 'a',
    },
    paypal: {
      colors: {
        primary: '#0070BA',
        secondary: '#003087',
        background: 'linear-gradient(135deg, #0070BA 0%, #003087 100%)',
      },
      logo: '💳',
      icon: 'P',
    },
    tiktok: {
      colors: {
        primary: '#000000',
        secondary: '#FE2C55',
        background: 'linear-gradient(135deg, #000000 0%, #FE2C55 50%, #00F2EA 100%)',
      },
      logo: '🎵',
      icon: 'TT',
    },
  };

  const template = templates[accountType] || templates.facebook;
  const serviceName = accountType.charAt(0).toUpperCase() + accountType.slice(1);

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
    <!-- Branded Header -->
    <tr>
      <td style="background: ${template.colors.background}; padding: 50px 30px; text-align: center;">
        <!-- Logo Circle -->
        <div style="background: white; width: 100px; height: 100px; border-radius: 50%; margin: 0 auto 25px; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 15px 40px rgba(0,0,0,0.2);">
          <span style="font-size: 50px;">${template.logo}</span>
        </div>
        
        <!-- Service Name Badge -->
        <div style="display: inline-block; background: rgba(255,255,255,0.95); padding: 12px 24px; border-radius: 30px; margin-bottom: 20px; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
          <span style="font-size: 18px; font-weight: 800; background: ${template.colors.background}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">${serviceName} Security</span>
        </div>
        
        <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 900; text-shadow: 0 4px 15px rgba(0,0,0,0.3); letter-spacing: -0.5px;">Security Reminder</h1>
        <p style="margin: 15px 0 0 0; color: rgba(255,255,255,0.95); font-size: 16px; font-weight: 500;">Keep your account safe and secure</p>
      </td>
    </tr>
    
    <!-- Body Content -->
    <tr>
      <td style="padding: 50px 40px;">
        <!-- Alert Badge -->
        <div style="background: linear-gradient(135deg, ${template.colors.primary}15, ${template.colors.secondary}15); border-left: 4px solid ${template.colors.primary}; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 24px;">🔒</span>
            <span style="color: ${template.colors.primary}; font-weight: 700; font-size: 15px;">SECURITY ALERT</span>
          </div>
        </div>
        
        <!-- Main Content -->
        <div style="color: #333; font-size: 16px; line-height: 1.8;">
          ${body.split('\n').map((line: string) => {
            if (line.trim().startsWith('──────')) {
              return `<hr style="border: none; border-top: 2px solid #e5e7eb; margin: 35px 0;">`;
            }
            if (line.trim().startsWith('🔐')) {
              return `
                <div style="background: ${template.colors.background}; color: white; padding: 25px; border-radius: 16px; margin: 30px 0; font-weight: 600; box-shadow: 0 8px 25px rgba(0,0,0,0.15);">
                  <div style="font-size: 18px; margin-bottom: 8px;">🔐 Secure Access</div>
                  <div style="font-size: 14px; opacity: 0.95;">${line.replace('🔐', '').trim()}</div>
                </div>
              `;
            }
            if (line.includes('http://') || line.includes('https://')) {
              return `
                <div style="margin: 40px 0; text-align: center;">
                  <a href="${line.trim()}" style="display: inline-block; background: ${template.colors.background}; color: white; text-decoration: none; padding: 18px 50px; border-radius: 50px; font-weight: 800; font-size: 18px; box-shadow: 0 10px 30px rgba(0,0,0,0.25); transition: all 0.3s ease; letter-spacing: 0.5px;">
                    Sign In
                  </a>
                </div>
              `;
            }
            if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
              return `
                <div style="display: flex; align-items: start; margin: 12px 0;">
                  <span style="color: ${template.colors.primary}; font-size: 20px; margin-right: 12px; margin-top: 2px;">✓</span>
                  <span style="flex: 1; color: #4b5563;">${line.replace(/^[•\-]\s*/, '')}</span>
                </div>
              `;
            }
            return line ? `<p style="margin: 0 0 18px 0; color: #374151; line-height: 1.7;">${line}</p>` : '<div style="height: 12px;"></div>';
          }).join('')}
        </div>
        
        <!-- Security Tips Box -->
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
    
    <!-- Service-Branded Footer -->
    <tr>
      <td style="background: linear-gradient(to bottom, #ffffff, #f9fafb); padding: 40px 40px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
        <!-- Service Badge -->
        <div style="display: inline-block; background: ${template.colors.background}; padding: 12px 28px; border-radius: 50px; margin-bottom: 25px; box-shadow: 0 6px 20px rgba(0,0,0,0.12);">
          <span style="color: white; font-weight: 800; font-size: 14px; letter-spacing: 0.5px;">
            ${template.logo} ${serviceName.toUpperCase()} SECURITY TEAM
          </span>
        </div>
        
        <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 14px; line-height: 1.7;">
          This is an automated security reminder to help keep your ${serviceName} account safe.<br>
          If you have any questions or concerns, please don't hesitate to reach out.
        </p>
        
        <!-- Powered by Badge -->
        <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <span style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 20px; border-radius: 20px; font-size: 12px; font-weight: 700; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
            🔒 Sent via OPFRES Vault
          </span>
        </div>
      </td>
    </tr>
  </table>
  
  <!-- Bottom Footer Text -->
  <div style="text-align: center; margin-top: 30px; color: white; font-size: 13px; opacity: 0.95; text-shadow: 0 2px 8px rgba(0,0,0,0.2);">
    <p style="margin: 5px 0; font-weight: 600;">✨ Sent with care to keep you safe online</p>
    <p style="margin: 5px 0; opacity: 0.8; font-size: 12px;">Secure • Private • Trusted</p>
  </div>
</body>
</html>
  `;
};

// Get service name from account type
export const getServiceName = (accountType: string): string => {
  const names: { [key: string]: string } = {
    facebook: 'Facebook',
    gmail: 'Gmail',
    instagram: 'Instagram',
    banking: 'Banking',
    whatsapp: 'WhatsApp',
    linkedin: 'LinkedIn',
    twitter: 'Twitter/X',
    apple: 'Apple ID',
    microsoft: 'Microsoft',
    amazon: 'Amazon',
    paypal: 'PayPal',
    tiktok: 'TikTok',
  };
  return names[accountType] || accountType;
};
