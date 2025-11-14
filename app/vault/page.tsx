import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { VaultHome } from '@/components/vault/VaultHome'

export default async function VaultPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return <VaultHome userId={session.user.id} />
}

