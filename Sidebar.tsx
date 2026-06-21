'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// ── Nav items ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    href:  '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    href:  '/projects',
    label: 'Projects',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    href:  '/reports',
    label: 'Reports',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
  {
    href:  '/billing',
    label: 'Billing',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  {
    href:  '/settings',
    label: 'Settings',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
] as const

// ── Logo mark ──────────────────────────────────────────────────────────────────
function BrandMark() {
  return (
    <div className="flex items-center gap-3 px-5 h-16 border-b shrink-0"
      style={{ borderColor: 'var(--line-1)' }}>
      <svg width="32" height="32" viewBox="0 0 36 36" fill="none" aria-hidden="true" className="shrink-0">
        <rect width="36" height="36" rx="8" fill="#0d1628"/>
        <rect x="1" y="1" width="34" height="34" rx="7" stroke="#243050" strokeWidth="1"/>
        <rect x="8" y="9" width="3.5" height="14" rx="1" fill="#3d6fe8"/>
        <rect x="8" y="20" width="9" height="3" rx="1" fill="#3d6fe8"/>
        <rect x="20" y="9" width="3.5" height="14" rx="1" fill="#c9a84c"/>
        <circle cx="26.5" cy="19.5" r="4" stroke="#c9a84c" strokeWidth="2.5"/>
        <line x1="29" y1="22" x2="31" y2="24.5" stroke="#c9a84c" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
      <div>
        <div className="font-display text-[18px] leading-none"
          style={{ color: 'var(--platinum)' }}>
          Lisan<span style={{ color: 'var(--sapphire)' }}>IQ</span>
        </div>
        <div className="font-data text-[8px] tracking-[2px] uppercase mt-1"
          style={{ color: 'var(--slate)' }}>
          Executive Intel
        </div>
      </div>
    </div>
  )
}

// ── Sidebar inner (shared between desktop and mobile) ─────────────────────────
interface SidebarInnerProps {
  onNavClick?: () => void
}

export function SidebarInner({ onNavClick }: SidebarInnerProps) {
  const pathname = usePathname()

  // A route is active if the pathname starts with the href.
  // For /dashboard we require exact match to avoid matching everything.
  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--surface-1)' }}>
      <BrandMark />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Main navigation">
        <ul className="flex flex-col gap-1" role="list">
          {NAV_ITEMS.map(item => {
            const active = isActive(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavClick}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium',
                    'transition-colors duration-150 outline-none',
                    'focus-visible:ring-2 focus-visible:ring-offset-1',
                  ].join(' ')}
                  style={
                    active
                      ? {
                          background:     'rgba(61,111,232,0.12)',
                          color:          'var(--platinum)',
                          borderLeft:     '2px solid var(--sapphire)',
                          paddingLeft:    '10px',
                          '--tw-ring-color': 'var(--sapphire)',
                        } as React.CSSProperties
                      : {
                          color:          'var(--silver)',
                          '--tw-ring-color': 'var(--sapphire)',
                        } as React.CSSProperties
                  }
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    if (!active) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                      e.currentTarget.style.color      = 'var(--platinum)'
                    }
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    if (!active) {
                      e.currentTarget.style.background = ''
                      e.currentTarget.style.color      = 'var(--silver)'
                    }
                  }}
                >
                  <span
                    className="shrink-0"
                    style={{ color: active ? 'var(--sapphire)' : 'inherit' }}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer area */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--line-1)' }}>
        <div className="px-3 py-2 rounded-md"
          style={{
            background:  'rgba(201,168,76,0.06)',
            border:      '1px solid rgba(201,168,76,0.15)',
          }}>
          <div className="font-data text-[9px] tracking-[1.5px] uppercase mb-0.5"
            style={{ color: 'var(--gold)' }}>
            MVP Build
          </div>
          <div className="text-[11px]" style={{ color: 'var(--slate)' }}>
            Production ready
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Desktop sidebar (static, no toggle) ───────────────────────────────────────
export function DesktopSidebar() {
  return (
    <aside
      className="hidden lg:flex flex-col w-60 shrink-0 fixed left-0 top-0 bottom-0 z-30"
      style={{ borderRight: '1px solid var(--line-1)' }}
      aria-label="Sidebar"
    >
      <SidebarInner />
    </aside>
  )
}

// ── Mobile drawer ─────────────────────────────────────────────────────────────
interface MobileDrawerProps {
  open:    boolean
  onClose: () => void
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={[
          'lg:hidden fixed inset-0 z-40 transition-opacity duration-200',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        style={{ background: 'rgba(7,11,20,0.72)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        className={[
          'lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64',
          'transition-transform duration-200 ease-out',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        style={{ borderRight: '1px solid var(--line-1)' }}
        aria-label="Sidebar"
        aria-hidden={!open}
      >
        <SidebarInner onNavClick={onClose} />
      </aside>
    </>
  )
}
