import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDictionary } from '../../../../i18n/dictionaries'
import { getLocale } from '../../../../i18n/locale'
import { getBranchBySlug } from '../../../../lib/payload'
import { SITE } from '../../../../lib/site'
import { relName } from '../../../../lib/format'
import { Button } from '../../../../components/ui/Button'
import { Container } from '../../../../components/ui/Container'
import { PageHeader } from '../../../../components/ui/PageHeader'
import { Panel } from '../../../../components/ui/Panel'
import { ArrowRight, PhoneIcon, PinIcon, WhatsAppIcon } from '../../../../components/ui/icons'
import { JsonLd } from '../../../../components/JsonLd'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const b = await getBranchBySlug(slug)
  if (!b) return { title: 'Branch' }
  return { title: `${b.name}`, description: b.fullAddress || `Hilty branch: ${b.name}` }
}

export default async function BranchDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const t = getDictionary(await getLocale())
  const b = await getBranchBySlug(slug)
  if (!b) notFound()

  const mapQuery =
    b.mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.fullAddress || b.name)}`
  const wa = b.whatsapp?.replace(/\D/g, '') || SITE.whatsapp
  const services = (b.servicesAvailable ?? [])
    .map((s) => ({ name: relName(s), slug: typeof s === 'object' && s ? s.slug : null }))
    .filter((s) => s.name)

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Store',
          name: `Hilty — ${b.name}`,
          parentOrganization: { '@type': 'Organization', name: 'Hilty Paint & Coatings Centre' },
          ...(b.phone ? { telephone: b.phone } : {}),
          ...(b.fullAddress ? { address: { '@type': 'PostalAddress', streetAddress: b.fullAddress, addressCountry: 'TZ', ...(b.region ? { addressRegion: b.region } : {}) } } : {}),
          ...(b.coordinates?.lat && b.coordinates?.lng ? { geo: { '@type': 'GeoCoordinates', latitude: b.coordinates.lat, longitude: b.coordinates.lng } } : {}),
          ...(Array.isArray(b.operatingHours) && b.operatingHours.length
            ? { openingHours: b.operatingHours.filter((h) => !h.closed && h.open && h.close).map((h) => `${(h.day || '').slice(0, 2)} ${h.open}-${h.close}`) }
            : {}),
        }}
      />

      <PageHeader
        eyebrow={t.home.branchesEyebrow}
        title={b.name}
        lead={b.fullAddress || undefined}
        breadcrumb={[
          { label: t.nav.home, href: '/' },
          { label: t.pages.branches.title, href: '/branches' },
        ]}
        actions={
          <>
            {b.phone && (
              <Button href={`tel:${b.phone.replace(/\s/g, '')}`} external>
                <PhoneIcon width={16} height={16} /> {t.pages.branches.call}
              </Button>
            )}
            <Button href={`https://wa.me/${wa}`} external variant="whatsapp">
              <WhatsAppIcon width={16} height={16} /> {t.pages.branches.whatsapp}
            </Button>
            <Button href={mapQuery} external variant="outline">
              <PinIcon width={16} height={16} /> {t.pages.branches.directions}
            </Button>
          </>
        }
      />

      <Container className="py-14 lg:py-20">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Panel className="p-6 sm:p-8">
            <h2 className="font-display text-h3 font-semibold">{t.pages.branches.hours}</h2>
            {b.operatingHours && b.operatingHours.length > 0 ? (
              <ul className="mt-5 divide-y divide-line border-t border-line text-[0.9375rem]">
                {b.operatingHours.map((h, i) => (
                  <li key={i} className="flex items-center justify-between py-3">
                    <span className="font-medium capitalize">{h.day}</span>
                    <span className={`tabular ${h.closed ? 'text-muted' : 'text-ink-soft'}`}>
                      {h.closed ? t.pages.branches.closed : `${h.open ?? ''}–${h.close ?? ''}`}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-[0.9375rem] text-muted">—</p>
            )}
          </Panel>

          <Panel className="p-6 sm:p-8">
            <h2 className="font-display text-h3 font-semibold">{t.pages.branches.services}</h2>
            {services.length > 0 ? (
              <ul className="mt-5 divide-y divide-line border-t border-line text-[0.9375rem]">
                {services.map((s, i) => (
                  <li key={i}>
                    {s.slug ? (
                      <Link
                        href={`/painting-services/${s.slug}`}
                        className="group flex items-center justify-between gap-3 py-3 font-medium text-ink transition-colors hover:text-brand-700"
                      >
                        {s.name}
                        <ArrowRight
                          width={16}
                          height={16}
                          className="shrink-0 text-brand-400 transition-transform duration-200 group-hover:translate-x-1"
                        />
                      </Link>
                    ) : (
                      <span className="block py-3">{s.name}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-[0.9375rem] text-muted">—</p>
            )}
          </Panel>
        </div>
      </Container>
    </>
  )
}
