import type { ReactNode } from 'react'
import Link from 'next/link'
import { Container } from './Container'
import { ChevronRight } from './icons'

const RAIL = ['#D9C4A9', '#A9BFCB', '#9B4A3A', '#2F5D63', '#8C8577']

/**
 * Masthead for every page below the homepage. The homepage carries the one dark
 * hero on the site; inner pages open light and calm so the content leads.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  actions,
  breadcrumb,
  children,
}: {
  eyebrow?: string
  title: string
  lead?: string
  actions?: ReactNode
  breadcrumb?: { label: string; href: string }[]
  children?: ReactNode
}) {
  return (
    <header className="relative overflow-hidden border-b border-line bg-surface-2">
      {/* Colour rail — the same chip device the homepage hero uses, at the page edge. */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 hidden w-24 flex-col lg:flex">
        {RAIL.map((tone) => (
          <span key={tone} className="flex-1" style={{ backgroundColor: tone, opacity: 0.9 }} />
        ))}
      </div>

      <Container className="relative py-12 sm:py-16 lg:py-20">
        <div className="max-w-3xl">
          {breadcrumb && breadcrumb.length > 0 && (
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
                {breadcrumb.map((crumb, i) => (
                  <li key={crumb.href} className="flex items-center gap-1.5">
                    {i > 0 && <ChevronRight width={14} height={14} className="text-line-strong" />}
                    <Link href={crumb.href} className="link-quiet hover:text-brand-700">
                      {crumb.label}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className={`${eyebrow ? 'mt-4' : ''} text-h1`}>{title}</h1>
          {lead && <p className="mt-5 max-w-2xl text-lead text-muted">{lead}</p>}
          {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
          {children}
        </div>
      </Container>
    </header>
  )
}
