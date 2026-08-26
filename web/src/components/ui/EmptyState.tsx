import type { ReactNode } from 'react'

/**
 * Shown wherever the CMS has nothing to show yet. It says what is missing and
 * offers the next useful step, rather than leaving a blank stretch of page.
 */
export function EmptyState({
  title,
  body,
  icon,
  action,
  className = '',
}: {
  title: string
  body?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-lg border border-line bg-surface-2 px-6 py-14 text-center ${className}`}>
      {icon && (
        <span className="mx-auto mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-surface text-brand-500 shadow-soft">
          {icon}
        </span>
      )}
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      {body && <p className="mx-auto mt-2 max-w-md text-muted">{body}</p>}
      {action && <div className="mt-7 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  )
}
