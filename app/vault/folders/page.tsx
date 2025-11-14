'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Folder } from '@/types/vault.types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Plus, Folder as FolderIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function FoldersPage() {
  const supabase = createClient()
  const [folders, setFolders] = useState<Folder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  useEffect(() => {
    loadFolders()
  }, [])

  const loadFolders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      if (data) {
        setFolders(data as any)
      }
    } catch (error) {
      console.error('Error loading folders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Folder name is required')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('folders')
        .insert({
          user_id: user.id,
          name: newFolderName.trim(),
          parent_id: null,
        })

      if (error) throw error

      toast.success('Folder created')
      setNewFolderName('')
      setShowCreateModal(false)
      loadFolders()
    } catch (error: any) {
      console.error('Error creating folder:', error)
      toast.error(error.message || 'Failed to create folder')
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-4 border-purple-600 dark:border-purple-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  }

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Folders</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Organize your files and items</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
            <Plus size={18} className="mr-2" />
            New Folder
          </Button>
        </div>

        {folders.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 text-center py-12">
            <FolderIcon className="text-gray-400 dark:text-gray-500 mx-auto mb-4" size={48} />
            <p className="text-gray-600 dark:text-gray-400 mb-4">No folders yet.</p>
            <Button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
              Create Your First Folder
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders.map((folder) => (
              <Link
                key={folder.id}
                href={`/vault/folders/${folder.id}`}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FolderIcon className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{folder.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Created {new Date((folder as any).created_at || folder.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false)
            setNewFolderName('')
          }}
          title="Create Folder"
        >
          <div className="space-y-4">
            <Input
              label="Folder Name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              required
              placeholder="My Folder"
              autoFocus
              className="dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowCreateModal(false)
                  setNewFolderName('')
                }}
                className="flex-1 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                Cancel
              </Button>
              <Button onClick={handleCreateFolder} className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                Create
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

