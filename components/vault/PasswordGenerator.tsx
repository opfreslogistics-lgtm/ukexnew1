'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { generatePassword, calculateEntropy, type PasswordOptions } from '@/lib/password'
import { Copy, RefreshCw, Check, Key, Zap, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

interface PasswordGeneratorProps {
  isOpen: boolean
  onClose: () => void
  onInsert?: (password: string) => void
}

export function PasswordGenerator({ isOpen, onClose, onInsert }: PasswordGeneratorProps) {
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
  })
  const [password, setPassword] = useState('')
  const [copied, setCopied] = useState(false)

  const generate = () => {
    const newPassword = generatePassword(options)
    setPassword(newPassword)
    setCopied(false)
  }

  useEffect(() => {
    if (isOpen) {
      generate()
    }
  }, [isOpen])

  const handleCopy = async () => {
    if (!password) return
    await navigator.clipboard.writeText(password)
    setCopied(true)
    toast.success('Password copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleInsert = () => {
    if (onInsert && password) {
      onInsert(password)
      onClose()
    }
  }

  const entropy = password ? calculateEntropy(password, options) : 0
  const strength = entropy < 40 ? 'Weak' : entropy < 60 ? 'Fair' : entropy < 80 ? 'Good' : 'Strong'
  const strengthColor = {
    Weak: 'from-red-500 to-pink-500',
    Fair: 'from-yellow-500 to-orange-500',
    Good: 'from-blue-500 to-cyan-500',
    Strong: 'from-green-500 to-emerald-500',
  }[strength]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Password Generator" size="lg">
      <div className="space-y-6">
        {/* Generated Password Display */}
        <div className="space-y-4">
          <div className="relative">
            <div className="flex items-center gap-2">
              <Input
                value={password}
                readOnly
                className="font-mono text-lg pr-24 bg-gray-50 dark:bg-indigo-950/50"
              />
              <div className="absolute right-2 flex items-center gap-2">
                <Button
                  onClick={handleCopy}
                  variant="secondary"
                  size="sm"
                  className="px-3"
                  title="Copy password"
                >
                  {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                </Button>
                <Button
                  onClick={generate}
                  variant="ghost"
                  size="sm"
                  className="px-3"
                  title="Generate new password"
                >
                  <RefreshCw size={18} />
                </Button>
              </div>
            </div>
          </div>

          {/* Strength Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Shield size={16} />
                Security Level
              </span>
              <span className={`font-bold flex items-center gap-2 ${
                strength === 'Strong' ? 'text-green-600 dark:text-green-400' :
                strength === 'Good' ? 'text-blue-600 dark:text-blue-400' :
                strength === 'Fair' ? 'text-yellow-600 dark:text-yellow-400' :
                'text-red-600 dark:text-red-400'
              }`}>
                <Zap size={16} />
                {strength}
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-indigo-900 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${strengthColor} transition-all duration-500`}
                style={{ width: `${Math.min((entropy / 100) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Entropy: {entropy.toFixed(1)} bits • Length: {password.length} characters
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-5 pt-4 border-t border-gray-200 dark:border-indigo-800">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
              Password Length: <span className="text-pink-600 dark:text-pink-400">{options.length}</span>
            </label>
            <input
              type="range"
              min="8"
              max="64"
              value={options.length}
              onChange={(e) => {
                setOptions({ ...options, length: parseInt(e.target.value) })
                generate()
              }}
              className="w-full h-2 bg-gray-200 dark:bg-indigo-900 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>8</span>
              <span>64</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Character Types
            </label>
            {[
              { key: 'includeUppercase', label: 'Uppercase Letters (A-Z)', icon: '🔤' },
              { key: 'includeLowercase', label: 'Lowercase Letters (a-z)', icon: '🔡' },
              { key: 'includeNumbers', label: 'Numbers (0-9)', icon: '🔢' },
              { key: 'includeSymbols', label: 'Symbols (!@#$%...)', icon: '🔣' },
            ].map(({ key, label, icon }) => (
              <label
                key={key}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={options[key as keyof PasswordOptions] as boolean}
                  onChange={(e) => {
                    setOptions({ ...options, [key]: e.target.checked })
                    generate()
                  }}
                  className="w-5 h-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500 focus:ring-2 cursor-pointer"
                />
                <span className="text-lg">{icon}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-indigo-800">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Close
          </Button>
          {onInsert && (
            <Button
              onClick={handleInsert}
              className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            >
              <Key size={18} className="mr-2" />
              Insert Password
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
