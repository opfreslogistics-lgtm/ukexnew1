'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { 
  LogOut, Lock, Plus, Key, Shield, Folder, Trash2, 
  Home, Heart, Users, Mail, Menu, X, Sparkles, Moon, Sun,
  Search, Bell, Settings, Zap, Star, TrendingUp, Activity, User, Send
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { PasswordGenerator } from '@/components/vault/PasswordGenerator'
import { NotificationBell } from '@/components/vault/NotificationBell'

interface VaultLayoutProps {
  children: React.ReactNode
}

export function VaultLayout({ children }: VaultLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Load user profile
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (profileData) {
          setProfile(profileData)
        }
      }
    }
    getUser()

    // Load dark mode preference
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) {
      setDarkMode(saved === 'true')
    } else {
      setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', darkMode.toString())
  }, [darkMode])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/auth/login')
    router.refresh()
  }

  const navItems = [
    { href: '/vault', icon: Home, label: 'My Vault', exact: true, color: 'from-pink-500 to-rose-500' },
    { href: '/vault/folders', icon: Folder, label: 'Folders', color: 'from-orange-500 to-amber-500' },
    { href: '/vault/health', icon: Heart, label: 'Password Health', color: 'from-emerald-500 to-teal-500' },
    { href: '/vault/shared', icon: Users, label: 'Shared Items', color: 'from-violet-500 to-purple-500' },
    { href: '/vault/collected', icon: Sparkles, label: 'Collected Items', color: 'from-cyan-500 to-blue-500' },
    { href: '/vault/messages', icon: Mail, label: 'Messages', color: 'from-blue-500 to-cyan-500' },
    { href: '/vault/aliases', icon: Mail, label: 'Email Aliases', color: 'from-cyan-500 to-blue-500' },
    { href: '/vault/email-sender', icon: Send, label: 'Email Sender', color: 'from-teal-500 to-green-500' },
    { href: '/vault/trash', icon: Trash2, label: 'Trash', color: 'from-red-500 to-pink-500' },
    { href: '/vault/profile', icon: Settings, label: 'Profile', color: 'from-indigo-500 to-purple-500' },
  ]

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname?.startsWith(href)
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950' 
        : 'bg-gradient-to-br from-rose-50 via-pink-50 via-purple-50 to-indigo-50'
    }`}>
      {/* Top Bar */}
      <header className={`${
        darkMode 
          ? 'bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-pink-900/90 border-indigo-800/50' 
          : 'bg-white/80 border-rose-200/50'
      } backdrop-blur-xl border-b sticky top-0 z-50 shadow-2xl transition-all duration-500`}>
        <div className="max-w-[1600px] mx-auto flex items-center justify-between h-20 px-6">
          {/* Left: Logo and Menu Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`lg:hidden p-2.5 rounded-xl transition-all duration-300 ${
                darkMode 
                  ? 'hover:bg-purple-800/50 text-purple-300 hover:scale-110' 
                  : 'hover:bg-rose-100 text-rose-600 hover:scale-110'
              }`}
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <Link href="/vault" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Lock className="text-white" size={24} />
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="text-2xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  OPFRES Vault
                </span>
                <p className={`text-xs ${darkMode ? 'text-purple-300' : 'text-purple-600'} font-medium`}>
                  Secure & Private
                </p>
              </div>
            </Link>
          </div>

          {/* Right: Quick Actions and User */}
          <div className="flex items-center gap-3">
            <Link href="/vault/new">
              <Button size="sm" className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Plus size={18} />
                <span>New Item</span>
              </Button>
            </Link>
            <Link href="/vault/ask">
              <Button variant="secondary" size="sm" className="hidden md:flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Sparkles size={18} />
                <span>Ask for Info</span>
              </Button>
            </Link>
            <NotificationBell />
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-xl transition-all duration-300 ${
                darkMode 
                  ? 'hover:bg-purple-800/50 text-purple-300 hover:scale-110' 
                  : 'hover:bg-rose-100 text-rose-600 hover:scale-110'
              }`}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className={`flex items-center gap-3 pl-4 border-l ${
              darkMode ? 'border-purple-800/50' : 'border-rose-200'
            }`}>
              <div className="flex items-center gap-3">
                {profile?.avatar_url ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
                    <img
                      src={profile.avatar_url}
                      alt={profile.first_name || user?.email?.split('@')[0] || 'User'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    darkMode ? 'bg-gradient-to-br from-purple-500 to-pink-500 border-purple-400/30' : 'bg-gradient-to-br from-pink-500 to-rose-500 border-pink-300/30'
                  }`}>
                    <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-white'}`}>
                      {(profile?.first_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="hidden sm:block text-right">
                  <p className={`text-sm font-bold ${darkMode ? 'text-purple-200' : 'text-gray-900'}`}>
                    {profile?.first_name && profile?.last_name
                      ? `${profile.first_name} ${profile.last_name}`
                      : profile?.first_name || user?.email?.split('@')[0] || 'User'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className={`p-2.5 rounded-xl transition-all duration-300 ${
                  darkMode 
                    ? 'hover:bg-purple-800/50 text-purple-300 hover:scale-110' 
                    : 'hover:bg-rose-100 text-rose-600 hover:scale-110'
                }`}
                title="Sign out"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex max-w-[1600px] mx-auto">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40
            w-72 transition-all duration-500 ease-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            pt-20 lg:pt-0
            ${darkMode 
              ? 'bg-gradient-to-b from-indigo-900/95 via-purple-900/95 to-pink-900/95 border-indigo-800/50' 
              : 'bg-white/95 border-rose-200/50'
            }
            backdrop-blur-2xl border-r shadow-2xl
          `}
        >
          <nav className={`p-6 space-y-2 h-[calc(100vh-5rem)] overflow-y-auto custom-scrollbar`}>
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href, item.exact)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    group relative flex items-center gap-4 px-5 py-4 rounded-2xl
                    transition-all duration-300 transform
                    ${
                      active
                        ? darkMode
                          ? `bg-gradient-to-r ${item.color} text-white shadow-2xl scale-105 border-2 border-white/20`
                          : `bg-gradient-to-r ${item.color} text-white shadow-2xl scale-105 border-2 border-white/30`
                        : darkMode
                          ? 'text-purple-200 hover:bg-purple-800/30 hover:text-white hover:scale-105 hover:shadow-xl'
                          : 'text-gray-700 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 hover:text-gray-900 hover:scale-105 hover:shadow-lg'
                    }
                  `}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                  )}
                  <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                    active 
                      ? 'bg-white/20' 
                      : darkMode 
                        ? 'bg-purple-800/20 group-hover:bg-purple-700/30' 
                        : 'bg-rose-100 group-hover:bg-rose-200'
                  }`}>
                    <Icon size={22} className={active ? 'text-white' : ''} />
                  </div>
                  <span className="font-bold text-base">{item.label}</span>
                  {active && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  )}
                </Link>
              )
            })}

            <div className={`pt-6 mt-6 border-t ${
              darkMode ? 'border-purple-800/50' : 'border-rose-200'
            }`}>
              <button
                onClick={() => setShowPasswordGenerator(true)}
                className={`w-full group flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 transform ${
                  darkMode
                    ? 'text-purple-200 hover:bg-purple-800/30 hover:text-white hover:scale-105 hover:shadow-xl'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:text-gray-900 hover:scale-105 hover:shadow-lg'
                }`}
              >
                <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                  darkMode 
                    ? 'bg-purple-800/20 group-hover:bg-purple-700/30' 
                    : 'bg-amber-100 group-hover:bg-amber-200'
                }`}>
                  <Key size={22} />
                </div>
                <span className="font-bold text-base">Password Generator</span>
              </button>
            </div>

            {/* Quick Stats */}
            <div className={`pt-6 mt-6 border-t ${
              darkMode ? 'border-purple-800/50' : 'border-rose-200'
            }`}>
              <div className={`p-4 rounded-2xl ${
                darkMode ? 'bg-gradient-to-br from-purple-800/30 to-pink-800/30' : 'bg-gradient-to-br from-rose-50 to-pink-50'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <Activity size={18} className={darkMode ? 'text-purple-300' : 'text-rose-600'} />
                  <span className={`text-sm font-bold ${darkMode ? 'text-purple-200' : 'text-gray-900'}`}>
                    Quick Stats
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${darkMode ? 'text-purple-300' : 'text-gray-600'}`}>Items</span>
                    <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>-</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${darkMode ? 'text-purple-300' : 'text-gray-600'}`}>Health</span>
                    <span className={`text-sm font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>100%</span>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className={`flex-1 min-h-[calc(100vh-5rem)] p-6 lg:p-8 transition-all duration-500`}>
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Password Generator Modal */}
      <PasswordGenerator
        isOpen={showPasswordGenerator}
        onClose={() => setShowPasswordGenerator(false)}
      />

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${darkMode ? 'rgba(192, 132, 252, 0.3)' : 'rgba(244, 63, 94, 0.3)'};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? 'rgba(192, 132, 252, 0.5)' : 'rgba(244, 63, 94, 0.5)'};
        }
      `}</style>
    </div>
  )
}
