import Link from 'next/link'
import type { Dictionary } from '../../i18n/dictionaries'
import { ArrowRight, PaletteIcon } from '../ui/icons'

/** Reusable "Design My Space" entry point for product/calculator/services/advisor pages. */
export function DesignCta({ dict, variant = 'inline' }: { dict: Dictionary; variant?: 'inline' | 'banner' }) {
  if (variant === 'banner') {
    return (
      <div className="flex flex-col gap-6 rounded-lg bg-brand-800 p-7 text-white sm:flex-row sm:items-center sm:justify-between sm:p-9">
        <div className="flex items-start gap-5">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-accent-500 text-white">
            <PaletteIcon width={22} height={22} />
          </span>
          <div>
            <h3 className="font-display text-h3 font-semibold text-white">{dict.studio.title}</h3>
            <p className="mt-2 max-w-lg text-[0.9375rem] leading-relaxed text-brand-100/80">{dict.studio.subtitle}</p>
          </div>
        </div>
        <Link
          href="/design-studio"
          className="group inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-white px-5 font-display text-[0.9375rem] font-semibold text-brand-800 transition-colors hover:bg-brand-50"
        >
          {dict.studio.cta}
          <ArrowRight width={16} height={16} className="transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    )
  }
  return (
    <Link
      href="/design-studio"
      className="group inline-flex h-11 items-center gap-2 rounded-md border border-line-strong bg-surface px-5 font-display text-[0.9375rem] font-semibold transition-colors hover:border-brand-600 hover:text-brand-700"
    >
      <PaletteIcon width={18} height={18} className="text-accent-500" />
      {dict.studio.cta}
      <ArrowRight width={16} height={16} className="transition-transform duration-200 group-hover:translate-x-1" />
    </Link>
  )
}
