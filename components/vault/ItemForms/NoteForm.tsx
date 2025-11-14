'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { NoteData } from '@/types/vault.types'
import { FileText } from 'lucide-react'

const noteSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
  notes: z.string().optional(),
})

interface NoteFormProps {
  initialData?: NoteData
  onSubmit: (data: NoteData) => Promise<void>
  onCancel: () => void
}

export function NoteForm({ initialData, onSubmit, onCancel }: NoteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NoteData>({
    resolver: zodResolver(noteSchema),
    defaultValues: initialData || {
      content: '',
      notes: '',
    },
  })

  const handleFormSubmit = async (data: NoteData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="card space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-slate-700">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <FileText className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Secure Note</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Store sensitive notes and information</p>
          </div>
        </div>

        {/* Main Content */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <FileText className="inline mr-2 text-blue-500" size={16} />
            Note Content <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <textarea
            {...register('content')}
            rows={12}
            className="input resize-none font-mono text-sm"
            placeholder="Enter your note content here..."
          />
          {errors.content && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content.message}</p>}
        </div>

        {/* Additional Notes */}
        <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            {...register('notes')}
            rows={4}
            className="input resize-none"
            placeholder="Any additional information..."
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

