import type { Metadata } from 'next'
import { getDictionary } from '../../../i18n/dictionaries'
import { getLocale } from '../../../i18n/locale'
import { SITE } from '../../../lib/site'
import { Button } from '../../../components/ui/Button'
import { Container } from '../../../components/ui/Container'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Panel } from '../../../components/ui/Panel'
import { Badge } from '../../../components/ui/Badge'
import { CheckIcon, WhatsAppIcon } from '../../../components/ui/icons'

const marketImages = Array.from({ length: 8 }, (_, i) => `/photos/kibaba-market-${i + 1}.webp`)

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getLocale())
  return {
    title: t.pages.kibaba.title,
    description: t.pages.kibaba.subtitle,
    openGraph: { images: [{ url: '/brand/kibaba-pouch.webp' }] },
  }
}

export default async function KibabaPage() {
  const locale = await getLocale()
  const t = getDictionary(locale)
  const k = t.pages.kibaba

  const wa = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
    locale === 'sw'
      ? 'Habari Hilty, naomba kujua kuhusu Mafuta ya Kupikia Kibaba.'
      : 'Hello Hilty, I would like to enquire about Kibaba Cooking Oil.',
  )}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Kibaba Cooking Oil',
    description: k.subtitle,
    image: ['/brand/kibaba-pouch.webp', '/brand/kibaba-box.webp'],
    brand: { '@type': 'Brand', name: 'Kibaba' },
    manufacturer: { '@type': 'Organization', name: 'Hilty Limited' },
    category: 'Cooking oil',
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageHeader
        eyebrow={k.eyebrow}
        title={k.title}
        lead={k.subtitle}
        breadcrumb={[
          { label: t.nav.home, href: '/' },
          { label: t.nav.about, href: '/about' },
          { label: k.title, href: '/kibaba-cooking-oil' },
        ]}
        actions={
          <>
            <Button href={wa} external variant="whatsapp">
              <WhatsAppIcon width={16} height={16} /> {k.ctaWhatsapp}
            </Button>
            <Button href="/request-quotation" variant="outline">
              {k.ctaContact}
            </Button>
          </>
        }
      />

      {/* Images + highlights */}
      <Container className="py-14 lg:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-5 lg:sticky lg:top-32 lg:self-start">
            <div className="overflow-hidden rounded-xl border border-line bg-surface-2 p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/kibaba-pouch.webp"
                alt={k.pouchAlt}
                className="mx-auto aspect-[3/4] w-full max-w-xs object-contain"
              />
            </div>
            <div className="overflow-hidden rounded-xl border border-line bg-surface-2 p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/kibaba-box.webp"
                alt={k.boxAlt}
                className="mx-auto aspect-[3/2] w-full object-contain"
              />
            </div>
          </div>

          <div>
            <h2 className="font-display text-h2 font-semibold">{k.highlightsTitle}</h2>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge tone="accent">100% Palm Oil</Badge>
              <Badge tone="success">Cholesterol-free</Badge>
              <Badge tone="brand">Vitamin E &amp; K</Badge>
            </div>
            <dl className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {k.highlights.map((h) => (
                <div key={h.title}>
                  <dt className="font-display text-[1.0625rem] font-semibold">{h.title}</dt>
                  <dd className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted">{h.body}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 border-t border-line pt-8">
              <h3 className="font-display text-[1.0625rem] font-semibold">{k.usesTitle}</h3>
              <ul className="mt-4 flex flex-wrap gap-2.5">
                {k.uses.map((u) => (
                  <li
                    key={u}
                    className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3.5 py-2 text-[0.9375rem] font-medium text-ink-soft"
                  >
                    <CheckIcon width={16} height={16} className="text-brand-500" /> {u}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>

      {/* Product details */}
      <div className="border-y border-line bg-surface-2">
        <Container className="py-14 lg:py-20">
          <h2 className="font-display text-h2 font-semibold">{k.specsTitle}</h2>
          <dl className="mt-8 grid grid-cols-1 gap-x-16 lg:grid-cols-2">
            {k.specs.map((s) => (
              <div key={s.label} className="grid grid-cols-3 gap-4 border-b border-line py-4">
                <dt className="font-display text-[0.8125rem] font-semibold uppercase tracking-[0.06em] text-muted">
                  {s.label}
                </dt>
                <dd className="col-span-2 text-[0.9375rem] text-ink-soft">{s.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </div>

      {/* In the market */}
      <Container className="py-14 lg:py-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-h2 font-semibold">{k.galleryTitle}</h2>
          <p className="mt-4 text-lead leading-relaxed text-muted">{k.galleryLead}</p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {marketImages.map((src) => (
            <div key={src} className="aspect-[3/4] overflow-hidden rounded-lg border border-line bg-surface-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={k.galleryAlt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </Container>

      {/* CTA */}
      <div className="border-t border-line">
        <Container className="py-14 lg:py-20">
          <Panel tone="dark" className="p-8 text-center sm:p-12">
          <h2 className="font-display text-h2 font-semibold text-white">{k.ctaTitle}</h2>
          <p className="mx-auto mt-4 max-w-xl text-lead leading-relaxed text-brand-100/85">{k.ctaBody}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href={wa} external variant="whatsapp">
              <WhatsAppIcon width={16} height={16} /> {k.ctaWhatsapp}
            </Button>
            <Button href="/request-quotation" variant="outline">
              {k.ctaContact}
            </Button>
          </div>
        </Panel>
        </Container>
      </div>
    </>
  )
}
