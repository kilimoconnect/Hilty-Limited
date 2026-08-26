import type { ReactNode } from 'react'

type Tone = 'surface' | 'inset' | 'dark' | 'outline'

const tones: Record<Tone, string> = {
  surface: 'bg-surface border border-line',
  inset: 'bg-surface-2 border border-line/70',
  dark: 'bg-brand-800 border border-white/10 text-brand-100',
  outline: 'bg-transparent border border-line-strong',
}

/**
 * The one card in the system. Hairline edge, generous padding, and a lift only
 * when it is actually a link — static cards stay flat so the page reads calm.
 */
export function Panel({
  children,
  tone = 'surface',
  className = '',
  interactive = false,
  as: Tag = 'div',
}: {
  children: ReactNode
  tone?: Tone
  className?: string
  interactive?: boolean
  as?: 'div' | 'li' | 'article'
}) {
  return (
    <Tag
      className={`rounded-lg ${tones[tone]} ${
        interactive
          ? 'transition-[border-color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift'
          : ''
      } ${className}`}
    >
      {children}
    </Tag>
  )
}
