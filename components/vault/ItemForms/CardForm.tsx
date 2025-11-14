'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { CardData } from '@/types/vault.types'
import { Plus, X, CreditCard, User, Calendar, Lock, MapPin, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { 
  getCardInfo, 
  formatCardNumber, 
  formatExpirationDate, 
  validateExpirationDate,
  getCardTypeName,
  getCardTypeColor,
  type CardType
} from '@/lib/card-utils'
import toast from 'react-hot-toast'

// Enhanced card schema with custom validation
const cardSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  cardholderName: z.string().min(1, 'Cardholder name is required'),
  cardNumber: z.string().min(1, 'Card number is required').refine(
    (val) => {
      const info = getCardInfo(val)
      return info.valid
    },
    { message: 'Invalid card number' }
  ),
  expirationDate: z.string().min(1, 'Expiration date is required').refine(
    (val) => {
      const validation = validateExpirationDate(val)
      return validation.valid && !validation.expired
    },
    { message: 'Invalid or expired date' }
  ),
  cvv: z.string().min(3, 'CVV is required').max(4, 'CVV must be 3-4 digits'),
  cardPin: z.string().optional(),
  zipCode: z.string().optional(),
  notes: z.string().optional(),
})

interface CardFormProps {
  initialData?: CardData
  onSubmit: (data: CardData) => Promise<void>
  onCancel: () => void
}

