import type { ReactNode } from 'react'

const widths = {
  narrow: 'max-w-3xl',
  content: 'max-w-5xl',
  default: 'max-w-[78rem]',
} as const

export function Container({
  children,
  className = '',
  width = 'default',
}: {
  children: ReactNode
  className?: string
  width?: keyof typeof widths
}) {
  return <div className={`mx-auto w-full ${widths[width]} px-5 sm:px-8 lg:px-10 ${className}`}>{children}</div>
}
