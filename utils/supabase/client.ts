import { createBrowserClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

}