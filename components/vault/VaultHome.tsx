'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Plus, Key, Shield, Folder, Clock, AlertTriangle, Sparkles, TrendingUp, Users, Inbox } from 'lucide-react'
import { VaultItem, CredentialData } from '@/types/vault.types'
import { formatRelativeTime } from '@/lib/utils'
import { decryptObject } from '@/lib/encryption'
import { getPasswordStrength } from '@/lib/password'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface VaultHomeProps {
  userId: string
}

export function VaultHome({ userId }: VaultHomeProps) {
  const supabase = createClient()
  const [recentItems, setRecentItems] = useState<VaultItem[]>([])
  const [passwordHealth, setPasswordHealth] = useState({
    weak: 0,
    reused: 0,
    exposed: 0,
    total: 0,
  })
  const [sharedCount, setSharedCount] = useState(0)
  const [folderCount, setFolderCount] = useState(0)
  const [collectedCount, setCollectedCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
    
    // Refresh data periodically to keep password health up to date
    const interval = setInterval(() => {
      loadData()
    }, 30000) // Refresh every 30 seconds
    
    return () => clearInterval(interval)
  }, [userId])

  const calculatePasswordHealth = async (items: VaultItem[]) => {
    if (!items || items.length === 0) {
      return {
        weak: 0,
        reused: 0,
        exposed: 0,
        total: 0,
      }
    }

    // Track passwords and their usage
    const passwordMap = new Map<string, Array<{ itemId: string; title: string; website?: string }>>()
    const weakSet = new Set<string>() // Track item IDs with weak passwords
    const reusedSet = new Set<string>() // Track item IDs with reused passwords
    const exposedSet = new Set<string>() // Track item IDs with exposed passwords

    // Analyze each credential
    for (const item of items) {
      try {
        // Database returns snake_case, but we need to handle both formats
        const encryptedData = (item as any).encrypted_data || (item as any).encryptedData
        const decrypted = decryptObject<CredentialData>(encryptedData)
        const password = decrypted.password

        if (!password) continue

        // Check for weak passwords
        const strength = getPasswordStrength(password)
        if (strength.label === 'weak' || strength.score <= 2) {
          weakSet.add(item.id)
        }

        // Track password reuse
        if (!passwordMap.has(password)) {
          passwordMap.set(password, [])
        }
        const passwordEntries = passwordMap.get(password)!
        passwordEntries.push({
          itemId: item.id,
          title: item.title,
          website: decrypted.website,
        })
      } catch (error) {
        console.error('Error decrypting item for health check:', item.id, error)
      }
    }

    // Analyze password reuse
    for (const [password, entries] of passwordMap.entries()) {
      if (entries.length > 1) {
        // Reused password (used more than once)
        entries.forEach((entry) => {
          reusedSet.add(entry.itemId)
        })
      }

      if (entries.length > 10) {
        // Exposed password (used on more than 10 websites)
        entries.forEach((entry) => {
          exposedSet.add(entry.itemId)
        })
      }
    }

    // Remove exposed items that are already counted as reused (to avoid double counting)
    // But we want to show both, so we'll count them separately
    // Actually, exposed is a subset of reused, so we should show exposed separately
    const exposedUnique = Array.from(exposedSet).filter(id => !reusedSet.has(id) || true) // Show all exposed

    return {
      weak: weakSet.size,
      reused: reusedSet.size,
      exposed: exposedSet.size,
      total: items.length,
    }
  }

  const loadData = async () => {
    try {
      // Parallel loading for speed
      const [itemsResult, allItemsResult, sharedResult, foldersResult, collectedResult] = await Promise.allSettled([
        supabase
          .from('vault_items')
          .select('*')
          .eq('user_id', userId)
          .eq('is_trashed', false)
          .order('updated_at', { ascending: false })
          .limit(5),
        supabase
          .from('vault_items')
          .select('*')
          .eq('user_id', userId)
          .eq('item_type', 'credential')
          .eq('is_trashed', false),
        supabase
          .from('shared_items')
          .select('*', { count: 'exact', head: true })
          .eq('shared_with_id', userId)
          .is('revoked_at', null),
        supabase
          .from('folders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId),
        supabase
          .from('vault_items')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .not('source_link_id', 'is', null)
          .eq('is_trashed', false),
      ])

      if (itemsResult.status === 'fulfilled' && itemsResult.value.data) {
        setRecentItems(itemsResult.value.data as any)
      }

      if (allItemsResult.status === 'fulfilled' && allItemsResult.value.data) {
        // Calculate password health
        const health = await calculatePasswordHealth(allItemsResult.value.data as any[])
        setPasswordHealth(health)
      }

      if (sharedResult.status === 'fulfilled') {
        setSharedCount(sharedResult.value.count || 0)
      }

      if (foldersResult.status === 'fulfilled') {
        setFolderCount(foldersResult.value.count || 0)
      }

      if (collectedResult.status === 'fulfilled') {
        setCollectedCount(collectedResult.value.count || 0)
      }
    } catch (error) {
      console.error('Error loading vault data:', error)
      toast.error('Failed to load vault data')
    } finally {
      setIsLoading(false)
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Vault</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's your security overview</p>
        </div>
        <div className="flex gap-3">
          <Link href="/vault/ask">
            <Button variant="secondary" className="hidden md:flex items-center gap-2">
              <Sparkles size={18} />
              Ask for Info
            </Button>
          </Link>
          <Link href="/vault/new">
            <Button className="flex items-center gap-2">
              <Plus size={18} />
              <span className="hidden sm:inline">New Item</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCard
          title="Recent Items"
          icon={<Clock className="text-blue-600" size={24} />}
          count={recentItems.length}
          href="/vault/items"
          gradient="from-blue-500 to-cyan-500"
        />
        <OverviewCard
          title="Password Health"
          icon={<TrendingUp className="text-green-600" size={24} />}
          count={passwordHealth.weak + passwordHealth.reused + passwordHealth.exposed}
          subtitle={`${passwordHealth.weak} weak • ${passwordHealth.reused} reused • ${passwordHealth.exposed} exposed`}
          href="/vault/health"
          gradient="from-green-500 to-emerald-500"
        />
        <OverviewCard
          title="Shared Items"
          icon={<Users className="text-purple-600" size={24} />}
          count={sharedCount}
          href="/vault/shared"
          gradient="from-purple-500 to-pink-500"
        />
        <OverviewCard
          title="Folders"
          icon={<Folder className="text-orange-600" size={24} />}
          count={folderCount}
          href="/vault/folders"
          gradient="from-orange-500 to-red-500"
        />
        <OverviewCard
          title="Collected Items"
          icon={<Inbox className="text-indigo-600" size={24} />}
          count={collectedCount}
          href="/vault/collected"
          gradient="from-indigo-500 to-purple-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Items */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Items</h2>
            <Link href="/vault/items" className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">
              View all →
            </Link>
          </div>
          {recentItems.length === 0 ? (
            <div className="text-center py-12">
              <Key className="text-gray-400 dark:text-gray-500 mx-auto mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400 mb-4">No items yet</p>
              <Link href="/vault/new">
                <Button size="sm">Create your first item</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/vault/items/${item.id}`}
                  className="block p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-slate-600 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {item.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">
                        {(item as any).item_type || (item as any).itemType}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {formatRelativeTime((item as any).updated_at || (item as any).updatedAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/vault/new?type=credential">
              <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 border border-transparent hover:border-blue-200 cursor-pointer group">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Key className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">Add Login</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Store usernames and passwords</p>
                </div>
              </div>
            </Link>
            <Link href="/vault/new?type=card">
              <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-200 border border-transparent hover:border-purple-200 dark:hover:border-purple-800 cursor-pointer group">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">Add Credit Card</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Store payment card information</p>
                </div>
              </div>
            </Link>
            <Link href="/vault/new?type=contact">
              <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50 dark:hover:from-green-900/20 dark:hover:to-teal-900/20 transition-all duration-200 border border-transparent hover:border-green-200 dark:hover:border-green-800 cursor-pointer group">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">Add Contact</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Store contact information</p>
                </div>
              </div>
            </Link>
            <Link href="/vault/generator">
              <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 dark:hover:from-orange-900/20 dark:hover:to-red-900/20 transition-all duration-200 border border-transparent hover:border-orange-200 dark:hover:border-orange-800 cursor-pointer group">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">Generate Password</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Create a strong, secure password</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function OverviewCard({
  title,
  icon,
  count,
  subtitle,
  href,
  gradient,
}: {
  title: string
  icon: React.ReactNode
  count: number
  subtitle?: string
  href?: string
  gradient?: string
}) {
  const content = (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-200 hover:scale-[1.02] cursor-pointer group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{count}</p>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>}
        </div>
        <div className={`w-14 h-14 bg-gradient-to-br ${gradient || 'from-gray-500 to-gray-600'} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md`}>
          {icon}
        </div>
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }
  return content
}
