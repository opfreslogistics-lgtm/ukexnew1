'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SharedItem, VaultItem } from '@/types/vault.types'
import { formatRelativeTime } from '@/lib/utils'
import Link from 'next/link'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function SharedPage() {
  const supabase = createClient()
  const [sharedItems, setSharedItems] = useState<Array<SharedItem & { item: VaultItem }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSharedItems()
  }, [])

  // Refresh when page becomes visible (user might have received new shares)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadSharedItems()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const loadSharedItems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }

      // Items shared with me - query with explicit column selection
      const { data: shared, error } = await supabase
        .from('shared_items')
        .select(`
          id,
          item_id,
          owner_id,
          shared_with_id,
          permission,
          created_at,
          revoked_at,
          vault_items (
            id,
            user_id,
            item_type,
            title,
            encrypted_data,
            folder_id,
            tags,
            is_trashed,
            trashed_at,
            source_link_id,
            submitter_id,
            created_at,
            updated_at,
            last_accessed_at
          )
        `)
        .eq('shared_with_id', user.id)
        .is('revoked_at', null)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading shared items:', error)
        setIsLoading(false)
        return
      }

      if (shared && shared.length > 0) {
        // Filter out null items and map to the expected structure
        const mappedItems = shared
          .filter((s: any) => s.vault_items !== null && !s.vault_items.is_trashed)
          .map((s: any) => ({
            id: s.id,
            itemId: s.item_id,
            ownerId: s.owner_id,
            sharedWithId: s.shared_with_id,
            permission: s.permission,
            createdAt: s.created_at,
            revokedAt: s.revoked_at,
            item: s.vault_items,
          }))
        
        setSharedItems(mappedItems as any)
      } else {
        setSharedItems([])
      }
    } catch (error) {
      console.error('Error loading shared items:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  }

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shared Items</h1>
          <Button
            variant="secondary"
            size="sm"
            onClick={loadSharedItems}
            disabled={isLoading}
            className="dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            <RefreshCw size={18} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        {sharedItems.length === 0 ? (
          <div className="card text-center py-12 dark:bg-slate-800 dark:border-slate-700">
            <p className="text-gray-600 dark:text-gray-400">No shared items yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sharedItems.map((shared) => (
              <Link
                key={shared.id}
                href={`/vault/items/${(shared as any).item_id || shared.itemId}`}
                className="block card hover:shadow-md transition-shadow dark:bg-slate-800 dark:border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {shared.item?.title || 'Untitled Item'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {((shared.item as any)?.item_type || shared.item?.itemType || 'unknown')} • Permission: {shared.permission}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{formatRelativeTime((shared as any).created_at || shared.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

