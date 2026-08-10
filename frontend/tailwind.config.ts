import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Base
        background: '#0F172A',        // deep navy (hero + doctor)
        surface: '#1E293B',
        border: '#334155',
        
        // Patient warm palette
        'patient-bg': '#FAFAF9',
        'patient-surface': '#FFFFFF',
        'patient-border': '#E7E5E4',
        
        // Primary
        primary: '#1D4ED8',
        'primary-hover': '#1E40AF',
        'primary-light': '#EFF6FF',
        
        // Doctor accent
        'doctor-accent': '#38BDF8',
        
        // Patient accent
        'patient-accent': '#0D9488',
        
        // Text
        'text-primary': '#F1F5F9',
        'text-muted': '#94A3B8',
        'text-dark': '#0F172A',
        'text-dark-muted': '#64748B',
        
        // Severity
        severe: '#DC2626',
        'severe-soft': '#F87171',
        'severe-bg': '#450A0A',
        moderate: '#D97706',
        'moderate-soft': '#FBBF24',
        'moderate-bg': '#451A03',
        mild: '#16A34A',
        'mild-soft': '#4ADE80',
        'mild-bg': '#052E16',
        
        // States
        verified: '#0D9488',
        'verified-bg': '#042F2E',
        'second-opinion': '#4F46E5',
        'ai-badge': '#334155',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        hero: ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'hero-sub': ['1.25rem', { lineHeight: '1.6' }],
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
