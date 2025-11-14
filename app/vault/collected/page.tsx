'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { VaultItem } from '@/types/vault.types'
import { formatRelativeTime } from '@/lib/utils'
import Link from 'next/link'
import { RefreshCw, Inbox, Key, CreditCard, User, FileText, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function CollectedPage() {
  const supabase = createClient()
  const [collectedItems, setCollectedItems] = useState<VaultItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCollectedItems()
  }, [])

  // Refresh when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadCollectedItems()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const loadCollectedItems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }

      // Items collected via collection links (have source_link_id)
      const { data: items, error } = await supabase
        .from('vault_items')
        .select('*')
        .eq('user_id', user.id)
        .not('source_link_id', 'is', null)
        .eq('is_trashed', false)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading collected items:', error)
        setIsLoading(false)
        return
      }

      setCollectedItems((items || []) as any)
    } catch (error) {
      console.error('Error loading collected items:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case 'credential':
        return <Key className="text-blue-500" size={20} />
      case 'card':
        return <CreditCard className="text-purple-500" size={20} />
      case 'contact':
        return <User className="text-green-500" size={20} />
      case 'note':
        return <FileText className="text-yellow-500" size={20} />
      default:
        return <Inbox className="text-gray-500" size={20} />
    }
  }

  const getItemTypeLabel = (itemType: string) => {
    switch (itemType) {
      case 'credential':
        return 'Login Credentials'
      case 'card':
        return 'Credit Card'
      case 'contact':
        return 'Contact'
      case 'note':
        return 'Note'
      default:
        return itemType
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Inbox className="text-purple-500" size={32} />
              Collected Items
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Items submitted via your collection links
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={loadCollectedItems}
            disabled={isLoading}
            className="dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            <RefreshCw size={18} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {collectedItems.length === 0 ? (
          <div className="card text-center py-12 dark:bg-slate-800 dark:border-slate-700">
            <Inbox className="text-gray-400 dark:text-gray-500 mx-auto mb-4" size={48} />
            <p className="text-gray-600 dark:text-gray-400 mb-2 font-medium">No collected items yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              Items submitted via your collection links will appear here
            </p>
            <Link href="/vault/ask">
              <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                Create Collection Link
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {collectedItems.map((item) => (
              <Link
                key={item.id}
                href={`/vault/items/${item.id}`}
                className="block card hover:shadow-md transition-shadow dark:bg-slate-800 dark:border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0">
                      {getItemIcon((item as any).item_type || item.itemType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {item.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {getItemTypeLabel((item as any).item_type || item.itemType)} • 
                        Collected {formatRelativeTime((item as any).created_at || item.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                      Collected
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

