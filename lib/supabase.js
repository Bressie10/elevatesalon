import { createClient } from '@supabase/supabase-js'

// Public client — safe to use in Server Components and client components
export function getPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase public env vars are not set')
  return createClient(url, key)
}

// Lazy singleton for contexts that call supabase directly
let _public = null
export const supabase = new Proxy({}, {
  get(_, prop) {
    if (!_public) _public = getPublicClient()
    return _public[prop]
  }
})

// Admin client — only use in server-side code (API routes, Server Actions)
export function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) throw new Error('Supabase admin env vars are not set')
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
