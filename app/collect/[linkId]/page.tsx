'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CollectionLink, ItemType } from '@/types/vault.types'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Key, Mail, Lock, Globe, CreditCard, Calendar, User } from 'lucide-react'

export default function CollectPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const linkId = params.linkId as string
  const [link, setLink] = useState<CollectionLink | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Card-specific states - must be at top level, not conditionally
  const [cardNumber, setCardNumber] = useState('')
  const [expirationDate, setExpirationDate] = useState('')
  const [cardInfo, setCardInfo] = useState<any>(null)
  const [expValidation, setExpValidation] = useState<any>(null)

  useEffect(() => {
    loadLink()
    checkAuth()
  }, [linkId])

  // Sync card fields with formData when link type is card
  useEffect(() => {
    if ((link as any)?.item_type === 'card') {
      const { formatCardNumber, getCardInfo, formatExpirationDate, validateExpirationDate } = require('@/lib/card-utils')
      const cardNum = formData.cardNumber || ''
      const expDate = formData.expirationDate || ''
      
      // Only update if values have changed
      if (cardNum && cardNum !== cardNumber.replace(/\s/g, '')) {
        const digits = cardNum.replace(/\D/g, '')
        const info = getCardInfo(digits)
        setCardInfo(info)
        const formatted = formatCardNumber(digits)
        if (formatted !== cardNumber) {
          setCardNumber(formatted)
        }
      }
      
      if (expDate && expDate !== expirationDate) {
        const formatted = formatExpirationDate(expDate)
        if (formatted !== expirationDate) {
          setExpirationDate(formatted)
        }
        setExpValidation(validateExpirationDate(expDate))
      }
    }
  }, [(link as any)?.item_type, formData.cardNumber, formData.expirationDate])

  const loadLink = async () => {
    try {
      const { data, error } = await supabase
        .from('collection_links')
        .select('*')
        .eq('id', linkId)
        .single()

      if (error) throw error

      // Check if link is expired
      if (new Date(data.expires_at) < new Date()) {
        toast.error('This collection link has expired')
        return
      }

      // Check if link has reached max uses
      if (data.max_uses && data.current_uses >= data.max_uses) {
        toast.error('This collection link has reached its maximum number of uses')
        return
      }

      setLink(data as any)
    } catch (error: any) {
      console.error('Error loading link:', error)
      toast.error('Invalid or expired collection link')
    } finally {
      setIsLoading(false)
    }
  }

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setIsAuthenticated(!!session)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!link) return

    // Check authentication requirement
    if ((link as any).requires_auth && !isAuthenticated) {
      toast.error('You must sign in to submit information')
      router.push(`/auth/login?redirect=/collect/${linkId}`)
      return
    }

    setIsSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if ((link as any).requires_auth && !user) {
        throw new Error('Authentication required')
      }

      // Encrypt the submitted data
      const { encryptObject } = await import('@/lib/encryption')
      const encryptedData = encryptObject(formData)

      // Create submission
      const { error: submitError } = await supabase
        .from('collection_submissions')
        .insert({
          link_id: linkId,
          submitter_id: user?.id || null,
          encrypted_data: encryptedData,
        })

      if (submitError) throw submitError

      // Update link usage count
      await supabase
        .from('collection_links')
          .update({ current_uses: (link as any).current_uses + 1 })
        .eq('id', linkId)

      // Create item in owner's vault using a server-side function
      // This bypasses RLS since we're inserting on behalf of the owner
          const title = formData.title || formData.fullName || formData.cardholderName || `Submitted ${((link as any).item_type || 'Item').charAt(0).toUpperCase() + ((link as any).item_type || 'Item').slice(1)}`
      const { encryptObject: encryptForVault } = await import('@/lib/encryption')
      
      // Re-encrypt with owner's key (simplified - in production would use owner's key)
      const vaultEncrypted = encryptForVault(formData)

      // Use RPC function to insert item (bypasses RLS)
      const { error: itemError } = await supabase.rpc('create_vault_item_from_submission', {
            p_owner_id: (link as any).owner_id,
            p_item_type: (link as any).item_type,
        p_title: title,
        p_encrypted_data: vaultEncrypted,
        p_source_link_id: linkId,
        p_submitter_id: user?.id || null,
      })

      if (itemError) {
        // Fallback: try direct insert (might fail due to RLS)
        const { error: fallbackError } = await supabase
          .from('vault_items')
          .insert({
                user_id: (link as any).owner_id,
                item_type: (link as any).item_type,
            title,
            encrypted_data: vaultEncrypted,
            source_link_id: linkId,
            submitter_id: user?.id || null,
            folder_id: null,
            tags: [],
            is_trashed: false,
          })
        
        if (fallbackError) throw fallbackError
      }

      toast.success('Information submitted successfully')
      setFormData({})
      
      // Redirect to website if it's a credential type and has a website URL
      if ((link as any).item_type === 'credential' && (link as any).website_url) {
        // Ensure the URL has a protocol
        const websiteUrl = (link as any).website_url.startsWith('http') 
          ? (link as any).website_url 
          : `https://${(link as any).website_url}`
        
        setTimeout(() => {
          // Open the website in the same tab
          window.location.href = websiteUrl
        }, 1500)
      } else {
        // Show confirmation page for other types or if no website URL
        setTimeout(() => {
          router.push('/collect/success')
        }, 1500)
      }
    } catch (error: any) {
      console.error('Error submitting:', error)
      toast.error(error.message || 'Failed to submit information')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 dark:border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading secure link...</p>
        </div>
      </div>
    )
  }

  if (!link) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4 transition-colors duration-300">
        <div className="max-w-md w-full text-center card dark:bg-slate-800 dark:border-slate-700">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Link Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">This collection link is invalid or has expired.</p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">Go to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  if ((link as any).requires_auth && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4 transition-colors duration-300">
        <div className="max-w-md w-full space-y-6 card dark:bg-slate-800 dark:border-slate-700">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Sign In Required</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              To protect senders and recipients, you must sign in to submit sensitive information.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              Your submission will be securely encrypted and only accessible by the link owner.
            </p>
          </div>
          <div className="space-y-3">
            <Link href={`/auth/login?redirect=/collect/${linkId}`}>
              <Button className="w-full">Sign In</Button>
            </Link>
            <Link href={`/auth/signup?redirect=/collect/${linkId}`}>
              <Button variant="secondary" className="w-full">Create Account</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { formatCardNumber, getCardInfo } = require('@/lib/card-utils')
    const input = e.target.value
    const digits = input.replace(/\D/g, '')
    const info = getCardInfo(digits)
    
    if (digits.length > info.maxLength) return
    
    const formatted = formatCardNumber(digits)
    setCardNumber(formatted)
    setFormData({ ...formData, cardNumber: formatted })
    setCardInfo(info)
  }

  const handleExpirationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { formatExpirationDate, validateExpirationDate } = require('@/lib/card-utils')
    const input = e.target.value
    const formatted = formatExpirationDate(input)
    setExpirationDate(formatted)
    setFormData({ ...formData, expirationDate: formatted })
    setExpValidation(validateExpirationDate(formatted))
  }

  const renderFormFields = () => {
    if (!link) return null

    const labelTextColor = (link as any).label_text_color
    const labelBgColor = (link as any).label_background_color
    const inputBgColor = (link as any).input_background_color
    const inputTextColor = (link as any).input_text_color
    const inputBorderColor = (link as any).input_border_color
    const iconBgColor = (link as any).icon_background_color || '#ec4899'
    
    if ((link as any).item_type === 'card') {
      return (
        <>
          <div>
            <label 
              className="block text-sm font-semibold mb-2"
              style={{
                color: labelTextColor || undefined,
                backgroundColor: labelBgColor || undefined,
                padding: labelBgColor ? '0.5rem' : undefined,
                borderRadius: labelBgColor ? '0.5rem' : undefined,
              }}
            >
              Cardholder Name <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              value={formData.cardholderName || ''}
              onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
              className="w-full px-5 py-4 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
              style={{
                backgroundColor: inputBgColor || undefined,
                color: inputTextColor || undefined,
                borderColor: inputBorderColor || undefined,
              }}
              required
            />
          </div>
          <div>
            <label 
              className="block text-sm font-semibold mb-2 flex items-center gap-2"
              style={{
                color: labelTextColor || undefined,
                backgroundColor: labelBgColor || undefined,
                padding: labelBgColor ? '0.5rem' : undefined,
                borderRadius: labelBgColor ? '0.5rem' : undefined,
              }}
            >
              <span 
                className="p-1.5 rounded-lg"
                style={{ backgroundColor: iconBgColor }}
              >
                <CreditCard size={16} className="text-white" />
              </span>
              Card Number <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              value={cardNumber}
              onChange={handleCardNumberChange}
              maxLength={cardInfo?.type === 'amex' ? 17 : 19}
              className={`w-full px-5 py-4 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all font-mono placeholder-gray-400 dark:placeholder-gray-500 ${
                cardInfo?.valid 
                  ? 'border-green-500 dark:border-green-600' 
                  : cardNumber.length > 0 
                    ? 'border-red-500 dark:border-red-600' 
                    : ''
              }`}
              style={{
                backgroundColor: inputBgColor || undefined,
                color: inputTextColor || undefined,
                borderColor: cardInfo?.valid 
                  ? undefined 
                  : cardNumber.length > 0 
                    ? undefined 
                    : inputBorderColor || undefined,
              }}
              placeholder="1234 5678 9012 3456"
              required
            />
            {cardInfo && cardInfo.type !== 'unknown' && (
              <p className={`mt-2 text-sm ${cardInfo.valid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {cardInfo.valid ? '✓ Valid' : 'Invalid'} {cardInfo.type.toUpperCase()} card
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label 
                className="block text-sm font-semibold mb-2 flex items-center gap-2"
                style={{
                  color: labelTextColor || undefined,
                  backgroundColor: labelBgColor || undefined,
                  padding: labelBgColor ? '0.5rem' : undefined,
                  borderRadius: labelBgColor ? '0.5rem' : undefined,
                }}
              >
                <span 
                  className="p-1.5 rounded-lg"
                  style={{ backgroundColor: iconBgColor }}
                >
                  <Calendar size={16} className="text-white" />
                </span>
                Expiration Date <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <input
                value={expirationDate}
                onChange={handleExpirationChange}
                maxLength={5}
                className={`w-full px-5 py-4 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all font-mono placeholder-gray-400 dark:placeholder-gray-500 ${
                  expValidation?.valid && !expValidation?.expired
                    ? 'border-green-500 dark:border-green-600' 
                    : expirationDate.length > 0 
                      ? 'border-red-500 dark:border-red-600' 
                      : ''
                }`}
                style={{
                  backgroundColor: inputBgColor || undefined,
                  color: inputTextColor || undefined,
                  borderColor: expValidation?.valid && !expValidation?.expired
                    ? undefined 
                    : expirationDate.length > 0 
                      ? undefined 
                      : inputBorderColor || undefined,
                }}
                placeholder="MM/YY"
                required
              />
              {expValidation?.expired && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  This card has expired
                </p>
              )}
            </div>
            <div>
              <label 
                className="block text-sm font-semibold mb-2 flex items-center gap-2"
                style={{
                  color: labelTextColor || undefined,
                  backgroundColor: labelBgColor || undefined,
                  padding: labelBgColor ? '0.5rem' : undefined,
                  borderRadius: labelBgColor ? '0.5rem' : undefined,
                }}
              >
                <span 
                  className="p-1.5 rounded-lg"
                  style={{ backgroundColor: iconBgColor }}
                >
                  <Lock size={16} className="text-white" />
                </span>
                CVV <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <input
                type="password"
                value={formData.cvv || ''}
                onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                className="w-full px-5 py-4 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
                style={{
                  backgroundColor: inputBgColor || undefined,
                  color: inputTextColor || undefined,
                  borderColor: inputBorderColor || undefined,
                }}
                required
                maxLength={4}
              />
            </div>
          </div>
        </>
      )
    } else if ((link as any).item_type === 'credential') {
      return (
        <>
              <div>
                <label 
                  className="block text-sm font-semibold mb-2 flex items-center gap-2"
                  style={{
                    color: labelTextColor || undefined,
                    backgroundColor: labelBgColor || undefined,
                    padding: labelBgColor ? '0.5rem' : undefined,
                    borderRadius: labelBgColor ? '0.5rem' : undefined,
                  }}
                >
                  <span 
                    className="p-1.5 rounded-lg"
                    style={{ backgroundColor: iconBgColor }}
                  >
                    <Mail size={16} className="text-white" />
                  </span>
                  Email or Username <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.username || formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value, email: e.target.value })}
                  className="w-full px-5 py-4 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
                  style={{
                    backgroundColor: inputBgColor || undefined,
                    color: inputTextColor || undefined,
                    borderColor: inputBorderColor || undefined,
                  }}
                  placeholder="user@example.com or username"
                  required
                />
              </div>
              <div>
                <label 
                  className="block text-sm font-semibold mb-2 flex items-center gap-2"
                  style={{
                    color: labelTextColor || undefined,
                    backgroundColor: labelBgColor || undefined,
                    padding: labelBgColor ? '0.5rem' : undefined,
                    borderRadius: labelBgColor ? '0.5rem' : undefined,
                  }}
                >
                  <span 
                    className="p-1.5 rounded-lg"
                    style={{ backgroundColor: iconBgColor }}
                  >
                    <Lock size={16} className="text-white" />
                  </span>
                  Password <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-5 py-4 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all font-mono placeholder-gray-400 dark:placeholder-gray-500"
                  style={{
                    backgroundColor: inputBgColor || undefined,
                    color: inputTextColor || undefined,
                    borderColor: inputBorderColor || undefined,
                  }}
                  placeholder="Enter password"
                  required
                />
              </div>
        </>
      )
    } else if ((link as any).item_type === 'contact') {
      return (
        <>
          <div>
            <label 
              className="block text-sm font-semibold mb-2 flex items-center gap-2"
              style={{
                color: labelTextColor || undefined,
                backgroundColor: labelBgColor || undefined,
                padding: labelBgColor ? '0.5rem' : undefined,
                borderRadius: labelBgColor ? '0.5rem' : undefined,
              }}
            >
              <span 
                className="p-1.5 rounded-lg"
                style={{ backgroundColor: iconBgColor }}
              >
                <User size={16} className="text-white" />
              </span>
              Full Name <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              value={formData.fullName || ''}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-5 py-4 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
              style={{
                backgroundColor: inputBgColor || undefined,
                color: inputTextColor || undefined,
                borderColor: inputBorderColor || undefined,
              }}
              required
            />
          </div>
          <div>
            <label 
              className="block text-sm font-semibold mb-2 flex items-center gap-2"
              style={{
                color: labelTextColor || undefined,
                backgroundColor: labelBgColor || undefined,
                padding: labelBgColor ? '0.5rem' : undefined,
                borderRadius: labelBgColor ? '0.5rem' : undefined,
              }}
            >
              <span 
                className="p-1.5 rounded-lg"
                style={{ backgroundColor: iconBgColor }}
              >
                <Mail size={16} className="text-white" />
              </span>
              Email
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-5 py-4 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
              style={{
                backgroundColor: inputBgColor || undefined,
                color: inputTextColor || undefined,
                borderColor: inputBorderColor || undefined,
              }}
            />
          </div>
          <div>
            <label 
              className="block text-sm font-semibold mb-2 flex items-center gap-2"
              style={{
                color: labelTextColor || undefined,
                backgroundColor: labelBgColor || undefined,
                padding: labelBgColor ? '0.5rem' : undefined,
                borderRadius: labelBgColor ? '0.5rem' : undefined,
              }}
            >
              <span 
                className="p-1.5 rounded-lg"
                style={{ backgroundColor: iconBgColor }}
              >
                <Globe size={16} className="text-white" />
              </span>
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-5 py-4 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
              style={{
                backgroundColor: inputBgColor || undefined,
                color: inputTextColor || undefined,
                borderColor: inputBorderColor || undefined,
              }}
            />
          </div>
          <div>
            <label 
              className="block text-sm font-semibold mb-2"
              style={{
                color: labelTextColor || undefined,
                backgroundColor: labelBgColor || undefined,
                padding: labelBgColor ? '0.5rem' : undefined,
                borderRadius: labelBgColor ? '0.5rem' : undefined,
              }}
            >
              Address Line 1
            </label>
            <input
              value={formData.addressLine1 || ''}
              onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
              className="w-full px-5 py-4 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
              style={{
                backgroundColor: inputBgColor || undefined,
                color: inputTextColor || undefined,
                borderColor: inputBorderColor || undefined,
              }}
            />
          </div>
          <div>
            <label 
              className="block text-sm font-semibold mb-2"
              style={{
                color: labelTextColor || undefined,
                backgroundColor: labelBgColor || undefined,
                padding: labelBgColor ? '0.5rem' : undefined,
                borderRadius: labelBgColor ? '0.5rem' : undefined,
              }}
            >
              Address Line 2
            </label>
            <input
              value={formData.addressLine2 || ''}
              onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
              className="w-full px-5 py-4 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
              style={{
                backgroundColor: inputBgColor || undefined,
                color: inputTextColor || undefined,
                borderColor: inputBorderColor || undefined,
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label 
                className="block text-sm font-semibold mb-2"
                style={{
                  color: labelTextColor || undefined,
                  backgroundColor: labelBgColor || undefined,
                  padding: labelBgColor ? '0.5rem' : undefined,
                  borderRadius: labelBgColor ? '0.5rem' : undefined,
                }}
              >
                City
              </label>
              <input
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-5 py-4 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
                style={{
                  backgroundColor: inputBgColor || undefined,
                  color: inputTextColor || undefined,
                  borderColor: inputBorderColor || undefined,
                }}
              />
            </div>
            <div>
              <label 
                className="block text-sm font-semibold mb-2"
                style={{
                  color: labelTextColor || undefined,
                  backgroundColor: labelBgColor || undefined,
                  padding: labelBgColor ? '0.5rem' : undefined,
                  borderRadius: labelBgColor ? '0.5rem' : undefined,
                }}
              >
                State or Province
              </label>
              <input
                value={formData.state || ''}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-5 py-4 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
                style={{
                  backgroundColor: inputBgColor || undefined,
                  color: inputTextColor || undefined,
                  borderColor: inputBorderColor || undefined,
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label 
                className="block text-sm font-semibold mb-2"
                style={{
                  color: labelTextColor || undefined,
                  backgroundColor: labelBgColor || undefined,
                  padding: labelBgColor ? '0.5rem' : undefined,
                  borderRadius: labelBgColor ? '0.5rem' : undefined,
                }}
              >
                ZIP or Postal Code
              </label>
              <input
                value={formData.zipCode || ''}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                className="w-full px-5 py-4 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
                style={{
                  backgroundColor: inputBgColor || undefined,
                  color: inputTextColor || undefined,
                  borderColor: inputBorderColor || undefined,
                }}
              />
            </div>
            <div>
              <label 
                className="block text-sm font-semibold mb-2"
                style={{
                  color: labelTextColor || undefined,
                  backgroundColor: labelBgColor || undefined,
                  padding: labelBgColor ? '0.5rem' : undefined,
                  borderRadius: labelBgColor ? '0.5rem' : undefined,
                }}
              >
                Country or Region
              </label>
              <input
                value={formData.country || ''}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-5 py-4 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
                style={{
                  backgroundColor: inputBgColor || undefined,
                  color: inputTextColor || undefined,
                  borderColor: inputBorderColor || undefined,
                }}
              />
            </div>
          </div>
        </>
      )
    }
    return null
  }

  const formBg = (link as any).form_background_color || '#ffffff'
  const pageBg = (link as any).page_background_color || '#f3f4f6'
  const formWidth = (link as any).form_width || null
  const labelTextColor = (link as any).label_text_color
  const labelBgColor = (link as any).label_background_color
  const inputBgColor = (link as any).input_background_color
  const inputTextColor = (link as any).input_text_color
  const inputBorderColor = (link as any).input_border_color
  const iconBgColor = (link as any).icon_background_color || '#ec4899'

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-12 dark:bg-slate-900 transition-colors duration-300"
      style={{ backgroundColor: pageBg }}
    >
      <div 
        className="w-full space-y-6"
        style={{ maxWidth: formWidth ? `${formWidth}px` : '672px' }}
      >
        {/* Logo Display - Only show for credential type */}
        {(link as any).logo_url && (link as any).item_type === 'credential' && (
          <div className="text-center mb-6">
            <img 
              src={(link as any).logo_url} 
              alt="Logo" 
              className="w-20 h-20 mx-auto rounded-xl shadow-lg object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
        )}

        <form 
          onSubmit={handleSubmit} 
          className="card space-y-6 shadow-2xl border-2 dark:border-slate-700"
          style={{ backgroundColor: formBg }}
        >
          {renderFormFields()}

          <div 
            className={`flex ${
              (link as any).button_alignment === 'left' ? 'justify-start' :
              (link as any).button_alignment === 'right' ? 'justify-end' :
              (link as any).button_alignment === 'full' ? 'w-full' :
              'justify-center'
            }`}
          >
            <button
              type="submit"
              className={`px-5 py-3 rounded-2xl font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 transform active:scale-95 shadow-lg hover:shadow-xl ${
                (link as any).button_alignment === 'full' ? 'w-full' : 'min-w-[200px]'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
              style={{
                backgroundColor: (link as any).button_background_color || '#ec4899',
                color: (link as any).button_text_color || '#ffffff',
                border: 'none',
              }}
              disabled={isSubmitting}
            >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </span>
            ) : (
              (link as any).button_text || 'Submit'
            )}
          </button>
          </div>
        </form>
      </div>
    </div>
  )
}

