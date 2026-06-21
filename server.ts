import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types'

/**
 * Creates a Supabase client for use in Server Components and Route Handlers.
 * Reads auth tokens from the incoming request cookies.
 * Must be called inside a request context (Server Component or Route Handler).
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
            })
          } catch {
            // setAll called from a Server Component — cookies can only be
            // mutated from middleware or Server Actions. Safe to ignore.
          }
        },
      },
    }
  )
}
