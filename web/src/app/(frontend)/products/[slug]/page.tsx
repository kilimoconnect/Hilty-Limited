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
import { Badge } from '../../../../components/ui/Badge'
import { Panel } from '../../../../components/ui/Panel'
import { Rich } from '../../../../components/RichText'
import { AddToQuoteButton } from '../../../../components/catalogue/AddToQuoteButton'
import { DesignCta } from '../../../../components/design/DesignCta'
import { TrackEvent } from '../../../../components/TrackEvent'
import { ArrowRight, ChevronRight, WhatsAppIcon } from '../../../../components/ui/icons'

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

const stockTone = (status: string | null | undefined): 'success' | 'warning' | 'neutral' => {
  if (status === 'in_stock') return 'success'
  if (status === 'low') return 'warning'
  return 'neutral'
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

  const specs: { label: string; value?: string | null }[] = [
    { label: t.product.suitableSurfaces, value: (p.surfaceCompatibility ?? []).map((s) => s.surface).filter(Boolean).join(', ') },
    { label: t.product.classification, value: (p.useTypes ?? []).map(usageLabel).join(', ') },
    { label: t.product.finish, value: finishLabel(p.finish) },
    {
      label: t.product.packSizes,
      value: (p.packSizes ?? []).map((s) => (s.litres ? `${s.litres} ${t.product.litres}` : '')).filter(Boolean).join(', '),
    },
    { label: t.product.coverage, value: p.coveragePerLitre ? `${p.coveragePerLitre} ${t.product.coverageUnit}` : null },
    { label: t.product.coats, value: p.recommendedCoats ? String(p.recommendedCoats) : null },
    {
      label: t.product.dryingTime,
      value: [
        p.dryingTime?.touchDry && `${t.product.touchDry}: ${p.dryingTime.touchDry}`,
        p.dryingTime?.recoat && `${t.product.recoat}: ${p.dryingTime.recoat}`,
      ]
        .filter(Boolean)
        .join(' · '),
    },
    { label: t.product.primer, value: p.recommendedPrimer },
    { label: t.product.undercoat, value: p.recommendedUndercoat },
    { label: t.product.topcoat, value: p.recommendedTopcoat },
  ].filter((s) => Boolean(s.value))

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="border-b border-line bg-surface-2">
        <Container className="py-4">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
              <li>
                <Link href="/" className="link-quiet hover:text-brand-700">
                  {t.nav.home}
                </Link>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight width={14} height={14} className="text-line-strong" />
                <Link href="/products" className="link-quiet hover:text-brand-700">
                  {t.product.backToProducts}
                </Link>
              </li>
            </ol>
          </nav>
        </Container>
      </div>

      <Container className="py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Image */}
          <div className="overflow-hidden rounded-lg border border-line bg-surface-3 lg:sticky lg:top-32 lg:self-start">
            <div className="aspect-[4/3]">
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img} alt={p.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-brand-200" aria-hidden>
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <rect x="5" y="8.5" width="14" height="11.5" rx="1.5" />
                    <path d="M8 8.5V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2.5M5 12.5h14" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div>
            {brand && (
              <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.14em] text-brand-500">
                {brand}
              </p>
            )}
            <h1 className="mt-4 text-h1">{p.name}</h1>
            <p className="mt-3 text-[0.9375rem] text-muted">
              {t.product.soldBy}
              {brand ? ` · ${t.product.manufacturedBy} ${brand}` : ''}
            </p>

            {((p.useTypes ?? []).length > 0 || finishLabel(p.finish)) && (
              <div className="mt-6 flex flex-wrap gap-2">
                {(p.useTypes ?? []).map((u) => (
                  <Badge key={u} tone="brand">
                    {usageLabel(u)}
                  </Badge>
                ))}
                {finishLabel(p.finish) && <Badge tone="neutral">{finishLabel(p.finish)}</Badge>}
              </div>
            )}

            <Panel tone="inset" className="mt-8 p-6">
              <div className="text-2xl">
                {price ? (
                  <span className="tabular font-display font-bold">
                    {price.currency} {price.amount.toLocaleString()}
                  </span>
                ) : (
                  <span className="font-display text-h3 font-semibold text-brand-700">{t.product.requestPrice}</span>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <AddToQuoteButton slug={p.slug ?? ''} name={p.name} label={t.product.addToQuote} addedLabel={t.product.added} />
                <Link
                  href={`/ai-advisor?product=${p.slug ?? ''}`}
                  className="inline-flex h-11 items-center justify-center rounded-md border border-line-strong bg-surface px-5 font-display text-[0.9375rem] font-semibold transition-colors hover:border-brand-600 hover:text-brand-700"
                >
                  {t.product.askAi}
                </Link>
                <a
                  href={`${SITE.whatsappHref}?text=${waText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-whatsapp px-5 font-display text-[0.9375rem] font-semibold text-white transition-colors hover:bg-whatsapp-dark"
                >
                  <WhatsAppIcon width={17} height={17} />
                  {t.product.checkWhatsApp}
                </a>
              </div>
            </Panel>

            {p.colourAvailability && <p className="mt-6 text-[0.9375rem] leading-relaxed text-muted">{p.colourAvailability}</p>}
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-16 lg:grid-cols-12">
          <div className="space-y-14 lg:col-span-7">
            {p.description ? (
              <section>
                <h2 className="text-h2">{t.product.overview}</h2>
                <Rich data={p.description} className="prose-hilty mt-5" />
              </section>
            ) : null}

            {specs.length > 0 && (
              <section>
                <h2 className="text-h2">{t.product.technical}</h2>
                <dl className="mt-6 divide-y divide-line border-y border-line text-[0.9375rem]">
                  {specs.map((s) => (
                    <div key={s.label} className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-3 sm:gap-4">
                      <dt className="font-display text-[0.8125rem] font-semibold uppercase tracking-[0.06em] text-muted">
                        {s.label}
                      </dt>
                      <dd className="tabular text-ink-soft sm:col-span-2">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {p.surfacePreparation ? <RichSection title={t.product.surfacePrep} data={p.surfacePreparation} /> : null}
            {p.applicationInstructions ? <RichSection title={t.product.application} data={p.applicationInstructions} /> : null}
            {p.safetyNotes ? <RichSection title={t.product.safety} data={p.safetyNotes} /> : null}
          </div>

          <div className="lg:col-span-5">
            <div className="space-y-6 lg:sticky lg:top-32">
              {/* Branch availability (indicative, not real-time) */}
              <Panel className="p-6 sm:p-7">
                <h2 className="font-display text-h3 font-semibold">{t.product.availability}</h2>
                {branches.length > 0 ? (
                  <ul className="mt-5 divide-y divide-line border-t border-line text-[0.9375rem]">
                    {branches.map((b) => {
                      const entry = stockByBranch.get(b.id)
                      const shown = Boolean(entry?.show)
                      return (
                        <li key={b.id} className="flex items-center justify-between gap-3 py-3">
                          <span className="font-medium">{b.name}</span>
                          <Badge tone={shown ? stockTone(entry?.status) : 'neutral'}>
                            {shown ? stockLabel(entry?.status, t) : t.product.contactBranch}
                          </Badge>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p className="mt-3 text-[0.9375rem] text-muted">{t.product.contactBranch}</p>
                )}
              </Panel>

              {(tdsUrl || p.technicalSource) && (
                <Panel tone="inset" className="p-6 text-[0.9375rem] sm:p-7">
                  {tdsUrl && (
                    <p>
                      <span className="font-display font-semibold">{t.product.tds}:</span>{' '}
                      <a
                        href={tdsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-quiet inline-flex items-center gap-1 font-semibold text-brand-600"
                      >
                        {t.product.tdsView} <ArrowRight width={14} height={14} />
                      </a>
                    </p>
                  )}
                  <p className={tdsUrl ? 'mt-3' : ''}>
                    <span className="font-display font-semibold">{t.product.source}:</span>{' '}
                    {p.technicalSource ? p.technicalSource : t.product.sourceNote}
                  </p>
                  <p className="mt-3 text-[0.8125rem] leading-relaxed text-muted">{t.product.brandOwnerNote}</p>
                </Panel>
              )}
            </div>
          </div>
        </div>

        <div className="mt-16">
          <DesignCta dict={t} variant="banner" />
        </div>
        <TrackEvent type="product_viewed" eventRef={p.slug ?? String(p.id)} />
      </Container>
    </>
  )
}

function RichSection({ title, data }: { title: string; data: unknown }) {
  return (
    <section>
      <h2 className="text-h2">{title}</h2>
      <Rich data={data} className="prose-hilty mt-5" />
    </section>
  )
}
