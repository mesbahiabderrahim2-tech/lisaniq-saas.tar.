'use client'

import { useState } from 'react'
import { DesktopSidebar, MobileDrawer } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'

interface DashboardShellProps {
  email:    string
  fullName: string | null
  plan:     'free' | 'pro' | 'enterprise'
  children?: React.ReactNode
}

/**
 * Thin client shell that owns the mobile sidebar toggle state.
 * All actual business logic and data fetching stay in Server Components.
 */
export function DashboardShell({ email, fullName, plan, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface-0)' }}>
      {/* Desktop sidebar — fixed left column */}
      <DesktopSidebar />

      {/* Mobile drawer — slides in over content */}
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main area — offset on desktop to clear the fixed sidebar */}
      <div className="lg:pl-60 flex flex-col min-h-screen">
        <Header
          email={email}
          fullName={fullName}
          plan={plan}
          onMenuClick={() => setMobileOpen(true)}
        />

        {/* Page content */}
        <main
          className="flex-1 overflow-y-auto"
          id="main-content"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
