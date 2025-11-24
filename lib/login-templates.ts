// Login form templates inspired by popular platforms
// Generic layouts without copyrighted assets

export interface LoginTemplate {
  id: string
  name: string
  description: string
  colors: {
    primary: string
    secondary: string
    background: string
    formBackground: string
    text: string
    inputBackground: string
    inputBorder: string
    buttonBackground: string
    buttonText: string
  }
  layout: {
    formWidth: string
    inputHeight: string
    inputPadding: string
    inputBorderRadius: string
    inputBorderWidth: string
    buttonBorderRadius: string
    formGap: string
    fontSize: string
  }
  features: {
    showLogo: boolean
    showTagline: boolean
    centeredLayout: boolean
    shadowStyle: string
  }
}

export const LOGIN_TEMPLATES: Record<string, LoginTemplate> = {
  custom: {
    id: 'custom',
    name: 'Custom Design',
    description: 'Design your own unique login form',
    colors: {
      primary: '#ec4899',
      secondary: '#8b5cf6',
      background: '#f3f4f6',
      formBackground: '#ffffff',
      text: '#111827',
      inputBackground: '#f9fafb',
      inputBorder: '#d1d5db',
      buttonBackground: '#ec4899',
      buttonText: '#ffffff',
    },
    layout: {
      formWidth: '420px',
      inputHeight: '56px',
      inputPadding: '16px 20px',
      inputBorderRadius: '16px',
      inputBorderWidth: '2px',
      buttonBorderRadius: '16px',
      formGap: '24px',
      fontSize: '16px',
    },
    features: {
      showLogo: true,
      showTagline: true,
      centeredLayout: true,
      shadowStyle: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    },
  },
  
  facebook: {
    id: 'facebook',
    name: 'Social Media Style',
    description: 'Clean, modern social platform design',
    colors: {
      primary: '#1877f2',
      secondary: '#42b72a',
      background: '#f0f2f5',
      formBackground: '#ffffff',
      text: '#1c1e21',
      inputBackground: '#ffffff',
      inputBorder: '#dddfe2',
      buttonBackground: '#1877f2',
      buttonText: '#ffffff',
    },
    layout: {
      formWidth: '396px',
      inputHeight: '52px',
      inputPadding: '14px 16px',
      inputBorderRadius: '6px',
      inputBorderWidth: '1px',
      buttonBorderRadius: '6px',
      formGap: '12px',
      fontSize: '17px',
    },
    features: {
      showLogo: true,
      showTagline: false,
      centeredLayout: true,
      shadowStyle: '0 2px 4px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1)',
    },
  },

  gmail: {
    id: 'gmail',
    name: 'Email Provider Style',
    description: 'Clean, minimal email service design',
    colors: {
      primary: '#1a73e8',
      secondary: '#5f6368',
      background: '#ffffff',
      formBackground: '#ffffff',
      text: '#202124',
      inputBackground: '#ffffff',
      inputBorder: '#dadce0',
      buttonBackground: '#1a73e8',
      buttonText: '#ffffff',
    },
    layout: {
      formWidth: '448px',
      inputHeight: '56px',
      inputPadding: '13px 15px',
      inputBorderRadius: '4px',
      inputBorderWidth: '1px',
      buttonBorderRadius: '4px',
      formGap: '24px',
      fontSize: '16px',
    },
    features: {
      showLogo: true,
      showTagline: true,
      centeredLayout: true,
      shadowStyle: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    },
  },

  instagram: {
    id: 'instagram',
    name: 'Photo Sharing Style',
    description: 'Modern, gradient social media design',
    colors: {
      primary: '#405de6',
      secondary: '#e1306c',
      background: '#fafafa',
      formBackground: '#ffffff',
      text: '#262626',
      inputBackground: '#fafafa',
      inputBorder: '#dbdbdb',
      buttonBackground: '#0095f6',
      buttonText: '#ffffff',
    },
    layout: {
      formWidth: '350px',
      inputHeight: '38px',
      inputPadding: '9px 8px',
      inputBorderRadius: '3px',
      inputBorderWidth: '1px',
      buttonBorderRadius: '8px',
      formGap: '8px',
      fontSize: '14px',
    },
    features: {
      showLogo: true,
      showTagline: false,
      centeredLayout: true,
      shadowStyle: '0 0 1px rgba(0,0,0,0.15)',
    },
  },

  linkedin: {
    id: 'linkedin',
    name: 'Professional Network Style',
    description: 'Corporate, professional design',
    colors: {
      primary: '#0a66c2',
      secondary: '#70b5f9',
      background: '#f3f2ef',
      formBackground: '#ffffff',
      text: '#000000',
      inputBackground: '#ffffff',
      inputBorder: '#8f8f8f',
      buttonBackground: '#0a66c2',
      buttonText: '#ffffff',
    },
    layout: {
      formWidth: '400px',
      inputHeight: '52px',
      inputPadding: '12px 16px',
      inputBorderRadius: '4px',
      inputBorderWidth: '1px',
      buttonBorderRadius: '24px',
      formGap: '16px',
      fontSize: '16px',
    },
    features: {
      showLogo: true,
      showTagline: true,
      centeredLayout: true,
      shadowStyle: '0 4px 12px rgba(0,0,0,0.15)',
    },
  },

  amazon: {
    id: 'amazon',
    name: 'E-Commerce Style',
    description: 'Clean shopping platform design',
    colors: {
      primary: '#ff9900',
      secondary: '#232f3e',
      background: '#ffffff',
      formBackground: '#ffffff',
      text: '#0f1111',
      inputBackground: '#ffffff',
      inputBorder: '#a6a6a6',
      buttonBackground: '#f0c14b',
      buttonText: '#0f1111',
    },
    layout: {
      formWidth: '350px',
      inputHeight: '33px',
      inputPadding: '3px 7px',
      inputBorderRadius: '3px',
      inputBorderWidth: '1px',
      buttonBorderRadius: '3px',
      formGap: '14px',
      fontSize: '13px',
    },
    features: {
      showLogo: true,
      showTagline: false,
      centeredLayout: true,
      shadowStyle: 'none',
    },
  },

  netflix: {
    id: 'netflix',
    name: 'Streaming Service Style',
    description: 'Bold, entertainment platform design',
    colors: {
      primary: '#e50914',
      secondary: '#b20710',
      background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.8) 100%)',
      formBackground: 'rgba(0, 0, 0, 0.75)',
      text: '#ffffff',
      inputBackground: '#333333',
      inputBorder: '#8c8c8c',
      buttonBackground: '#e50914',
      buttonText: '#ffffff',
    },
    layout: {
      formWidth: '450px',
      inputHeight: '50px',
      inputPadding: '16px 20px',
      inputBorderRadius: '4px',
      inputBorderWidth: '0px',
      buttonBorderRadius: '4px',
      formGap: '16px',
      fontSize: '16px',
    },
    features: {
      showLogo: true,
      showTagline: false,
      centeredLayout: true,
      shadowStyle: '0 4px 20px rgba(0,0,0,0.5)',
    },
  },

  microsoft: {
    id: 'microsoft',
    name: 'Enterprise Suite Style',
    description: 'Modern, professional business design',
    colors: {
      primary: '#0078d4',
      secondary: '#106ebe',
      background: '#ffffff',
      formBackground: '#ffffff',
      text: '#1b1a19',
      inputBackground: '#ffffff',
      inputBorder: '#8a8886',
      buttonBackground: '#0078d4',
      buttonText: '#ffffff',
    },
    layout: {
      formWidth: '440px',
      inputHeight: '48px',
      inputPadding: '8px 12px',
      inputBorderRadius: '2px',
      inputBorderWidth: '1px',
      buttonBorderRadius: '2px',
      formGap: '16px',
      fontSize: '15px',
    },
    features: {
      showLogo: true,
      showTagline: true,
      centeredLayout: true,
      shadowStyle: '0 2px 6px rgba(0,0,0,0.2)',
    },
  },

  twitter: {
    id: 'twitter',
    name: 'Microblogging Style',
    description: 'Clean, minimal social platform design',
    colors: {
      primary: '#1d9bf0',
      secondary: '#657786',
      background: '#ffffff',
      formBackground: '#ffffff',
      text: '#0f1419',
      inputBackground: '#ffffff',
      inputBorder: '#cfd9de',
      buttonBackground: '#0f1419',
      buttonText: '#ffffff',
    },
    layout: {
      formWidth: '400px',
      inputHeight: '56px',
      inputPadding: '12px 16px',
      inputBorderRadius: '4px',
      inputBorderWidth: '1px',
      buttonBorderRadius: '9999px',
      formGap: '20px',
      fontSize: '17px',
    },
    features: {
      showLogo: true,
      showTagline: false,
      centeredLayout: true,
      shadowStyle: 'none',
    },
  },

  apple: {
    id: 'apple',
    name: 'Premium Tech Style',
    description: 'Elegant, minimalist design',
    colors: {
      primary: '#000000',
      secondary: '#1d1d1f',
      background: '#ffffff',
      formBackground: '#ffffff',
      text: '#1d1d1f',
      inputBackground: '#ffffff',
      inputBorder: '#d2d2d7',
      buttonBackground: '#0071e3',
      buttonText: '#ffffff',
    },
    layout: {
      formWidth: '440px',
      inputHeight: '44px',
      inputPadding: '0 16px',
      inputBorderRadius: '12px',
      inputBorderWidth: '1px',
      buttonBorderRadius: '12px',
      formGap: '16px',
      fontSize: '17px',
    },
    features: {
      showLogo: true,
      showTagline: true,
      centeredLayout: true,
      shadowStyle: '0 2px 16px rgba(0,0,0,0.08)',
    },
  },

  paypal: {
    id: 'paypal',
    name: 'Payment Service Style',
    description: 'Trustworthy financial platform design',
    colors: {
      primary: '#0070ba',
      secondary: '#003087',
      background: '#f5f7fa',
      formBackground: '#ffffff',
      text: '#2c2e2f',
      inputBackground: '#ffffff',
      inputBorder: '#cbd2d6',
      buttonBackground: '#0070ba',
      buttonText: '#ffffff',
    },
    layout: {
      formWidth: '400px',
      inputHeight: '48px',
      inputPadding: '10px 15px',
      inputBorderRadius: '6px',
      inputBorderWidth: '1px',
      buttonBorderRadius: '30px',
      formGap: '16px',
      fontSize: '16px',
    },
    features: {
      showLogo: true,
      showTagline: false,
      centeredLayout: true,
      shadowStyle: '0 2px 10px rgba(0,0,0,0.1)',
    },
  },

  tiktok: {
    id: 'tiktok',
    name: 'Video Platform Style',
    description: 'Fun, energetic social media design',
    colors: {
      primary: '#fe2c55',
      secondary: '#25f4ee',
      background: '#ffffff',
      formBackground: '#ffffff',
      text: '#161823',
      inputBackground: '#f1f1f2',
      inputBorder: 'transparent',
      buttonBackground: '#fe2c55',
      buttonText: '#ffffff',
    },
    layout: {
      formWidth: '380px',
      inputHeight: '48px',
      inputPadding: '12px 16px',
      inputBorderRadius: '4px',
      inputBorderWidth: '0px',
      buttonBorderRadius: '4px',
      formGap: '12px',
      fontSize: '15px',
    },
    features: {
      showLogo: true,
      showTagline: false,
      centeredLayout: true,
      shadowStyle: '0 2px 8px rgba(0,0,0,0.06)',
    },
  },

  yahoo: {
    id: 'yahoo',
    name: 'Classic Email Style',
    description: 'Traditional email provider design',
    colors: {
      primary: '#6001d2',
      secondary: '#5b00c4',
      background: '#ffffff',
      formBackground: '#ffffff',
      text: '#191e45',
      inputBackground: '#ffffff',
      inputBorder: '#b8b8b8',
      buttonBackground: '#6001d2',
      buttonText: '#ffffff',
    },
    layout: {
      formWidth: '440px',
      inputHeight: '52px',
      inputPadding: '10px 16px',
      inputBorderRadius: '4px',
      inputBorderWidth: '1px',
      buttonBorderRadius: '4px',
      formGap: '18px',
      fontSize: '16px',
    },
    features: {
      showLogo: true,
      showTagline: true,
      centeredLayout: true,
      shadowStyle: '0 2px 8px rgba(0,0,0,0.1)',
    },
  },

  walmart: {
    id: 'walmart',
    name: 'Retail Chain Style',
    description: 'Friendly retail platform design',
    colors: {
      primary: '#0071ce',
      secondary: '#ffc220',
      background: '#f2f8fd',
      formBackground: '#ffffff',
      text: '#2e2f32',
      inputBackground: '#ffffff',
      inputBorder: '#b6c1cd',
      buttonBackground: '#0071ce',
      buttonText: '#ffffff',
    },
    layout: {
      formWidth: '440px',
      inputHeight: '50px',
      inputPadding: '12px 16px',
      inputBorderRadius: '4px',
      inputBorderWidth: '1px',
      buttonBorderRadius: '4px',
      formGap: '16px',
      fontSize: '16px',
    },
    features: {
      showLogo: true,
      showTagline: false,
      centeredLayout: true,
      shadowStyle: '0 4px 8px rgba(0,0,0,0.1)',
    },
  },
}

export function getTemplate(id: string): LoginTemplate {
  return LOGIN_TEMPLATES[id] || LOGIN_TEMPLATES.custom
}

export function getTemplateList() {
  return Object.values(LOGIN_TEMPLATES)
}
