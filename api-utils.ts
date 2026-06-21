// ══════════════════════════════════════════════════════════════
// LisanIQ — API Utilities
// Shared helpers for all Route Handlers.
// ══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { User } from '@/types'

// ── Response factories ──────────────────────────────────────

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data, error: null }, { status })
}

export function created<T>(data: T): NextResponse {
  return NextResponse.json({ data, error: null }, { status: 201 })
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

export function badRequest(message: string): NextResponse {
  return NextResponse.json({ data: null, error: message }, { status: 400 })
}

export function unauthorized(message = 'Authentication required.'): NextResponse {
  return NextResponse.json({ data: null, error: message }, { status: 401 })
}

export function forbidden(message = 'You do not have permission to perform this action.'): NextResponse {
  return NextResponse.json({ data: null, error: message }, { status: 403 })
}

export function notFound(resource = 'Resource'): NextResponse {
  return NextResponse.json({ data: null, error: `${resource} not found.` }, { status: 404 })
}

export function conflict(message: string): NextResponse {
  return NextResponse.json({ data: null, error: message }, { status: 409 })
}

export function unprocessable(message: string): NextResponse {
  return NextResponse.json({ data: null, error: message }, { status: 422 })
}

export function tooManyRequests(message: string): NextResponse {
  return NextResponse.json({ data: null, error: message }, { status: 429 })
}

export function serverError(message = 'An unexpected error occurred.'): NextResponse {
  return NextResponse.json({ data: null, error: message }, { status: 500 })
}

// ── Auth guard ──────────────────────────────────────────────

export interface AuthContext {
  user:     User
  supabase: Awaited<ReturnType<typeof createClient>>
}

type AuthSuccess = { success: true;  ctx: AuthContext }
type AuthFailure = { success: false; response: NextResponse }
type AuthResult  = AuthSuccess | AuthFailure

/**
 * Verifies the request session and returns a discriminated union.
 * Callers narrow with `if (!result.success) return result.response`.
 * After that guard ctx is typed as AuthContext with no nullability.
 */
export async function requireAuth(): Promise<AuthResult> {
  const supabase = await createClient()
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

  if (authError || !authUser) {
    return { success: false, response: unauthorized() }
  }

  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (profileError || !userProfile) {
    return { success: false, response: unauthorized('User profile not found.') }
  }

  return { success: true, ctx: { user: userProfile as User, supabase } }
}

// ── Pagination helpers ──────────────────────────────────────

export interface PaginationParams {
  page:     number
  pageSize: number
  offset:   number
}

export function parsePagination(searchParams: URLSearchParams): PaginationParams {
  const page     = Math.max(1, parseInt(searchParams.get('page')      ?? '1',  10))
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
  const offset   = (page - 1) * pageSize
  return { page, pageSize, offset }
}
