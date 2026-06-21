import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // ── LisanIQ Design System ──────────────────────────────────
      colors: {
        // Base surfaces — deep executive navy
        surface: {
          0: '#070b14',
          1: '#0c1120',
          2: '#111827',
          3: '#161e30',
          4: '#1c2640',
        },
        // Borders
        line: {
          1: '#1a2540',
          2: '#243050',
          3: '#2e3d62',
        },
        // Brand palette
        sapphire: {
          DEFAULT: '#3d6fe8',
          dim: '#2a52b8',
          glow: 'rgba(61,111,232,0.15)',
        },
        gold: {
          DEFAULT: '#c9a84c',
          dim: 'rgba(201,168,76,0.12)',
        },
        platinum: '#e8edf5',
        silver:   '#8899b8',
        slate:    '#4a5878',
        // Semantic signals
        positive: {
          DEFAULT: '#1fbb8a',
          bg: 'rgba(31,187,138,0.08)',
        },
        caution: {
          DEFAULT: '#d4922a',
          bg: 'rgba(212,146,42,0.08)',
        },
        critical: {
          DEFAULT: '#dc4b4b',
          bg: 'rgba(220,75,75,0.08)',
        },
        info: {
          DEFAULT: '#4d8ef0',
          bg: 'rgba(77,142,240,0.08)',
        },
      },
      fontFamily: {
        display: ['DM Serif Display', 'Georgia', 'serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        data:    ['IBM Plex Mono', 'Courier New', 'monospace'],
      },
      borderRadius: {
        xs:  '4px',
        sm:  '8px',
        md:  '12px',
        lg:  '18px',
        xl:  '24px',
        '2xl': '32px',
      },
      boxShadow: {
        sm:  '0 1px 6px rgba(0,0,0,0.35)',
        md:  '0 4px 20px rgba(0,0,0,0.45)',
        lg:  '0 8px 40px rgba(0,0,0,0.55)',
        sap: '0 0 0 1px rgba(61,111,232,0.25), 0 4px 24px rgba(61,111,232,0.12)',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both',
        spin:      'spin 0.8s linear infinite',
        pulse:     'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
    },
  },
  plugins: [animate],
}

export default config
