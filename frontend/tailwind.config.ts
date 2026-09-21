import type { Config } from 'tailwindcss'

/**
 * One neutral family (green-tinted) and one accent (muted teal).
 * Token names are unchanged so existing dashboard/case pages pick up the
 * new palette without edits.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dark base (landing + doctor)
        background: '#0B1113',
        surface: '#121A1D',
        'surface-raised': '#182226',
        border: '#25333A',

        // Light base (patient)
        'patient-bg': '#F6F8F7',
        'patient-surface': '#FFFFFF',
        'patient-border': '#E1E7E5',

        // Single accent
        primary: '#1F7A72',
        'primary-hover': '#186660',
        'primary-light': '#E8F1EF',
        'doctor-accent': '#6FB5AC',
        'patient-accent': '#1F7A72',

        // Text
        'text-primary': '#EAF0EE',
        'text-muted': '#8A9A9C',
        'text-dark': '#14201F',
        'text-dark-muted': '#5B6B69',

        // Severity (semantic, desaturated)
        severe: '#C24545',
        'severe-soft': '#E58A85',
        'severe-bg': '#2A1214',
        moderate: '#B8791F',
        'moderate-soft': '#E0B25C',
        'moderate-bg': '#2A1D0B',
        mild: '#3F8F5B',
        'mild-soft': '#7CC79A',
        'mild-bg': '#0E2418',

        // States
        verified: '#5FB3A8',
        'verified-bg': '#0F2624',
        'second-opinion': '#6B7FA8',
        'ai-badge': '#25333A',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        hero: ['clamp(2.75rem, 6.2vw, 5.25rem)', { lineHeight: '1.02', letterSpacing: '-0.035em', fontWeight: '600' }],
        'hero-sub': ['1.125rem', { lineHeight: '1.65' }],
      },
      boxShadow: {
        // Tinted to the background hue, not neutral black
        card: '0 1px 0 0 rgba(234,240,238,0.04) inset, 0 12px 32px -12px rgba(2,10,10,0.7)',
        'card-light': '0 1px 2px rgba(20,32,31,0.04), 0 8px 24px -12px rgba(20,60,55,0.18)',
        scan: '0 0 24px rgba(111,181,172,0.35)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      animation: {
        'scan-line': 'scanLine 3s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        scanLine: {
          '0%': { top: '0%', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { top: '100%', opacity: '0' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
