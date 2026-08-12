import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDictionary, type Dictionary } from '../../../../i18n/dictionaries'
import { getLocale } from '../../../../i18n/locale'
import { getProductBySlug, publicPrice } from '../../../../lib/catalogue'
import { getActiveBranches } from '../../../../lib/payload'
import { finishLabel, mediaUrl, relName, usageLabel } from '../../../../lib/format'
import { SITE } from '../../../../lib/site'
import type { Product } from '../../../../payload-types'
import { Container } from '../../../../components/ui/Container'
import { Rich } from '../../../../components/RichText'
import { AddToQuoteButton } from '../../../../components/catalogue/AddToQuoteButton'
import { ArrowRight } from '../../../../components/ui/icons'

function plainDescription(p: Product): string {
  const brand = relName(p.brand)
  const bits: string[] = []
  const finish = finishLabel(p.finish)
  if (finish) bits.push(finish)
  if (p.useTypes?.length) bits.push(p.useTypes.map(usageLabel).join(', '))
  let s = `${brand ? brand + ' ' : ''}${p.name}`
  if (bits.length) s += ` — ${bits.join(' · ')}`
  return `${s}. Sold by Hilty.`
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = await getProductBySlug(slug)
  if (!p) return { title: 'Product' }
  const brand = relName(p.brand)
  const img = mediaUrl(p.image)
  return {
    title: `${p.name}${brand ? ' — ' + brand : ''}`,
    description: plainDescription(p),
    openGraph: img ? { images: [{ url: img }] } : undefined,
  }
}

