// ══════════════════════════════════════════════════════
// LisanIQ — Shared page UI primitives
// Server-renderable, zero client JS.
// ══════════════════════════════════════════════════════

import Link from 'next/link'

// ── Page header ────────────────────────────────────────
interface PageHeaderProps {
  title:    string
  subtitle?: string
  action?:  React.ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
      <div>
        <h1
          className="font-display text-2xl lg:text-[28px] leading-tight mb-1"
          style={{ color: 'var(--platinum)' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm" style={{ color: 'var(--silver)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

// ── Section label ──────────────────────────────────────
interface SectionLabelProps {
  num:   string
  label: string
}

export function SectionLabel({ num, label }: SectionLabelProps) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span
        className="font-data text-[10px] px-2 py-1 rounded"
        style={{
          color:      'var(--sapphire)',
          background: 'rgba(61,111,232,0.1)',
          border:     '1px solid rgba(61,111,232,0.2)',
          letterSpacing: '0.5px',
        }}
      >
        {num}
      </span>
      <span
        className="font-data text-[11px] font-semibold uppercase tracking-[2px]"
        style={{ color: 'var(--slate)' }}
      >
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: 'var(--line-1)' }} />
    </div>
  )
}

// ── Card wrapper ───────────────────────────────────────
interface CardProps {
  children?: React.ReactNode
  className?: string
  padding?:  string
}

export function Card({ children, className = '', padding = 'p-6' }: CardProps) {
  return (
    <div
      className={`rounded-xl ${padding} ${className}`}
      style={{ background: 'var(--surface-2)', border: '1px solid var(--line-1)' }}
    >
      {children}
    </div>
  )
}

// ── Stat card ──────────────────────────────────────────
interface StatCardProps {
  label:   string
  value:   string
  note?:   string
  color?:  string
  accent?: string   // top-bar gradient
}

export function StatCard({ label, value, note, color = 'var(--platinum)', accent }: StatCardProps) {
  return (
    <div
      className="rounded-xl p-5 relative overflow-hidden"
      style={{ background: 'var(--surface-2)', border: '1px solid var(--line-1)' }}
    >
      {accent && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
          style={{ background: accent }}
        />
      )}
      <div
        className="font-data text-[9.5px] font-semibold uppercase tracking-[2px] mb-2"
        style={{ color: 'var(--slate)' }}
      >
        {label}
      </div>
      <div
        className="font-data text-[26px] font-bold leading-none mb-1"
        style={{ color }}
      >
        {value}
      </div>
      {note && (
        <div className="text-[11px]" style={{ color: 'var(--slate)' }}>
          {note}
        </div>
      )}
    </div>
  )
}

// ── Empty state ────────────────────────────────────────
interface EmptyStateProps {
  icon:     React.ReactNode
  title:    string
  body:     string
  action?:  { label: string; href: string }
}

export function EmptyState({ icon, title, body, action }: EmptyStateProps) {
  return (
    <div
      className="rounded-xl border p-12 text-center"
      style={{ background: 'var(--surface-2)', borderColor: 'var(--line-1)', borderStyle: 'dashed' }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ background: 'rgba(74,88,120,0.15)', border: '1px solid var(--line-2)' }}
      >
        {icon}
      </div>
      <p className="text-[14px] font-medium mb-1.5" style={{ color: 'var(--platinum)' }}>
        {title}
      </p>
      <p className="text-[12.5px] mb-5" style={{ color: 'var(--slate)' }}>
        {body}
      </p>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium transition-colors"
          style={{ background: 'var(--sapphire)', color: '#fff' }}
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}

// ── Business status badge ──────────────────────────────
const STATUS_STYLES = {
  Elite:    { bg: 'rgba(201,168,76,.12)',  border: 'rgba(201,168,76,.3)',  color: '#e8cf8a', dot: '#c9a84c' },
  Strong:   { bg: 'rgba(31,187,138,.1)',   border: 'rgba(31,187,138,.28)', color: '#7be8c7', dot: '#1fbb8a' },
  Average:  { bg: 'rgba(77,142,240,.1)',   border: 'rgba(77,142,240,.25)', color: '#9fc4f5', dot: '#4d8ef0' },
  Critical: { bg: 'rgba(220,75,75,.1)',    border: 'rgba(220,75,75,.28)',  color: '#f4a9a9', dot: '#dc4b4b' },
}

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status as keyof typeof STATUS_STYLES] ?? STATUS_STYLES.Average
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: s.dot }}
      />
      {status}
    </span>
  )
}

// ── Health score dot color ─────────────────────────────
export function healthColor(score: number): string {
  return score >= 75 ? '#1fbb8a' : score >= 50 ? '#d4922a' : '#dc4b4b'
}

// ── Dataset status badge ───────────────────────────────
const DS_STYLES = {
  ready:      { bg: 'rgba(31,187,138,.08)',  color: '#1fbb8a', label: 'Ready'      },
  processing: { bg: 'rgba(77,142,240,.08)',  color: '#4d8ef0', label: 'Processing' },
  error:      { bg: 'rgba(220,75,75,.08)',   color: '#dc4b4b', label: 'Error'      },
}

export function DatasetStatusBadge({ status }: { status: string }) {
  const s = DS_STYLES[status as keyof typeof DS_STYLES] ?? DS_STYLES.processing
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10.5px] font-medium font-data"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  )
}

// ── Risk severity badge ────────────────────────────────
const RISK_STYLES = {
  Critical: { color: '#f4a9a9', bg: 'rgba(220,75,75,.1)' },
  Caution:  { color: '#e8c27a', bg: 'rgba(212,146,42,.1)' },
  Healthy:  { color: '#7be8c7', bg: 'rgba(31,187,138,.1)' },
}

export function RiskBadge({ severity }: { severity: string }) {
  const s = RISK_STYLES[severity as keyof typeof RISK_STYLES] ?? RISK_STYLES.Caution
  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold font-data uppercase tracking-wide"
      style={{ background: s.bg, color: s.color }}
    >
      {severity}
    </span>
  )
}

// ── Insight icon ───────────────────────────────────────
export function InsightIcon({ icon, color, bg }: { icon: string; color: string; bg: string }) {
  const paths: Record<string, React.ReactNode> = {
    'trend-up': (
      <>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
        <polyline points="17 6 23 6 23 12"/>
      </>
    ),
    'alert': (
      <>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </>
    ),
    'minus': <line x1="5" y1="12" x2="19" y2="12"/>,
    'star':  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
  }
  return (
    <div
      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
      style={{ background: bg }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true">
        {paths[icon] ?? paths['minus']}
      </svg>
    </div>
  )
}
