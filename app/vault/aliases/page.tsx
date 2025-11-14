'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Plus, Mail, RotateCcw, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface EmailAlias {
  id: string
  alias: string
  linked_item_id: string | null
  is_active: boolean
  created_at: string
  last_used_at: string | null
}

export default function AliasesPage() {
  const supabase = createClient()
  const [aliases, setAliases] = useState<EmailAlias[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newAlias, setNewAlias] = useState('')

  useEffect(() => {
    loadAliases()
  }, [])

  const loadAliases = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('email_aliases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) {
        setAliases(data as any)
      }
    } catch (error) {
      console.error('Error loading aliases:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateAlias = () => {
    const random = Math.random().toString(36).substring(2, 10)
    return `alias-${random}@ukex-vault.com`
  }

  const handleCreateAlias = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const aliasValue = newAlias.trim() || generateAlias()

      const { error } = await supabase
        .from('email_aliases')
        .insert({
          user_id: user.id,
          alias: aliasValue,
          is_active: true,
        })

      if (error) throw error

      toast.success('Email alias created')
      setNewAlias('')
      setShowCreateModal(false)
      loadAliases()
    } catch (error: any) {
      console.error('Error creating alias:', error)
      toast.error(error.message || 'Failed to create alias')
    }
  }

  const handleRotateAlias = async (id: string) => {
    try {
      const newAlias = generateAlias()
      const { error } = await supabase
        .from('email_aliases')
        .update({ alias: newAlias })
        .eq('id', id)

      if (error) throw error

      toast.success('Alias rotated')
      loadAliases()
    } catch (error: any) {
      console.error('Error rotating alias:', error)
      toast.error('Failed to rotate alias')
    }
  }

  const handleDeactivateAlias = async (id: string) => {
    try {
      const { error } = await supabase
        .from('email_aliases')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error

      toast.success('Alias deactivated')
      loadAliases()
    } catch (error: any) {
      console.error('Error deactivating alias:', error)
      toast.error('Failed to deactivate alias')
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
          <h1 className="text-3xl font-bold">Email Aliases</h1>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus size={18} className="mr-2" />
            Create Alias
          </Button>
        </div>

        <div className="card mb-6">
          <p className="text-sm text-gray-600">
            Email aliases help protect your real email address. Use them when signing up for services, 
            and you can rotate or retire them at any time.
          </p>
        </div>

        {aliases.length === 0 ? (
          <div className="card text-center py-12">
            <Mail className="text-gray-400 mx-auto mb-4" size={48} />
            <p className="text-gray-600 mb-4">No email aliases yet.</p>
            <Button onClick={() => setShowCreateModal(true)}>
              Create Your First Alias
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {aliases.map((alias) => (
              <div key={alias.id} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-medium">{alias.alias}</p>
                      {alias.is_active ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">Inactive</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Created {new Date(alias.created_at).toLocaleDateString()}
                      {alias.last_used_at && ` • Last used ${new Date(alias.last_used_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRotateAlias(alias.id)}
                    >
                      <RotateCcw size={18} className="mr-2" />
                      Rotate
                    </Button>
                    {alias.is_active && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeactivateAlias(alias.id)}
                      >
                        <Trash2 size={18} className="mr-2" />
                        Retire
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false)
            setNewAlias('')
          }}
          title="Create Email Alias"
        >
          <div className="space-y-4">
            <Input
              label="Alias (leave empty to auto-generate)"
              value={newAlias}
              onChange={(e) => setNewAlias(e.target.value)}
              placeholder="alias-name@ukex-vault.com"
            />
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowCreateModal(false)
                  setNewAlias('')
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleCreateAlias} className="flex-1">
                Create
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

