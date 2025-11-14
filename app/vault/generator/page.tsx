'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PasswordGenerator } from '@/components/vault/PasswordGenerator'

export default function GeneratorPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to vault after a short delay
    const timer = setTimeout(() => {
      router.push('/vault')
    }, 100)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <PasswordGenerator
      isOpen={true}
      onClose={() => router.push('/vault')}
    />
  )
}

