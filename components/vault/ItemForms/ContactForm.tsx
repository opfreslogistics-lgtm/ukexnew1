'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { ContactData } from '@/types/vault.types'
import { Plus, X, User, Mail, Phone, MapPin, FileText } from 'lucide-react'

const contactSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
})

interface ContactFormProps {
  initialData?: ContactData
  onSubmit: (data: ContactData) => Promise<void>
  onCancel: () => void
}

export function ContactForm({ initialData, onSubmit, onCancel }: ContactFormProps) {
  const [customFields, setCustomFields] = useState<Record<string, string>>(initialData?.customFields || {})
  const [newFieldKey, setNewFieldKey] = useState('')
  const [newFieldValue, setNewFieldValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactData>({
    resolver: zodResolver(contactSchema),
    defaultValues: initialData || {
      fullName: '',
    },
  })

  const handleFormSubmit = async (data: ContactData) => {
    setIsSubmitting(true)
    try {
      await onSubmit({
        ...data,
        customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
      })
    } finally {
      setIsSubmitting(false)
    }
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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-slate-700">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
            <User className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Contact Information</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Store contact details securely</p>
          </div>
        </div>

        {/* Main Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <User className="inline mr-2" size={16} />
              Full Name <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              {...register('fullName')}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
              placeholder="John Doe"
            />
            {errors.fullName && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="inline mr-2" size={16} />
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
              placeholder="user@example.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <Phone className="inline mr-2" size={16} />
              Phone
            </label>
            <input
              {...register('phone')}
              type="tel"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="inline mr-2" size={16} />
              Address Line 1
            </label>
            <input
              {...register('addressLine1')}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
              placeholder="123 Main Street"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="inline mr-2" size={16} />
              Address Line 2
            </label>
            <input
              {...register('addressLine2')}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
              placeholder="Apartment, suite, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="inline mr-2" size={16} />
              City
            </label>
            <input
              {...register('city')}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
              placeholder="New York"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="inline mr-2" size={16} />
              State or Province
            </label>
            <input
              {...register('state')}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
              placeholder="NY"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="inline mr-2" size={16} />
              ZIP or Postal Code
            </label>
            <input
              {...register('zipCode')}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
              placeholder="10001"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="inline mr-2" size={16} />
              Country or Region
            </label>
            <input
              {...register('country')}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
              placeholder="United States"
            />
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
            {...register('notes' as any)}
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
  )
}
