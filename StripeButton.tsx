'use client'

import { useState } from 'react'

interface StripeButtonProps {
  label:    string
  endpoint: string
  body?:    Record<string, string>
  variant?: 'primary' | 'outline'
}

export function StripeButton({ label, endpoint, body, variant = 'primary' }: StripeButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch(endpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    body ? JSON.stringify(body) : undefined,
      })
      const json = await res.json() as { data: { url?: string } | null; error: string | null }

      if (!res.ok || json.error) {
        setError(json.error ?? 'Something went wrong. Please try again.')
        return
      }

      if (json.data?.url) {
        window.location.href = json.data.url
      }
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const isPrimary = variant === 'primary'

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={isPrimary
          ? { background: 'var(--sapphire)', color: '#fff', boxShadow: '0 2px 12px rgba(61,111,232,.3)' }
          : { background: 'transparent', color: 'var(--silver)', border: '1px solid var(--line-2)' }
        }
      >
        {loading && (
          <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        )}
        {loading ? 'Redirecting…' : label}
      </button>
      {error && (
        <p className="text-[12px] mt-2" style={{ color: 'var(--critical)' }}>{error}</p>
      )}
    </div>
  )
}
