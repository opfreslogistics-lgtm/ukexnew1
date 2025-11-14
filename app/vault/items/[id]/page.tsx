'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { VaultItem, CredentialData, CardData, ContactData } from '@/types/vault.types'
import { decryptObject, maskCardNumber, maskPassword, maskEmail } from '@/lib/encryption'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Copy, Edit, Trash2, Share2, Check, Lock } from 'lucide-react'

export default function ItemViewPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const itemId = params.id as string
  const [item, setItem] = useState<VaultItem | null>(null)
  const [decryptedData, setDecryptedData] = useState<any>(null)
  const [revealedFields, setRevealedFields] = useState<Set<string>>(new Set())
  const [showRevealConfirm, setShowRevealConfirm] = useState(false)
  const [fieldToReveal, setFieldToReveal] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    loadItem()
  }, [itemId])

  const loadItem = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUserId(user.id)

      const { data, error } = await supabase
        .from('vault_items')
        .select('*')
        .eq('id', itemId)
        .single()

      if (error) throw error

      if (data.user_id !== user.id) {
        // Check if shared
        const { data: shared } = await supabase
          .from('shared_items')
          .select('*')
          .eq('item_id', itemId)
          .eq('shared_with_id', user.id)
          .is('revoked_at', null)
          .single()

        if (!shared) {
          toast.error('You do not have access to this item')
          router.push('/vault')
          return
        }
      }

      setItem(data as any)

      // Decrypt data (but don't reveal yet)
      const decrypted = decryptObject(data.encrypted_data)
      setDecryptedData(decrypted)

      // Update last accessed
      await supabase
        .from('vault_items')
        .update({ last_accessed_at: new Date().toISOString() } as any)
        .eq('id', itemId)
    } catch (error: any) {
      console.error('Error loading item:', error)
      toast.error(error.message || 'Failed to load item')
      router.push('/vault')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReveal = (field: string) => {
    setFieldToReveal(field)
    setShowRevealConfirm(true)
  }

  const confirmReveal = async () => {
    if (!fieldToReveal || !userId) return

    // Optimistic update - reveal immediately
    setRevealedFields(new Set([...revealedFields, fieldToReveal]))
    setShowRevealConfirm(false)
    setFieldToReveal(null)
    toast.success('Field revealed')

    // Log reveal action (non-blocking)
    try {
      await supabase.from('audit_logs').insert({
        user_id: userId,
        item_id: itemId,
        action: 'reveal',
        metadata: { field: fieldToReveal },
      })
    } catch (error) {
      console.error('Error logging reveal:', error)
    }
  }

  const handleCopy = async (field: string, value: string) => {
    // Optimistic update - copy immediately
    await navigator.clipboard.writeText(value)
    setCopiedField(field)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopiedField(null), 2000)

    // Log copy action (non-blocking)
    if (userId) {
      try {
        await supabase.from('audit_logs').insert({
          user_id: userId,
          item_id: itemId,
          action: 'copy',
          metadata: { field },
        })
      } catch (error) {
        console.error('Error logging copy:', error)
      }
    }
  }

  const handleDelete = async () => {
    if (!item || !userId) return

    toast.loading('Moving to trash...', { id: 'delete-item' })

    try {
      // Parallel operations for speed
      await Promise.allSettled([
        supabase
          .from('vault_items')
          .update({
            is_trashed: true,
            trashed_at: new Date().toISOString(),
          })
          .eq('id', itemId),
        supabase.from('audit_logs').insert({
          user_id: userId,
          item_id: itemId,
          action: 'delete',
          metadata: {},
        })
      ])

      toast.success('Item moved to trash', { id: 'delete-item' })
      router.push('/vault')
      router.refresh()
    } catch (error: any) {
      console.error('Error deleting item:', error)
      toast.error('Failed to delete item', { id: 'delete-item' })
    }
  }

  const renderField = (label: string, field: string, value: any, isSensitive: boolean = false) => {
    if (!value) return null

    const isRevealed = revealedFields.has(field)
    const displayValue = isRevealed ? value : (isSensitive ? maskValue(field, value) : value)

    return (
      <div key={field} className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-700 rounded-xl border border-gray-200 dark:border-slate-600 font-mono text-sm text-gray-900 dark:text-white">
            {displayValue}
          </div>
          {isSensitive && !isRevealed && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleReveal(field)}
              title="Show secret — confirm to reveal plaintext on this device"
              className="whitespace-nowrap"
            >
              <Eye size={18} className="mr-1" />
              Reveal
            </Button>
          )}
          {isRevealed && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleCopy(field, value)}
              className="whitespace-nowrap"
            >
              {copiedField === field ? (
                <>
                  <Check size={18} className="mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={18} className="mr-1" />
                  Copy
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    )
  }

  const maskValue = (field: string, value: string): string => {
    if (field === 'cardNumber') return maskCardNumber(value)
    if (field === 'password' || field === 'cvv' || field === 'cardPin') return maskPassword()
    if (field === 'email') return maskEmail(value)
    return '••••••••'
  }

  const renderItemContent = () => {
    if (!decryptedData || !item) return null

    if ((item as any).item_type === 'credential') {
      const data = decryptedData as CredentialData
      return (
        <div className="space-y-4">
          {renderField('Email or Username', 'username', data.email || data.username)}
          {renderField('Password', 'password', data.password, true)}
          {data.website && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Website</label>
              <div className="px-4 py-3 bg-gray-50 dark:bg-slate-700 rounded-xl border border-gray-200 dark:border-slate-600">
                <a 
                  href={data.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium hover:underline transition-colors"
                >
                  {data.website}
                </a>
              </div>
            </div>
          )}
          {data.websites && data.websites.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Additional Websites</label>
              <div className="space-y-2">
                {data.websites.map((website, i) => (
                  <div key={i} className="px-4 py-3 bg-gray-50 dark:bg-slate-700 rounded-xl border border-gray-200 dark:border-slate-600">
                    <a 
                      href={website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium hover:underline transition-colors"
                    >
                      {website}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
          {data.notes && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Notes</label>
              <div className="px-4 py-3 bg-gray-50 dark:bg-slate-700 rounded-xl border border-gray-200 dark:border-slate-600 whitespace-pre-wrap text-gray-900 dark:text-white">
                {data.notes}
              </div>
            </div>
          )}
        </div>
      )
    } else if ((item as any).item_type === 'card') {
      const data = decryptedData as CardData
      return (
        <div className="space-y-4">
          {renderField('Cardholder Name', 'cardholderName', data.cardholderName)}
          {renderField('Card Number', 'cardNumber', data.cardNumber, true)}
          <div className="grid grid-cols-2 gap-4">
            {renderField('Expiration Date', 'expirationDate', data.expirationDate)}
            {renderField('CVV', 'cvv', data.cvv, true)}
          </div>
          {data.cardPin && renderField('Card PIN', 'cardPin', data.cardPin, true)}
          {data.zipCode && renderField('ZIP Code', 'zipCode', data.zipCode)}
          {data.notes && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Notes</label>
              <div className="px-4 py-3 bg-gray-50 dark:bg-slate-700 rounded-xl border border-gray-200 dark:border-slate-600 whitespace-pre-wrap text-gray-900 dark:text-white">
                {data.notes}
              </div>
            </div>
          )}
        </div>
      )
    } else if ((item as any).item_type === 'contact') {
      const data = decryptedData as ContactData
      return (
        <div className="space-y-4">
          {renderField('Full Name', 'fullName', data.fullName)}
          {renderField('Email', 'email', data.email)}
          {renderField('Phone', 'phone', data.phone)}
          {data.addressLine1 && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Address</label>
              <div className="px-4 py-3 bg-gray-50 dark:bg-slate-700 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white">
                {data.addressLine1}
                {data.addressLine2 && <><br />{data.addressLine2}</>}
                {data.city && <><br />{data.city}, {data.state} {data.zipCode}</>}
                {data.country && <><br />{data.country}</>}
              </div>
            </div>
          )}
        </div>
      )
    }

    return null
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  }

  if (!item || !decryptedData) {
    return <div className="text-center py-12 text-gray-600 dark:text-gray-400">Item not found</div>
  }

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{item.title}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {((item as any).item_type || item.itemType).charAt(0).toUpperCase() + ((item as any).item_type || item.itemType).slice(1)} • 
              Created {formatDate((item as any).created_at || item.createdAt)} • 
              Updated {formatDate((item as any).updated_at || item.updatedAt)}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => router.push(`/vault/items/${itemId}/edit`)}
            >
              <Edit size={18} className="mr-2" />
              Edit
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => router.push(`/vault/items/${itemId}/share`)}
            >
              <Share2 size={18} className="mr-2" />
              Share
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 size={18} className="mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 mb-6">
          <div className="space-y-6">
            {renderItemContent()}
          </div>
        </div>

        {/* Access Log */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Access Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700">
              <span className="text-gray-600 dark:text-gray-400">Last accessed</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {(item as any).last_accessed_at || item.lastAccessedAt ? formatDate((item as any).last_accessed_at || item.lastAccessedAt || '') : 'Never'}
              </span>
            </div>
            {((item as any).source_link_id || item.sourceLinkId) && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700">
                <span className="text-gray-600 dark:text-gray-400">Source</span>
                <span className="font-medium text-gray-900 dark:text-white">Collection link</span>
              </div>
            )}
            {((item as any).submitter_id || item.submitterId) && (
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 dark:text-gray-400">Submitted by</span>
                <span className="font-medium text-gray-900 dark:text-white">{(item as any).submitter_id || item.submitterId}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showRevealConfirm}
        onClose={() => {
          setShowRevealConfirm(false)
          setFieldToReveal(null)
        }}
        onConfirm={confirmReveal}
        title="Reveal Secret"
        message="Are you sure you want to reveal this secret? It will be displayed in plaintext on this device. This action will be logged."
        confirmText="Reveal"
        variant="primary"
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Move to Trash"
        message="This item will be moved to trash. You can restore it within 30 days."
        confirmText="Move to Trash"
        variant="danger"
      />
    </div>
  )
}

