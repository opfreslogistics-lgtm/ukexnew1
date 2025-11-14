'use client'

import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function CollectSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4 transition-colors duration-300">
      <div className="max-w-md w-full text-center space-y-6 card dark:bg-slate-800 dark:border-slate-700">
        <div className="flex justify-center">
          <CheckCircle className="text-green-600 dark:text-green-400" size={64} />
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Information Submitted</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your information has been securely submitted and encrypted. The requester will be notified.
          </p>
        </div>
        <div className="p-4 bg-gray-100 dark:bg-slate-700 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong className="text-gray-900 dark:text-white">What happens next?</strong> The information you submitted is now stored in the requester's secure vault. 
            It is encrypted and only accessible by them.
          </p>
        </div>
      </div>
    </div>
  )
}

