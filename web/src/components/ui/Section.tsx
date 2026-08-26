import type { ReactNode } from 'react'
import { Container } from './Container'

type Tone = 'default' | 'alt' | 'dark' | 'deep'

const tones: Record<Tone, string> = {
  default: 'bg-surface text-ink',
  alt: 'bg-surface-2 text-ink',
  dark: 'bg-brand-800 text-brand-100',
  deep: 'bg-brand-900 text-brand-100',
}

export function Section({
  children,
  alt = false,
  tone,
  className = '',
  id,
  bleed = false,
  padded = true,
}: {
  children: ReactNode
  /** @deprecated use tone="alt" */
  alt?: boolean
  tone?: Tone
  className?: string
  id?: string
  /** Skip the container — the section lays out its own full-width content. */
  bleed?: boolean
  /** Turn off the standard vertical rhythm for sections that set their own. */
  padded?: boolean
}) {
  const resolved: Tone = tone ?? (alt ? 'alt' : 'default')
  return (
    <section
      id={id}
      className={`${padded ? 'py-16 sm:py-20 lg:py-28' : ''} ${tones[resolved]} ${className}`}
    >
      {bleed ? children : <Container>{children}</Container>}
    </section>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
  tone = 'dark',
  className = '',
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  action?: ReactNode
  /** 'dark' = dark type on a light ground; 'light' = light type on a dark ground. */
  tone?: 'dark' | 'light'
  className?: string
}) {
  const light = tone === 'light'
  return (
    <div className={`mb-10 flex flex-col gap-6 sm:mb-14 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div className="max-w-2xl">
        {eyebrow && <p className={`eyebrow ${light ? 'eyebrow-light' : ''}`}>{eyebrow}</p>}
        <h2 className={`${eyebrow ? 'mt-4' : ''} text-h2 ${light ? 'text-white' : 'text-ink'}`}>{title}</h2>
        {subtitle && (
          <p className={`mt-4 text-lead ${light ? 'text-brand-100/85' : 'text-muted'}`}>{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