const stockLabel = (status: string | null | undefined, t: Dictionary): string => {
  switch (status) {
    case 'in_stock':
      return t.product.inStock
    case 'low':
      return t.product.lowStock
    case 'out_of_stock':
      return t.product.outOfStock
    default:
      return t.product.contactBranch
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const locale = await getLocale()
  const t = getDictionary(locale)
  const p = await getProductBySlug(slug)
  if (!p) notFound()

  const brand = relName(p.brand)
  const img = mediaUrl(p.image)
  const price = publicPrice(p)
  const branches = await getActiveBranches(12)
  const tdsUrl = mediaUrl(p.tdsFile) || p.tdsUrl || null

  const waText = encodeURIComponent(
    `${locale === 'sw' ? 'Habari Hilty, naomba kujua upatikanaji wa' : 'Hello Hilty, please advise availability of'}: ${p.name}`,
  )

  // Public per-branch status only when the admin marked it public; else "contact branch".
  const stockByBranch = new Map<number, { status?: string | null; show?: boolean | null }>()
  for (const s of p.stock ?? []) {
    const bid = typeof s.branch === 'object' && s.branch ? s.branch.id : (s.branch as number | null)
    if (typeof bid === 'number') stockByBranch.set(bid, { status: s.status, show: s.showPublicly })
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: plainDescription(p),
    ...(img ? { image: img } : {}),
    ...(brand ? { brand: { '@type': 'Brand', name: brand } } : {}),
    category: relName(p.category) ?? undefined,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Container className="py-8">
        <Link href="/products" className="inline-flex items-center gap-1 text-sm text-muted hover:text-brand-700">
          ← {t.product.backToProducts}
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Image */}
          <div className="overflow-hidden rounded-2xl border border-line bg-brand-50">
            <div className="aspect-[4/3]">
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img} alt={p.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-brand-200" aria-hidden>
                  <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M12 2S5 10.5 5 15a7 7 0 0 0 14 0c0-4.5-7-13-7-13Z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div>
            {brand && <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">{brand}</p>}
            <h1 className="mt-1 text-3xl font-bold tracking-tight">{p.name}</h1>

            <p className="mt-2 text-sm text-muted">
              {t.product.soldBy}
              {brand ? ` · ${t.product.manufacturedBy} ${brand}` : ''}
            </p>

            <div className="mt-4 text-lg">
              {price ? (
                <span className="font-bold">
                  {price.currency} {price.amount.toLocaleString()}
                </span>
              ) : (
                <span className="font-semibold text-brand-700">{t.product.requestPrice}</span>
              )}
            </div>

            {/* Tags */}
            <div className="mt-4 flex flex-wrap gap-2">
              {(p.useTypes ?? []).map((u) => (
                <span key={u} className="rounded bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700">
                  {usageLabel(u)}
                </span>
              ))}
              {finishLabel(p.finish) && (
                <span className="rounded bg-surface-2 px-2 py-1 text-xs font-medium text-muted">{finishLabel(p.finish)}</span>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              <AddToQuoteButton slug={p.slug ?? ''} name={p.name} label={t.product.addToQuote} addedLabel={t.product.added} />
              <Link
                href={`/ai-advisor?product=${p.slug ?? ''}`}
                className="inline-flex items-center gap-2 rounded-lg border border-brand-600 px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
              >
                {t.product.askAi}
              </Link>
              <a
                href={`${SITE.whatsappHref}?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-95"
              >
                {t.product.checkWhatsApp}
              </a>
            </div>

            {p.colourAvailability && <p className="mt-6 text-sm text-muted">{p.colourAvailability}</p>}
          </div>
        </div>

        {/* Overview */}
        {p.description ? (
          <section className="mt-12">
            <h2 className="text-xl font-bold">{t.product.overview}</h2>
            <Rich data={p.description} className="mt-3 text-muted" />
          </section>
        ) : null}

        {/* Technical details */}
        <section className="mt-12">
          <h2 className="text-xl font-bold">{t.product.technical}</h2>
          <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            <Row label={t.product.suitableSurfaces} value={(p.surfaceCompatibility ?? []).map((s) => s.surface).filter(Boolean).join(', ')} />
            <Row label={t.product.classification} value={(p.useTypes ?? []).map(usageLabel).join(', ')} />
            <Row label={t.product.finish} value={finishLabel(p.finish)} />
            <Row
              label={t.product.packSizes}
              value={(p.packSizes ?? []).map((s) => (s.litres ? `${s.litres} ${t.product.litres}` : '')).filter(Boolean).join(', ')}
            />
            <Row label={t.product.coverage} value={p.coveragePerLitre ? `${p.coveragePerLitre} ${t.product.coverageUnit}` : null} />
            <Row label={t.product.coats} value={p.recommendedCoats ? String(p.recommendedCoats) : null} />
            <Row
              label={t.product.dryingTime}
              value={[p.dryingTime?.touchDry && `${t.product.touchDry}: ${p.dryingTime.touchDry}`, p.dryingTime?.recoat && `${t.product.recoat}: ${p.dryingTime.recoat}`]
                .filter(Boolean)
                .join(' · ')}
            />
            <Row label={t.product.primer} value={p.recommendedPrimer} />
            <Row label={t.product.undercoat} value={p.recommendedUndercoat} />
            <Row label={t.product.topcoat} value={p.recommendedTopcoat} />
          </dl>
        </section>

        {/* Surface prep + application + safety */}
        {p.surfacePreparation ? (
          <RichSection title={t.product.surfacePrep} data={p.surfacePreparation} />
        ) : null}
        {p.applicationInstructions ? (
          <RichSection title={t.product.application} data={p.applicationInstructions} />
        ) : null}
        {p.safetyNotes ? <RichSection title={t.product.safety} data={p.safetyNotes} /> : null}

        {/* TDS + source */}
        {(tdsUrl || p.technicalSource) && (
          <section className="mt-12 rounded-xl border border-line bg-surface-2 p-5 text-sm">
            {tdsUrl && (
              <p>
                <span className="font-semibold">{t.product.tds}:</span>{' '}
                <a href={tdsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand-700">
                  {t.product.tdsView} <ArrowRight width={14} height={14} />
                </a>
              </p>
            )}
            <p className={tdsUrl ? 'mt-2' : ''}>
              <span className="font-semibold">{t.product.source}:</span>{' '}
              {p.technicalSource ? p.technicalSource : t.product.sourceNote}
            </p>
            <p className="mt-2 text-xs text-muted">{t.product.brandOwnerNote}</p>
          </section>
        )}

        {/* Branch availability (indicative, not real-time) */}
        <section className="mt-12">
          <h2 className="text-xl font-bold">{t.product.availability}</h2>
          {branches.length > 0 ? (
            <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
              {branches.map((b) => {
                const entry = stockByBranch.get(b.id)
                const label = entry?.show ? stockLabel(entry.status, t) : t.product.contactBranch
                return (
                  <li key={b.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <span className="font-medium">{b.name}</span>
                    <span className="text-muted">{label}</span>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">{t.product.contactBranch}</p>
          )}
          <p className="mt-3 text-xs text-muted">{t.product.contactBranch}.</p>
        </section>
      </Container>
    </>
  )
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  )
}

function RichSection({ title, data }: { title: string; data: unknown }) {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold">{title}</h2>
      <Rich data={data} className="mt-3 text-muted" />
    </section>
  )
}
