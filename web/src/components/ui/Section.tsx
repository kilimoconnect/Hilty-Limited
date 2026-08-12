import type { ReactNode } from 'react'
import { Container } from './Container'

export function Section({
  children,
  alt = false,
  className = '',
  id,
}: {
  children: ReactNode
  alt?: boolean
  className?: string
  id?: string
}) {
  return (
    <section id={id} className={`py-12 sm:py-16 ${alt ? 'bg-surface-2' : 'bg-surface'} ${className}`}>
      <Container>{children}</Container>
    </section>
  )
}

export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8 max-w-2xl">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
    </div>
  )
}
