import Link from 'next/link'
import type { Dictionary } from '../../i18n/dictionaries'
import type { Product } from '../../payload-types'
import { publicPrice } from '../../lib/catalogue'
import { finishLabel, mediaUrl, relName, usageLabel } from '../../lib/format'
import { Badge } from '../ui/Badge'
import { ArrowRight } from '../ui/icons'

export function ProductCard({ product, t }: { product: Product; t: Dictionary }) {
  const img = mediaUrl(product.image)
  const brand = relName(product.brand)
  const price = publicPrice(product)
  const finish = finishLabel(product.finish)

  return (
    <Link
      href={`/products/${product.slug ?? ''}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface transition-[border-color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift"
    >
      <div className="aspect-[4/3] overflow-hidden bg-surface-3">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-200" aria-hidden>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
              <rect x="5" y="8.5" width="14" height="11.5" rx="1.5" />
              <path d="M8 8.5V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2.5M5 12.5h14" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {brand && (
          <p className="font-display text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-brand-500">
            {brand}
          </p>
        )}
        <h3 className="mt-1.5 font-display text-h3 font-semibold leading-snug">{product.name}</h3>

        {((product.useTypes ?? []).length > 0 || finish) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(product.useTypes ?? []).map((u) => (
              <Badge key={u} tone="brand">
                {usageLabel(u)}
              </Badge>
            ))}
            {finish && <Badge tone="neutral">{finish}</Badge>}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-4 text-sm">
          {price ? (
            <span className="tabular font-display text-base font-bold text-ink">
              {price.currency} {price.amount.toLocaleString()}
            </span>
          ) : (
            <span className="font-medium text-muted">{t.catalogue.requestPrice}</span>
          )}
          <ArrowRight
            width={17}
            height={17}
            className="shrink-0 text-brand-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-brand-600"
          />
        </div>
      </div>
    </Link>
  )
}
