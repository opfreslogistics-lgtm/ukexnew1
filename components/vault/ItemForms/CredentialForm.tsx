'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PasswordGenerator } from '../PasswordGenerator'
import { CredentialData } from '@/types/vault.types'
import { Plus, X, Globe, Key, Mail, FileText, Sparkles } from 'lucide-react'

const credentialSchema = z.object({
  username: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  password: z.string().min(1, 'Password is required'),
  website: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
})

interface CredentialFormProps {
  initialData?: CredentialData
  onSubmit: (data: CredentialData) => Promise<void>
  onCancel: () => void
}

export function CredentialForm({ initialData, onSubmit, onCancel }: CredentialFormProps) {
  const [showGenerator, setShowGenerator] = useState(false)
  const [websites, setWebsites] = useState<string[]>(initialData?.websites || [])
  const [newWebsite, setNewWebsite] = useState('')
  const [customFields, setCustomFields] = useState<Record<string, string>>(initialData?.customFields || {})
  const [newFieldKey, setNewFieldKey] = useState('')
  const [newFieldValue, setNewFieldValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CredentialData>({
    resolver: zodResolver(credentialSchema),
    defaultValues: initialData || {
      password: '',
      website: '',
    },
  })

  const password = watch('password')

  const handleFormSubmit = async (data: CredentialData) => {
    setIsSubmitting(true)
    try {
      await onSubmit({
        ...data,
        websites: websites.length > 0 ? websites : undefined,
        customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addWebsite = () => {
    if (newWebsite.trim()) {
      setWebsites([...websites, newWebsite.trim()])
      setNewWebsite('')
    }
  }

  const removeWebsite = (index: number) => {
    setWebsites(websites.filter((_, i) => i !== index))
  }

  const addCustomField = () => {
    if (newFieldKey.trim() && newFieldValue.trim()) {
      setCustomFields({ ...customFields, [newFieldKey.trim()]: newFieldValue.trim() })
      setNewFieldKey('')
      setNewFieldValue('')
    }
  }

  const removeCustomField = (key: string) => {
    const newFields = { ...customFields }
    delete newFields[key]
    setCustomFields(newFields)
  }

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-slate-700">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Key className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Login Credentials</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Store your usernames and passwords securely</p>
            </div>
          </div>

          {/* Main Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="inline mr-2" size={16} />
                Email or Username
              </label>
              <input
                {...register('email')}
                type="text"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                placeholder="user@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <Key className="inline mr-2" size={16} />
                Password
              </label>
              <div className="flex gap-2">
                <input
                  {...register('password')}
                  type="password"
                  className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                  placeholder="Enter password"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowGenerator(true)}
                  className="whitespace-nowrap"
                >
                  <Sparkles size={16} className="mr-2" />
                  Generate
                </Button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <Globe className="inline mr-2" size={16} />
                Website Address
              </label>
              <input
                {...register('website')}
                type="url"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                placeholder="https://example.com"
              />
              {errors.website && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.website.message}</p>}
            </div>
          </div>

          {/* Additional Websites */}
          {websites.length > 0 && (
            <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Additional Websites</label>
              <div className="space-y-2">
                {websites.map((website, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      value={website}
                      readOnly
                      className="flex-1 px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeWebsite(index)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Website */}
          <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
            <div className="flex gap-2">
              <input
                value={newWebsite}
                onChange={(e) => setNewWebsite(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
              />
              <Button type="button" variant="secondary" onClick={addWebsite}>
                <Plus size={18} />
              </Button>
            </div>
          </div>

          {/* Custom Fields */}
          {Object.keys(customFields).length > 0 && (
            <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Custom Fields</label>
              <div className="space-y-2">
                {Object.entries(customFields).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <input
                      value={key}
                      readOnly
                      className="flex-1 px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white"
                    />
                    <input
                      value={value}
                      readOnly
                      className="flex-1 px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeCustomField(key)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Custom Field */}
          <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
            <div className="grid grid-cols-2 gap-2">
              <input
                value={newFieldKey}
                onChange={(e) => setNewFieldKey(e.target.value)}
                placeholder="Field name"
                className="px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
              />
              <div className="flex gap-2">
                <input
                  value={newFieldValue}
                  onChange={(e) => setNewFieldValue(e.target.value)}
                  placeholder="Field value"
                  className="flex-1 px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                />
                <Button type="button" variant="secondary" onClick={addCustomField}>
                  <Plus size={18} />
                </Button>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="inline mr-2" size={16} />
              Notes
            </label>
            <textarea
              {...register('notes')}
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
              placeholder="Additional notes..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </form>

      <PasswordGenerator
        isOpen={showGenerator}
        onClose={() => setShowGenerator(false)}
        onInsert={(password) => {
          setValue('password', password)
          setShowGenerator(false)
        }}
      />
    </>
  )
}
