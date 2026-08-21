import Link from 'next/link'
import type { Dictionary } from '../../i18n/dictionaries'

/** Reusable "Design My Space" entry point for product/calculator/services/advisor pages. */
export function DesignCta({ dict, variant = 'inline' }: { dict: Dictionary; variant?: 'inline' | 'banner' }) {
  if (variant === 'banner') {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
        <h3 className="font-semibold text-brand-800">{dict.studio.cta}</h3>
        <p className="mt-1 text-sm text-muted">{dict.studio.subtitle}</p>
        <Link href="/design-studio" className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          {dict.studio.cta}
        </Link>
      </div>
    )
  }
  return (
    <Link href="/design-studio" className="inline-flex items-center gap-2 rounded-lg border border-brand-600 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">
      🎨 {dict.studio.cta}
    </Link>
  )
}
