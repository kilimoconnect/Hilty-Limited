import Link from 'next/link'
import type { ReactNode } from 'react'

type Variant = 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'whatsapp' | 'light' | 'outlineLight'
type Size = 'sm' | 'md' | 'lg'

const base =
  'group inline-flex items-center justify-center gap-2 rounded-md font-display font-semibold tracking-[-0.005em] transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:cursor-not-allowed disabled:opacity-55'

/**
 * Clay carries every primary action across the site; blue and neutral carry the
 * rest. One bold colour, used in one role, is what keeps the palette premium.
 */
const variants: Record<Variant, string> = {
  primary: 'bg-accent-500 text-white shadow-soft hover:bg-accent-600 hover:shadow-lift active:translate-y-px',
  accent: 'bg-accent-500 text-white shadow-soft hover:bg-accent-600 hover:shadow-lift active:translate-y-px',
  secondary: 'bg-brand-600 text-white hover:bg-brand-700 active:translate-y-px',
  outline: 'border border-line-strong bg-surface text-ink hover:border-brand-600 hover:text-brand-700',
  ghost: 'text-brand-700 hover:bg-brand-50',
  whatsapp: 'bg-whatsapp text-white hover:bg-whatsapp-dark',
  light: 'bg-white text-brand-700 hover:bg-brand-50 active:translate-y-px',
  outlineLight: 'border border-white/30 text-white hover:border-white/60 hover:bg-white/10',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-[0.9375rem]',
  lg: 'h-[3.25rem] px-7 text-base',
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
