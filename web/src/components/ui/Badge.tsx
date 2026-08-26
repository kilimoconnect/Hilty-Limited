import type { ReactNode } from 'react'

type Tone = 'neutral' | 'brand' | 'accent' | 'success' | 'warning' | 'light'

const tones: Record<Tone, string> = {
  neutral: 'bg-surface-3 text-ink-soft',
  brand: 'bg-brand-50 text-brand-700',
  accent: 'bg-accent-50 text-accent-600',
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  light: 'bg-white/10 text-white ring-1 ring-inset ring-white/20',
}

export function Badge({ children, tone = 'neutral', className = '' }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-1 font-display text-[0.6875rem] font-semibold uppercase tracking-[0.08em] ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
