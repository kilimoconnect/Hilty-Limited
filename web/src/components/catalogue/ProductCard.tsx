import Link from 'next/link'
import type { Dictionary } from '../../i18n/dictionaries'
import type { Product } from '../../payload-types'
import { publicPrice } from '../../lib/catalogue'
import { finishLabel, mediaUrl, relName, usageLabel } from '../../lib/format'

export function ProductCard({ product, t }: { product: Product; t: Dictionary }) {
  const img = mediaUrl(product.image)
  const brand = relName(product.brand)
  const price = publicPrice(product)
  const finish = finishLabel(product.finish)

  return (
    <Link
      href={`/products/${product.slug ?? ''}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface transition hover:border-brand-300 hover:shadow-sm"
    >
      <div className="aspect-[4/3] bg-brand-50">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-200" aria-hidden>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2S5 10.5 5 15a7 7 0 0 0 14 0c0-4.5-7-13-7-13Z" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        {brand && <p className="text-xs font-medium uppercase tracking-wide text-brand-600">{brand}</p>}
        <h3 className="mt-0.5 font-semibold leading-snug">{product.name}</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(product.useTypes ?? []).map((u) => (
            <span key={u} className="rounded bg-brand-50 px-1.5 py-0.5 text-[11px] font-medium text-brand-700">
              {usageLabel(u)}
            </span>
          ))}
          {finish && (
            <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[11px] font-medium text-muted">{finish}</span>
          )}
        </div>
        <div className="mt-auto pt-3 text-sm">
          {price ? (
            <span className="font-semibold">
              {price.currency} {price.amount.toLocaleString()}
            </span>
          ) : (
            <span className="text-brand-700">{t.catalogue.requestPrice}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
