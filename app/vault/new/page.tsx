'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { encryptObject } from '@/lib/encryption'
import { CredentialForm } from '@/components/vault/ItemForms/CredentialForm'
import { CardForm } from '@/components/vault/ItemForms/CardForm'
import { ContactForm } from '@/components/vault/ItemForms/ContactForm'
import { NoteForm } from '@/components/vault/ItemForms/NoteForm'
import { CredentialData, CardData, ContactData, NoteData, ItemType } from '@/types/vault.types'
import toast from 'react-hot-toast'
import { Key, CreditCard, User, FileText } from 'lucide-react'

function NewItemPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  const [itemType, setItemType] = useState<ItemType | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

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

    const type = searchParams.get('type') as ItemType
    if (type && ['credential', 'card', 'note', 'contact', 'document', 'passkey'].includes(type)) {
      setItemType(type)
    }
  }, [searchParams, router, supabase])

  const handleSubmit = async (data: CredentialData | CardData | ContactData | NoteData) => {
    if (!userId || !itemType) return

    // Optimistic update - show success immediately
    toast.loading('Saving...', { id: 'save-item' })

    try {
      const encryptedData = encryptObject(data)
      const title = 'title' in data ? data.title : 
                   'fullName' in data ? data.fullName :
                   'content' in data ? (data.content.substring(0, 50) || 'Untitled Note') :
                   'username' in data ? data.username || data.email || 'Untitled' :
                   'Untitled'

      // Parallel operations for speed
      const [insertResult, auditResult] = await Promise.allSettled([
        supabase
          .from('vault_items')
          .insert({
            user_id: userId,
            item_type: itemType,
            title,
            encrypted_data: encryptedData,
            folder_id: null,
            tags: [],
            is_trashed: false,
          })
          .select()
          .single(),
        supabase.from('audit_logs').insert({
          user_id: userId,
          item_id: null,
          action: 'create',
          metadata: { item_type: itemType },
        })
      ])

      if (insertResult.status === 'rejected') {
        throw new Error('Failed to create item')
      }
      if (insertResult.value.error) {
        throw insertResult.value.error
      }

      toast.success('Item saved successfully!', { id: 'save-item' })
      
      // Navigate immediately for fast UX
      router.push('/vault')
      router.refresh()
    } catch (error: any) {
      console.error('Error creating item:', error)
      toast.error(error.message || 'Failed to save item', { id: 'save-item' })
    }
  }

  if (!userId) {
    return <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  }

  if (!itemType) {
    return (
      <div>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create New Item</h1>
            <p className="text-gray-600 dark:text-gray-400">Choose the type of information you want to store</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => setItemType('credential')}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 text-left group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Key className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Login</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Store usernames and passwords securely</p>
            </button>
            <button
              onClick={() => setItemType('card')}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 text-left group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CreditCard className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Credit Card</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Store payment card information</p>
            </button>
            <button
              onClick={() => setItemType('contact')}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 text-left group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <User className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Contact</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Store contact information</p>
            </button>
            <button
              onClick={() => setItemType('note')}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 text-left group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Secure Note</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Store sensitive notes and information</p>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setItemType(null)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 flex items-center gap-2 transition-colors"
          >
            ← Back to item types
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            New {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
          </h1>
        </div>
        {itemType === 'credential' && (
          <CredentialForm
            onSubmit={handleSubmit}
            onCancel={() => router.push('/vault')}
          />
        )}
        {itemType === 'card' && (
          <CardForm
            onSubmit={handleSubmit}
            onCancel={() => router.push('/vault')}
          />
        )}
        {itemType === 'contact' && (
          <ContactForm
            onSubmit={handleSubmit}
            onCancel={() => router.push('/vault')}
          />
        )}
        {itemType === 'note' && (
          <NoteForm
            onSubmit={handleSubmit}
            onCancel={() => router.push('/vault')}
          />
        )}
      </div>
    </div>
  )
}

export default function NewItemPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <NewItemPageContent />
    </Suspense>
  )
}

