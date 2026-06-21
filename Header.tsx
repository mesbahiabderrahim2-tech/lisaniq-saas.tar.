'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// ── Menu icon ─────────────────────────────────────────────────────────────────
function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <line x1="3" y1="6"  x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  )
}

// ── Avatar initials ────────────────────────────────────────────────────────────
function Avatar({ name, email }: { name: string | null; email: string }) {
  const initials = name
    ? name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
    : email[0]?.toUpperCase() ?? '?'

  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold font-data select-none"
      style={{
        background: 'rgba(61,111,232,0.18)',
        border:     '1px solid rgba(61,111,232,0.35)',
        color:      'var(--sapphire)',
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}

// ── Plan badge ─────────────────────────────────────────────────────────────────
function PlanBadge({ plan }: { plan: 'free' | 'pro' | 'enterprise' }) {
  const styles = {
    free: {
      background: 'rgba(74,88,120,0.2)',
      border:     '1px solid rgba(74,88,120,0.35)',
      color:      'var(--slate)',
    },
    pro: {
      background: 'rgba(201,168,76,0.12)',
      border:     '1px solid rgba(201,168,76,0.3)',
      color:      'var(--gold)',
    },
    enterprise: {
      background: 'rgba(31,187,138,0.1)',
      border:     '1px solid rgba(31,187,138,0.3)',
      color:      'var(--positive)',
    },
  }

  return (
    <span
      className="font-data text-[9px] tracking-[1.5px] uppercase px-2 py-0.5 rounded"
      style={styles[plan]}
    >
      {plan}
    </span>
  )
}

// ── Header ─────────────────────────────────────────────────────────────────────
interface HeaderProps {
  email:    string
  fullName: string | null
  plan:     'free' | 'pro' | 'enterprise'
  onMenuClick: () => void
}

export function Header({ email, fullName, plan, onMenuClick }: HeaderProps) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header
      className="h-16 flex items-center justify-between px-4 lg:px-6 shrink-0"
      style={{
        background:   'var(--surface-0)',
        borderBottom: '1px solid var(--line-1)',
      }}
    >
      {/* Mobile: hamburger */}
      <button
        type="button"
        onClick={onMenuClick}
        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-md transition-colors"
        style={{ color: 'var(--silver)' }}
        aria-label="Open navigation menu"
        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
          e.currentTarget.style.color      = 'var(--platinum)'
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.currentTarget.style.background = ''
          e.currentTarget.style.color      = 'var(--silver)'
        }}
      >
        <MenuIcon />
      </button>

      {/* Desktop: spacer (sidebar takes the left column) */}
      <div className="hidden lg:block" />

      {/* Right side: user identity + logout */}
      <div className="flex items-center gap-3">
        {/* User info */}
        <div className="flex items-center gap-2.5">
          <Avatar name={fullName} email={email} />
          <div className="hidden sm:flex flex-col leading-tight">
            {fullName && (
              <span className="text-[13px] font-medium" style={{ color: 'var(--platinum)' }}>
                {fullName}
              </span>
            )}
            <span
              className="font-data text-[11px]"
              style={{ color: 'var(--slate)' }}
            >
              {email}
            </span>
          </div>
          <div className="hidden sm:block">
            <PlanBadge plan={plan} />
          </div>
        </div>

        {/* Divider */}
        <div
          className="hidden sm:block w-px h-6"
          style={{ background: 'var(--line-2)' }}
          aria-hidden="true"
        />

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors"
          style={{
            color:  'var(--silver)',
            border: '1px solid var(--line-2)',
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.color       = '#f4a9a9'
            e.currentTarget.style.background  = 'rgba(220,75,75,0.08)'
            e.currentTarget.style.borderColor = 'rgba(220,75,75,0.25)'
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.color       = 'var(--silver)'
            e.currentTarget.style.background  = ''
            e.currentTarget.style.borderColor = 'var(--line-2)'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  )
}
