import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types'

/**
 * Admin client that uses the SERVICE ROLE key.
 * Bypasses Row Level Security — use ONLY for:
 *   • Server-side administrative operations
 *   • Background jobs and migrations
 *   • Operations that require cross-user data access
 *
 * NEVER expose this client to the browser.
 * NEVER use in Client Components or client-side code.
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. ' +
      'This environment variable is required for admin operations.'
    )
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken:  false,
        persistSession:    false,
        detectSessionInUrl: false,
      },
    }
  )
}
