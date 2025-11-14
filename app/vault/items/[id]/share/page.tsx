'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Permission } from '@/types/vault.types'
import toast from 'react-hot-toast'
import { UserPlus, Share2, Shield, Eye, Edit, Mail } from 'lucide-react'

export default function ShareItemPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const itemId = params.id as string
  const [email, setEmail] = useState('')
  const [permission, setPermission] = useState<Permission>('view')
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      if (user.email === email) {
        toast.error('You cannot share with yourself')
        setIsLoading(false)
        return
      }

      // Find user by email using RPC function
      setIsSearching(true)
      const { data: targetUser, error: lookupError } = await supabase
        .rpc('find_user_by_email', { p_email: email.toLowerCase().trim() })

      setIsSearching(false)

      if (lookupError) {
        console.error('Lookup error:', lookupError)
        throw lookupError
      }

      // Handle the return type - it can be an array or a single object
      let targetUserId: string | null = null
      
      if (Array.isArray(targetUser)) {
        // If it's an array, get the first element
        if (targetUser.length > 0 && targetUser[0]) {
          targetUserId = (targetUser[0] as any)?.id || null
        }
      } else if (targetUser && typeof targetUser === 'object') {
        // If it's a single object (JSON)
        targetUserId = (targetUser as any)?.id || null
      }

      if (!targetUserId) {
        toast.error('User not found. Please make sure the email is correct and the user has registered.')
        setIsLoading(false)
        return
      }

      // Check if already shared
      const { data: existingShare } = await supabase
        .from('shared_items')
        .select('id')
        .eq('item_id', itemId)
        .eq('shared_with_id', targetUserId)
        .is('revoked_at', null)
        .single()

      if (existingShare) {
        toast.error('Item is already shared with this user')
        setIsLoading(false)
        return
      }

      // Create share
      const { error } = await supabase
        .from('shared_items')
        .insert({
          item_id: itemId,
          owner_id: user.id,
          shared_with_id: targetUserId,
          permission,
        })

      if (error) throw error

      // Log share action
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        item_id: itemId,
        action: 'share',
        metadata: { shared_with: email, permission },
      })

      toast.success('Item shared successfully!')
      router.push(`/vault/items/${itemId}`)
    } catch (error: any) {
      console.error('Error sharing item:', error)
      toast.error(error.message || 'Failed to share item')
    } finally {
      setIsLoading(false)
      setIsSearching(false)
    }
  }

  const permissionOptions = [
    {
      value: 'view' as Permission,
      icon: Eye,
      title: 'View',
      description: 'Can see item but not reveal secrets',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      value: 'reveal' as Permission,
      icon: Shield,
      title: 'Reveal',
      description: 'Can view and reveal secrets',
      color: 'from-purple-500 to-pink-500'
    },
    {
      value: 'edit' as Permission,
      icon: Edit,
      title: 'Edit',
      description: 'Can view, reveal, and edit item',
      color: 'from-emerald-500 to-teal-500'
    },
  ]

  return (
    <div>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-xl">
              <Share2 className="text-white" size={24} />
            </div>
            Share Item
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Share this item securely with another user</p>
        </div>
        
        <div className="bg-white dark:bg-indigo-900/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-indigo-800/50 p-8">
          <form onSubmit={handleShare} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Mail size={18} className="text-pink-500" />
                Share with (email)
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="user@example.com"
                className="text-lg"
                disabled={isLoading || isSearching}
              />
              {isSearching && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                  Searching for user...
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">
                Permission Level
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {permissionOptions.map((option) => {
                  const Icon = option.icon
                  const isSelected = permission === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPermission(option.value)}
                      className={`
                        relative p-5 rounded-2xl border-2 transition-all duration-300 transform
                        ${isSelected
                          ? `bg-gradient-to-br ${option.color} text-white border-transparent shadow-2xl scale-105`
                          : 'bg-white dark:bg-indigo-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-indigo-800 hover:border-pink-300 dark:hover:border-purple-500 hover:shadow-xl hover:scale-105'
                        }
                      `}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full"></div>
                        </div>
                      )}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                        isSelected ? 'bg-white/20' : 'bg-gradient-to-br ' + option.color + ' opacity-20'
                      }`}>
                        <Icon size={24} className={isSelected ? 'text-white' : ''} />
                      </div>
                      <h3 className="font-bold text-lg mb-1">{option.title}</h3>
                      <p className={`text-xs ${isSelected ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}`}>
                        {option.description}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="p-5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Shield className="text-blue-600 dark:text-blue-400 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                    Secure Sharing
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    The recipient will be able to access this item based on the permission level you set. 
                    You can revoke access at any time from the item page.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                className="flex-1"
                disabled={isLoading || isSearching}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || isSearching} 
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sharing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus size={18} />
                    Share Item
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
