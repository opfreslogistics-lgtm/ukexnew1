import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import LandingPage from '@/components/landing/LandingPage'

export default async function Home() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    redirect('/vault')
  }

  return <LandingPage />
}