export function CardForm({ initialData, onSubmit, onCancel }: CardFormProps) {
  const [customFields, setCustomFields] = useState<Record<string, string>>(initialData?.customFields || {})
  const [newFieldKey, setNewFieldKey] = useState('')
  const [newFieldValue, setNewFieldValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cardNumber, setCardNumber] = useState(initialData?.cardNumber || '')
  const [expirationDate, setExpirationDate] = useState(initialData?.expirationDate || '')
  const [cardInfo, setCardInfo] = useState(getCardInfo(''))
  const [expValidation, setExpValidation] = useState<{ valid: boolean; expired: boolean; message?: string }>({ valid: false, expired: false })

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CardData>({
    resolver: zodResolver(cardSchema),
    defaultValues: initialData || {
      title: '',
      cardholderName: '',
      cardNumber: '',
      expirationDate: '',
      cvv: '',
    },
  })

  // Watch card number and expiration for real-time validation
  const watchedCardNumber = watch('cardNumber')
  const watchedExpDate = watch('expirationDate')

  useEffect(() => {
    if (watchedCardNumber !== undefined) {
      const info = getCardInfo(watchedCardNumber)
      setCardInfo(info)
      setCardNumber(info.formatted)
      setValue('cardNumber', info.formatted, { shouldValidate: true })
    }
  }, [watchedCardNumber, setValue])

  useEffect(() => {
    if (watchedExpDate !== undefined) {
      const validation = validateExpirationDate(watchedExpDate)
      setExpValidation(validation)
    }
  }, [watchedExpDate])

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    const digits = input.replace(/\D/g, '')
    const info = getCardInfo(digits)
    
    // Prevent over-entering based on card type
    if (digits.length > info.maxLength) {
      return // Don't update if exceeds max length
    }

    const formatted = formatCardNumber(digits)
    setCardNumber(formatted)
    setValue('cardNumber', formatted, { shouldValidate: true })
  }

  const handleExpirationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    const formatted = formatExpirationDate(input)
    setExpirationDate(formatted)
    setValue('expirationDate', formatted, { shouldValidate: true })
  }

  const handleFormSubmit = async (data: CardData) => {
    // Final validation
    const finalCardInfo = getCardInfo(data.cardNumber)
    if (!finalCardInfo.valid) {
      toast.error('Please enter a valid card number')
      return
    }

    const finalExpValidation = validateExpirationDate(data.expirationDate)
    if (!finalExpValidation.valid || finalExpValidation.expired) {
      toast.error(finalExpValidation.message || 'Please enter a valid expiration date')
      return
    }

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
      <div className="bg-white dark:bg-indigo-900/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-indigo-800/50 p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-indigo-800">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
            <CreditCard className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Credit Card</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Store your payment card information securely</p>
          </div>
        </div>

        {/* Main Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              <CreditCard className="inline mr-2" size={16} />
              Title <span className="text-red-500">*</span>
            </label>
            <input
              {...register('title')}
              className="w-full px-5 py-4 bg-gray-50 dark:bg-indigo-950/50 border-2 border-gray-300 dark:border-indigo-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
              placeholder="Work Credit Card"
            />
            {errors.title && <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.title.message}
            </p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              <User className="inline mr-2" size={16} />
              Cardholder Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('cardholderName')}
              className="w-full px-5 py-4 bg-gray-50 dark:bg-indigo-950/50 border-2 border-gray-300 dark:border-indigo-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
              placeholder="John Doe"
            />
            {errors.cardholderName && <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.cardholderName.message}
            </p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              <CreditCard className="inline mr-2" size={16} />
              Card Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Controller
                name="cardNumber"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    maxLength={cardInfo.type === 'amex' ? 17 : 19}
                    className={`w-full px-5 py-4 bg-gray-50 dark:bg-indigo-950/50 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all font-mono text-lg text-gray-900 dark:text-white ${
                      cardInfo.valid 
                        ? 'border-green-500 dark:border-green-400' 
                        : cardNumber.length > 0 
                          ? 'border-red-500 dark:border-red-400' 
                          : 'border-gray-300 dark:border-indigo-800'
                    }`}
                    placeholder="1234 5678 9012 3456"
                  />
                )}
              />
              {cardNumber.length > 0 && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {cardInfo.valid ? (
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold text-white bg-gradient-to-r ${getCardTypeColor(cardInfo.type)}`}>
                        {getCardTypeName(cardInfo.type)}
                      </span>
                      <CheckCircle className="text-green-500" size={20} />
                    </div>
                  ) : cardInfo.type !== 'unknown' ? (
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold text-white bg-gradient-to-r ${getCardTypeColor(cardInfo.type)}`}>
                      {getCardTypeName(cardInfo.type)}
                    </span>
                  ) : null}
                </div>
              )}
            </div>
            {cardNumber.length > 0 && !cardInfo.valid && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle size={14} />
                {cardNumber.length < 13 ? 'Card number too short' : 'Invalid card number'}
              </p>
            )}
            {errors.cardNumber && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.cardNumber.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="inline mr-2" size={16} />
              Expiration Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Controller
                name="expirationDate"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    value={expirationDate}
                    onChange={handleExpirationChange}
                    maxLength={5}
                    className={`w-full px-5 py-4 bg-gray-50 dark:bg-indigo-950/50 border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all font-mono text-gray-900 dark:text-white ${
                      expValidation.valid && !expValidation.expired
                        ? 'border-green-500 dark:border-green-400' 
                        : expirationDate.length > 0 
                          ? 'border-red-500 dark:border-red-400' 
                          : 'border-gray-300 dark:border-indigo-800'
                    }`}
                    placeholder="MM/YY"
                  />
                )}
              />
              {expirationDate.length === 5 && expValidation.valid && !expValidation.expired && (
                <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={20} />
              )}
            </div>
            {expValidation.expired && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle size={14} />
                {expValidation.message || 'This card has expired'}
              </p>
            )}
            {errors.expirationDate && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.expirationDate.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              <Lock className="inline mr-2" size={16} />
              CVV <span className="text-red-500">*</span>
            </label>
            <input
              {...register('cvv')}
              type="password"
              maxLength={4}
              className="w-full px-5 py-4 bg-gray-50 dark:bg-indigo-950/50 border-2 border-gray-300 dark:border-indigo-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all font-mono text-gray-900 dark:text-white"
              placeholder="123"
            />
            {errors.cvv && <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.cvv.message}
            </p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              <Lock className="inline mr-2" size={16} />
              Card PIN
            </label>
            <input
              {...register('cardPin')}
              type="password"
              maxLength={10}
              className="w-full px-5 py-4 bg-gray-50 dark:bg-indigo-950/50 border-2 border-gray-300 dark:border-indigo-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all font-mono text-gray-900 dark:text-white"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="inline mr-2" size={16} />
              ZIP or Postal Code
            </label>
            <input
              {...register('zipCode')}
              className="w-full px-5 py-4 bg-gray-50 dark:bg-indigo-950/50 border-2 border-gray-300 dark:border-indigo-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
              placeholder="12345"
            />
          </div>
        </div>

        {/* Custom Fields */}
        {Object.keys(customFields).length > 0 && (
          <div className="pt-4 border-t border-gray-200 dark:border-indigo-800">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Custom Fields</label>
            <div className="space-y-2">
              {Object.entries(customFields).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <input
                    value={key}
                    readOnly
                    className="flex-1 px-4 py-2 bg-gray-50 dark:bg-indigo-950/50 border border-gray-200 dark:border-indigo-800 rounded-xl text-sm text-gray-900 dark:text-white"
                  />
                  <input
                    value={value}
                    readOnly
                    className="flex-1 px-4 py-2 bg-gray-50 dark:bg-indigo-950/50 border border-gray-200 dark:border-indigo-800 rounded-xl text-sm text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeCustomField(key)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Custom Field */}
        <div className="pt-4 border-t border-gray-200 dark:border-indigo-800">
          <div className="grid grid-cols-2 gap-2">
            <input
              value={newFieldKey}
              onChange={(e) => setNewFieldKey(e.target.value)}
              placeholder="Field name"
              className="px-4 py-2 bg-gray-50 dark:bg-indigo-950/50 border-2 border-gray-300 dark:border-indigo-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 dark:text-white"
            />
            <div className="flex gap-2">
              <input
                value={newFieldValue}
                onChange={(e) => setNewFieldValue(e.target.value)}
                placeholder="Field value"
                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-indigo-950/50 border-2 border-gray-300 dark:border-indigo-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 dark:text-white"
              />
              <Button type="button" variant="secondary" onClick={addCustomField}>
                <Plus size={18} />
              </Button>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="pt-4 border-t border-gray-200 dark:border-indigo-800">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            <FileText className="inline mr-2" size={16} />
            Notes
          </label>
          <textarea
            {...register('notes')}
            rows={4}
            className="w-full px-5 py-4 bg-gray-50 dark:bg-indigo-950/50 border-2 border-gray-300 dark:border-indigo-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none text-gray-900 dark:text-white"
            placeholder="Additional notes..."
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !cardInfo.valid || expValidation.expired} className="min-w-[140px] bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Saving...
            </>
          ) : (
            'Save Card'
          )}
        </Button>
      </div>
    </form>
  )
}
