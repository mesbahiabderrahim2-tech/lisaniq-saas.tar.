import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware — runs on every matched request before page rendering.
 *
 * Responsibilities:
 *   1. Refresh the Supabase session (keeps tokens fresh)
 *   2. Redirect unauthenticated users away from protected routes
 *   3. Redirect authenticated users away from auth pages
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
          )
        },
      },
    }
  )

  // Refresh session — IMPORTANT: do not remove, keeps tokens alive
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── Route Protection Rules ─────────────────────────────────────

  const isAuthRoute      = pathname.startsWith('/login') ||
                           pathname.startsWith('/register') ||
                           pathname.startsWith('/reset-password')

  const isProtectedRoute = pathname.startsWith('/dashboard') ||
                           pathname.startsWith('/projects') ||
                           pathname.startsWith('/reports') ||
                           pathname.startsWith('/settings')

  const isApiRoute       = pathname.startsWith('/api')

  // Unauthenticated user attempting a protected route → redirect to login
  if (!user && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)   // preserve intended destination
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated user visiting auth pages → redirect to dashboard
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // API routes: attach user id header for use in Route Handlers
  if (isApiRoute && user) {
    supabaseResponse.headers.set('x-user-id', user.id)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match every request except:
     *   - _next/static (static files)
     *   - _next/image (image optimization)
     *   - favicon.ico
     *   - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
