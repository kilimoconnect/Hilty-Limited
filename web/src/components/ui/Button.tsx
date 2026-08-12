import Link from 'next/link'
import type { ReactNode } from 'react'

type Variant = 'primary' | 'accent' | 'outline' | 'ghost' | 'whatsapp' | 'light' | 'outlineLight'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60'

const variants: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700',
  accent: 'bg-accent-500 text-ink hover:bg-accent-600',
  outline: 'border border-brand-600 text-brand-700 hover:bg-brand-50',
  ghost: 'text-brand-700 hover:bg-brand-50',
  whatsapp: 'bg-[#25D366] text-white hover:brightness-95',
  light: 'bg-white text-brand-700 hover:bg-brand-50',
  outlineLight: 'border border-white/70 text-white hover:bg-white/10',
}

const sizes: Record<Size, string> = {
  sm: 'text-sm px-3 py-2',
  md: 'text-sm px-4 py-2.5',
  lg: 'text-base px-5 py-3',
}

type Props = {
  href?: string
  children: ReactNode
  variant?: Variant
  size?: Size
  className?: string
  external?: boolean
  'aria-label'?: string
}

export function Button({ href, children, variant = 'primary', size = 'md', className = '', external, ...rest }: Props) {
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`
  if (href) {
    if (external) {
      return (
        <a href={href} className={cls} target="_blank" rel="noopener noreferrer" {...rest}>
          {children}
        </a>
      )
    }
    return (
      <Link href={href} className={cls} {...rest}>
        {children}
      </Link>
    )
  }
  return (
    <span className={cls} {...rest}>
      {children}
    </span>
  )
}
