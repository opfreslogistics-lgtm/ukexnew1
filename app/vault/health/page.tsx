'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AlertTriangle, RefreshCw, Shield, Key } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { decryptObject } from '@/lib/encryption'
import { getPasswordStrength } from '@/lib/password'
import { CredentialData } from '@/types/vault.types'
import Link from 'next/link'

interface PasswordIssue {
  itemId: string
  title: string
  password: string
  reason: 'weak' | 'reused' | 'exposed'
  websites?: string[]
}

export default function PasswordHealthPage() {
  const supabase = createClient()
  const [health, setHealth] = useState({
    weak: 0,
    reused: 0,
    exposed: 0,
    old: 0,
    total: 0,
  })
  const [weakPasswords, setWeakPasswords] = useState<PasswordIssue[]>([])
  const [reusedPasswords, setReusedPasswords] = useState<PasswordIssue[]>([])
  const [exposedPasswords, setExposedPasswords] = useState<PasswordIssue[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadHealth()
  }, [])

  const loadHealth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: items } = await supabase
        .from('vault_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('item_type', 'credential')
        .eq('is_trashed', false)

      if (!items || items.length === 0) {
        setHealth({
          weak: 0,
          reused: 0,
          exposed: 0,
          old: 0,
          total: 0,
        })
        setIsLoading(false)
        return
      }

      // Decrypt all passwords and analyze them
      const passwordMap = new Map<string, Array<{ itemId: string; title: string; website?: string }>>()
      const weakList: PasswordIssue[] = []
      const reusedList: PasswordIssue[] = []
      const exposedList: PasswordIssue[] = []

      for (const item of items) {
        try {
          const decrypted = decryptObject<CredentialData>(item.encrypted_data)
          const password = decrypted.password

          if (!password) continue

          // Check for weak passwords
          const strength = getPasswordStrength(password)
          if (strength.label === 'weak' || strength.score <= 2) {
            weakList.push({
              itemId: item.id,
              title: item.title,
              password: password,
              reason: 'weak',
            })
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
          console.error('Error decrypting item:', item.id, error)
        }
      }

      // Analyze password reuse
      for (const [password, entries] of passwordMap.entries()) {
        if (entries.length > 1) {
          // Reused password (used more than once)
          entries.forEach((entry) => {
            reusedList.push({
              itemId: entry.itemId,
              title: entry.title,
              password: password,
              reason: 'reused',
              websites: entries.map(e => e.website || e.title).filter(Boolean) as string[],
            })
          })
        }

        if (entries.length > 10) {
          // Exposed password (used on more than 10 websites)
          entries.forEach((entry) => {
            exposedList.push({
              itemId: entry.itemId,
              title: entry.title,
              password: password,
              reason: 'exposed',
              websites: entries.map(e => e.website || e.title).filter(Boolean) as string[],
            })
          })
        }
      }

      // Remove duplicates from exposed list (if already in reused)
      const exposedUnique = exposedList.filter(
        (exposed) => !reusedList.some((reused) => reused.itemId === exposed.itemId)
      )

      setWeakPasswords(weakList)
      setReusedPasswords(reusedList)
      setExposedPasswords(exposedUnique)

      setHealth({
        weak: weakList.length,
        reused: reusedList.length,
        exposed: exposedUnique.length,
        old: 0, // TODO: Implement old password detection
        total: items.length,
      })
    } catch (error) {
      console.error('Error loading health:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  }

  const totalIssues = health.weak + health.reused + health.exposed

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Password Health</h1>
          <Button variant="secondary" onClick={loadHealth} className="dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
            <RefreshCw size={18} className="mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Weak Passwords</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{health.weak}</p>
              </div>
              <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
            </div>
          </div>
          <div className="card dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Reused Passwords</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{health.reused}</p>
              </div>
              <RefreshCw className="text-yellow-600 dark:text-yellow-400" size={24} />
            </div>
          </div>
          <div className="card dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Exposed Passwords</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{health.exposed}</p>
              </div>
              <Shield className="text-orange-600 dark:text-orange-400" size={24} />
            </div>
          </div>
          <div className="card dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Passwords</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{health.total}</p>
              </div>
              <Key className="text-gray-600 dark:text-gray-400" size={24} />
            </div>
          </div>
        </div>

        {totalIssues > 0 ? (
          <div className="space-y-6">
            {/* Weak Passwords */}
            {weakPasswords.length > 0 && (
              <div className="card dark:bg-slate-800 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Weak Passwords ({weakPasswords.length})
                  </h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  These passwords don't meet security requirements. They may be too short, lack complexity, or use common patterns.
                </p>
                <div className="space-y-2">
                  {weakPasswords.map((issue) => (
                    <Link
                      key={issue.itemId}
                      href={`/vault/items/${issue.itemId}`}
                      className="block p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-red-900 dark:text-red-200">{issue.title}</p>
                          <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                            Password: {issue.password.substring(0, 3)}•••••••
                          </p>
                        </div>
                        <Button variant="secondary" size="sm" className="dark:bg-slate-700 dark:text-slate-200">
                          Change
                        </Button>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Reused Passwords */}
            {reusedPasswords.length > 0 && (
              <div className="card dark:bg-slate-800 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <RefreshCw className="text-yellow-600 dark:text-yellow-400" size={24} />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Reused Passwords ({reusedPasswords.length})
                  </h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  These passwords are used across multiple accounts. Using the same password on multiple sites increases your risk if one account is compromised.
                </p>
                <div className="space-y-2">
                  {Array.from(new Set(reusedPasswords.map(p => p.password))).map((password) => {
                    const items = reusedPasswords.filter(p => p.password === password)
                    return (
                      <div
                        key={password}
                        className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                      >
                        <p className="font-medium text-yellow-900 dark:text-yellow-200 mb-2">
                          Used on {items.length} {items.length === 1 ? 'account' : 'accounts'}
                        </p>
                        <div className="space-y-1">
                          {items.map((item) => (
                            <Link
                              key={item.itemId}
                              href={`/vault/items/${item.itemId}`}
                              className="block text-sm text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100 hover:underline"
                            >
                              • {item.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Exposed Passwords */}
            {exposedPasswords.length > 0 && (
              <div className="card dark:bg-slate-800 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="text-orange-600 dark:text-orange-400" size={24} />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Exposed Passwords ({exposedPasswords.length})
                  </h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  These passwords are used on more than 10 different websites. This significantly increases your security risk.
                </p>
                <div className="space-y-2">
                  {Array.from(new Set(exposedPasswords.map(p => p.password))).map((password) => {
                    const items = exposedPasswords.filter(p => p.password === password)
                    return (
                      <div
                        key={password}
                        className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
                      >
                        <p className="font-medium text-orange-900 dark:text-orange-200 mb-2">
                          Used on {items.length} {items.length === 1 ? 'website' : 'websites'}
                        </p>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {items.map((item) => (
                            <Link
                              key={item.itemId}
                              href={`/vault/items/${item.itemId}`}
                              className="block text-sm text-orange-700 dark:text-orange-300 hover:text-orange-900 dark:hover:text-orange-100 hover:underline"
                            >
                              • {item.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="card text-center py-12 dark:bg-slate-800 dark:border-slate-700">
            <Shield className="text-green-600 dark:text-green-400 mx-auto mb-4" size={48} />
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">All Good!</h2>
            <p className="text-gray-600 dark:text-gray-400">No password health issues found.</p>
          </div>
        )}
      </div>
    </div>
  )
}

