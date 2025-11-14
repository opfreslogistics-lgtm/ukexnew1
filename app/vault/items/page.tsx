'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { VaultItem, CardData, CredentialData } from '@/types/vault.types'
import { decryptObject } from '@/lib/encryption'
import { CardFlip } from '@/components/vault/CardFlip'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Search, Filter, Grid, List, CreditCard, Key, User, FileText, Eye, EyeOff, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

export default function ItemsPage() {
  const supabase = createClient()
  const [items, setItems] = useState<VaultItem[]>([])
  const [filteredItems, setFilteredItems] = useState<VaultItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set())
  const [userId, setUserId] = useState<string | null>(null)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadItems()
  }, [])

  useEffect(() => {
    filterItems()
  }, [items, searchQuery, filterType])

  const loadItems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data, error } = await supabase
        .from('vault_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_trashed', false)
        .order('updated_at', { ascending: false })

      if (error) throw error
      if (data) {
        const typedData = data.map(item => ({
          ...item,
          item_type: item.item_type,
          updated_at: item.updated_at,
        })) as any
        setItems(typedData)
        setFilteredItems(typedData)
      }
    } catch (error: any) {
      console.error('Error loading items:', error)
      toast.error('Failed to load items')
    } finally {
      setIsLoading(false)
    }
  }

  const filterItems = () => {
    let filtered = [...items]

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(item => {
        const itemType = (item as any).item_type || item.itemType
        return itemType === filterType
      })
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item => {
        const itemType = (item as any).item_type || item.itemType
        return item.title.toLowerCase().includes(query) ||
               itemType.toLowerCase().includes(query)
      })
    }

    setFilteredItems(filtered)
  }

  const handleRevealCard = async (itemId: string) => {
    setRevealedCards(new Set([...revealedCards, itemId]))
    if (userId) {
      try {
        await supabase.from('audit_logs').insert({
          user_id: userId,
          item_id: itemId,
          action: 'reveal',
          metadata: { field: 'cvv' },
        })
      } catch (error) {
        console.error('Error logging reveal:', error)
      }
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('vault_items')
        .update({ is_trashed: true, trashed_at: new Date().toISOString() })
        .eq('id', itemId)

      if (error) throw error

      toast.success('Card moved to trash')
      setItemToDelete(null)
      loadItems()
    } catch (error: any) {
      console.error('Error deleting item:', error)
      toast.error(error.message || 'Failed to delete card')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-pink-500 dark:border-pink-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const cards = filteredItems.filter(item => {
    const itemType = (item as any).item_type || item.itemType
    return itemType === 'card'
  })
  const otherItems = filteredItems.filter(item => {
    const itemType = (item as any).item_type || item.itemType
    return itemType !== 'card'
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">All Items</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage all your stored items</p>
        </div>
        <Link href="/vault/new">
          <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
            <Plus size={18} className="mr-2" />
            New Item
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border-2 border-gray-300 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 bg-gray-50 dark:bg-slate-700 border-2 border-gray-300 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="credential">Logins</option>
              <option value="card">Cards</option>
              <option value="contact">Contacts</option>
              <option value="note">Notes</option>
              <option value="document">Documents</option>
            </select>
            <div className="flex gap-2 bg-gray-100 dark:bg-slate-700 rounded-2xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-600 text-pink-600 dark:text-pink-400 shadow-md'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-all ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-600 text-pink-600 dark:text-pink-400 shadow-md'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Section */}
      {cards.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="text-pink-500" size={24} />
            Credit Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((item) => {
              try {
                const encryptedData = (item as any).encrypted_data || (item as any).encryptedData
                const data = decryptObject(encryptedData) as CardData
                const isRevealed = revealedCards.has(item.id)
                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-700 p-6"
                  >
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title || 'Untitled Card'}</h3>
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/vault/items/${item.id}`}
                          className="text-sm text-pink-600 dark:text-pink-400 hover:underline"
                        >
                          View Details →
                        </Link>
                        <button
                          onClick={() => setItemToDelete(item.id)}
                          className="text-sm text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                    <CardFlip
                      cardNumber={isRevealed ? (data.cardNumber || '') : ''}
                      cardholderName={data.cardholderName || ''}
                      expirationDate={data.expirationDate || ''}
                      cvv={isRevealed ? data.cvv : ''}
                      onReveal={() => {
                        if (!isRevealed) {
                          handleRevealCard(item.id)
                        }
                      }}
                    />
                  </div>
                )
              } catch (error) {
                console.error('Error decrypting card:', error)
                return null
              }
            })}
          </div>
        </div>
      )}

      {/* Other Items */}
      {otherItems.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Key className="text-pink-500" size={24} />
            Other Items
          </h2>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/vault/items/${item.id}`}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${
                        (() => {
                          const itemType = (item as any).item_type || item.itemType
                          return itemType === 'credential' ? 'from-blue-500 to-purple-500' :
                                 itemType === 'contact' ? 'from-green-500 to-teal-500' :
                                 itemType === 'note' ? 'from-blue-500 to-cyan-500' :
                                 'from-gray-500 to-gray-600'
                        })()
                      }`}>
                        {(() => {
                          const itemType = (item as any).item_type || item.itemType
                          return itemType === 'credential' ? <Key className="text-white" size={24} /> :
                                 itemType === 'contact' ? <User className="text-white" size={24} /> :
                                 <FileText className="text-white" size={24} />
                        })()}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">
                          {(item as any).item_type || item.itemType}
                        </p>
                      </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {otherItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/vault/items/${item.id}`}
                  className="block bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-6 hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${
                        (() => {
                          const itemType = (item as any).item_type || item.itemType
                          return itemType === 'credential' ? 'from-blue-500 to-purple-500' :
                                 itemType === 'contact' ? 'from-green-500 to-teal-500' :
                                 itemType === 'note' ? 'from-blue-500 to-cyan-500' :
                                 'from-gray-500 to-gray-600'
                        })()
                      }`}>
                        {(() => {
                          const itemType = (item as any).item_type || item.itemType
                          return itemType === 'credential' ? <Key className="text-white" size={24} /> :
                                 itemType === 'contact' ? <User className="text-white" size={24} /> :
                                 <FileText className="text-white" size={24} />
                        })()}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                          {(item as any).item_type || item.itemType}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Updated {new Date((item as any).updated_at || item.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {filteredItems.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-700">
          <Key className="text-gray-400 dark:text-gray-500 mx-auto mb-4" size={64} />
          <p className="text-xl font-bold text-gray-600 dark:text-gray-400 mb-2">No items found</p>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchQuery ? 'Try adjusting your search or filters' : 'Create your first item to get started'}
          </p>
          <Link href="/vault/new">
            <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">Create New Item</Button>
          </Link>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => itemToDelete && handleDeleteItem(itemToDelete)}
        title="Delete Card"
        message="Are you sure you want to delete this card? It will be moved to trash and can be recovered later."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}

