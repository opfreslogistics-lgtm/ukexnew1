// Branded email templates for each account type with official logos

export const getEmailTemplate = (accountType: string, subject: string, body: string) => {
  const templates: { [key: string]: any } = {
    facebook: {
      colors: { primary: '#1877F2', background: 'linear-gradient(135deg, #1877F2 0%, #0866FF 100%)' },
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1024px-Facebook_Logo_%282019%29.png',
      name: 'Facebook',
    },
    gmail: {
      colors: { primary: '#EA4335', background: 'linear-gradient(135deg, #EA4335 0%, #FBBC04 50%, #34A853 100%)' },
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Gmail_icon_%282020%29.svg/512px-Gmail_icon_%282020%29.svg.png',
      name: 'Gmail',
    },
    instagram: {
      colors: { primary: '#E4405F', background: 'linear-gradient(135deg, #F58529 0%, #DD2A7B 50%, #8134AF 100%)' },
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/512px-Instagram_logo_2016.svg.png',
      name: 'Instagram',
    },
    banking: {
      colors: { primary: '#10B981', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' },
      logoUrl: 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png',
      name: 'Banking',
    },
    whatsapp: {
      colors: { primary: '#25D366', background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)' },
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png',
      name: 'WhatsApp',
    },
    linkedin: {
      colors: { primary: '#0A66C2', background: 'linear-gradient(135deg, #0A66C2 0%, #004182 100%)' },
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/512px-LinkedIn_logo_initials.png',
      name: 'LinkedIn',
    },
    twitter: {
      colors: { primary: '#1DA1F2', background: 'linear-gradient(135deg, #1DA1F2 0%, #0C85D0 100%)' },
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/512px-Logo_of_Twitter.svg.png',
      name: 'Twitter',
    },
    apple: {
      colors: { primary: '#000000', background: 'linear-gradient(135deg, #000000 0%, #555555 100%)' },
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/488px-Apple_logo_black.svg.png',
      name: 'Apple',
    },
    microsoft: {
      colors: { primary: '#00A4EF', background: 'linear-gradient(135deg, #F25022 0%, #00A4EF 25%, #7FBA00 75%, #FFB900 100%)' },
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/512px-Microsoft_logo.svg.png',
      name: 'Microsoft',
    },
    amazon: {
      colors: { primary: '#FF9900', background: 'linear-gradient(135deg, #FF9900 0%, #146EB4 100%)' },
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/512px-Amazon_logo.svg.png',
      name: 'Amazon',
    },
    paypal: {
      colors: { primary: '#0070BA', background: 'linear-gradient(135deg, #0070BA 0%, #003087 100%)' },
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/512px-PayPal.svg.png',
      name: 'PayPal',
    },
    tiktok: {
      colors: { primary: '#000000', background: 'linear-gradient(135deg, #000000 0%, #FE2C55 50%, #00F2EA 100%)' },
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/512px-TikTok_logo.svg.png',
      name: 'TikTok',
    },
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
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f5f5f5; padding: 40px 20px;">
  <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    
    <!-- Clean Header with Logo -->
    <tr>
      <td style="padding: 40px 40px 20px; text-align: center; background: white;">
        <img src="${template.logoUrl}" alt="${template.name}" style="height: 60px; width: auto; margin: 0 auto 20px; display: block;" />
        <h1 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 26px; font-weight: 600; line-height: 1.3;">Security Reminder</h1>
        <p style="margin: 0; color: #666; font-size: 15px; line-height: 1.5;">Keep your account safe and secure</p>
      </td>
    </tr>
    
    <!-- Divider -->
    <tr>
      <td style="padding: 0;">
        <div style="height: 1px; background: #e5e5e5;"></div>
      </td>
    </tr>
    
    <!-- Body Content -->
    <tr>
      <td style="padding: 0 40px 40px;">
        <div style="color: #333; font-size: 16px; line-height: 1.6;">
          ${body.split('\n').map((line: string) => {
            if (line.trim().startsWith('──────')) {
              return '<hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">';
            }
            if (line.includes('http://') || line.includes('https://')) {
              return `
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 30px auto; width: 100%;">
                  <tr>
                    <td align="center">
                      <a href="${line.trim()}" style="display: inline-block; background: ${template.colors.background}; color: white; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        Sign In
                      </a>
                    </td>
                  </tr>
                </table>
              `;
            }
            if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
              return `<div style="margin: 10px 0; padding-left: 20px;"><span style="color: ${template.colors.primary};">•</span> ${line.replace(/^[•\-]\s*/, '')}</div>`;
            }
            return line ? `<p style="margin: 0 0 16px 0; color: #4a4a4a; line-height: 1.6;">${line}</p>` : '<div style="height: 16px;"></div>';
          }).join('')}
        </div>
      </td>
    </tr>
    
    <!-- Simple Footer -->
    <tr>
      <td style="background: #f9f9f9; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e5e5;">
        <p style="margin: 0; color: #999; font-size: 13px; line-height: 1.6;">
          This is a security reminder to help keep your account safe.<br>
          If you didn't request this, you can safely ignore this email.
        </p>
      </td>
    </tr>
  </table>
  
  <!-- Bottom Spacing -->
  <div style="height: 40px;"></div>
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
    twitter: 'Twitter',
    apple: 'Apple',
    microsoft: 'Microsoft',
    amazon: 'Amazon',
    paypal: 'PayPal',
    tiktok: 'TikTok',
  };
  return names[accountType] || accountType;
};
