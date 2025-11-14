'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { VaultItem } from '@/types/vault.types'
import { formatRelativeTime } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Trash2, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TrashPage() {
  const supabase = createClient()
  const [trashedItems, setTrashedItems] = useState<VaultItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [restoreItemId, setRestoreItemId] = useState<string | null>(null)
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)

  useEffect(() => {
    loadTrashedItems()
  }, [])

  const loadTrashedItems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('vault_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_trashed', true)
        .order('trashed_at', { ascending: false })

      if (data) {
        setTrashedItems(data as any)
      }
    } catch (error) {
      console.error('Error loading trashed items:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestore = async () => {
    if (!restoreItemId) return

    try {
      await supabase
        .from('vault_items')
        .update({
          is_trashed: false,
          trashed_at: null,
        })
        .eq('id', restoreItemId)

      toast.success('Item restored')
      setRestoreItemId(null)
      loadTrashedItems()
    } catch (error: any) {
      console.error('Error restoring item:', error)
      toast.error('Failed to restore item')
    }
  }

  const handlePermanentDelete = async () => {
    if (!deleteItemId) return

    try {
      await supabase
        .from('vault_items')
        .delete()
        .eq('id', deleteItemId)

      toast.success('Item permanently deleted')
      setDeleteItemId(null)
      loadTrashedItems()
    } catch (error: any) {
      console.error('Error deleting item:', error)
      toast.error('Failed to delete item')
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
        <h1 className="text-3xl font-bold mb-6">Trash</h1>
        <p className="text-gray-600 mb-6">
          Items in trash are automatically deleted after 30 days. You can restore them before then.
        </p>
        {trashedItems.length === 0 ? (
          <div className="card text-center py-12">
            <Trash2 className="text-gray-400 mx-auto mb-4" size={48} />
            <p className="text-gray-600">Trash is empty.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trashedItems.map((item) => (
              <div key={item.id} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-500">
                      {(item as any).item_type || (item as any).itemType} • Deleted {formatRelativeTime((item as any).trashed_at || (item as any).trashedAt || (item as any).updated_at || (item as any).updatedAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRestoreItemId(item.id)}
                    >
                      <RotateCcw size={18} className="mr-2" />
                      Restore
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteItemId(item.id)}
                    >
                      <Trash2 size={18} className="mr-2" />
                      Delete Permanently
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <ConfirmDialog
          isOpen={!!restoreItemId}
          onClose={() => setRestoreItemId(null)}
          onConfirm={handleRestore}
          title="Restore Item"
          message="This item will be restored to your vault."
          confirmText="Restore"
        />

        <ConfirmDialog
          isOpen={!!deleteItemId}
          onClose={() => setDeleteItemId(null)}
          onConfirm={handlePermanentDelete}
          title="Permanently Delete"
          message="This action cannot be undone. The item will be permanently deleted."
          confirmText="Delete Permanently"
          variant="danger"
        />
      </div>
    </div>
  )
}

