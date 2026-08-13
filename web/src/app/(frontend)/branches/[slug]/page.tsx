import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDictionary } from '../../../../i18n/dictionaries'
import { getLocale } from '../../../../i18n/locale'
import { getBranchBySlug } from '../../../../lib/payload'
import { SITE } from '../../../../lib/site'
import { relName } from '../../../../lib/format'
import { Container } from '../../../../components/ui/Container'
import { PhoneIcon, PinIcon, WhatsAppIcon } from '../../../../components/ui/icons'

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

  const mapQuery = b.mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.fullAddress || b.name)}`
  const wa = b.whatsapp?.replace(/\D/g, '') || SITE.whatsapp
  const services = (b.servicesAvailable ?? []).map((s) => ({ name: relName(s), slug: typeof s === 'object' && s ? s.slug : null })).filter((s) => s.name)

  return (
    <Container className="py-10">
      <Link href="/branches" className="text-sm text-muted hover:text-brand-700">
        ← {t.pages.branches.title}
      </Link>

      <div className="mt-4 flex items-start gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <PinIcon width={22} height={22} />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{b.name}</h1>
          {b.fullAddress && <p className="mt-1 text-muted">{b.fullAddress}</p>}
        </div>
      </div>

      {/* Contact actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        {b.phone && (
          <a href={`tel:${b.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
            <PhoneIcon width={16} height={16} /> {t.pages.branches.call}
          </a>
        )}
        <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-95">
          <WhatsAppIcon width={16} height={16} /> {t.pages.branches.whatsapp}
        </a>
        <a href={mapQuery} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-brand-600 px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50">
          <PinIcon width={16} height={16} /> {t.pages.branches.directions}
        </a>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2">
        {/* Hours */}
        <div>
          <h2 className="text-lg font-bold">{t.pages.branches.hours}</h2>
          {b.operatingHours && b.operatingHours.length > 0 ? (
            <ul className="mt-3 divide-y divide-line rounded-xl border border-line text-sm">
              {b.operatingHours.map((h, i) => (
                <li key={i} className="flex items-center justify-between px-4 py-2.5">
                  <span className="capitalize">{h.day}</span>
                  <span className="text-muted">{h.closed ? t.pages.branches.closed : `${h.open ?? ''}–${h.close ?? ''}`}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">—</p>
          )}
        </div>

        {/* Services */}
        <div>
          <h2 className="text-lg font-bold">{t.pages.branches.services}</h2>
          {services.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm">
              {services.map((s, i) => (
                <li key={i}>
                  {s.slug ? (
                    <Link href={`/painting-services/${s.slug}`} className="text-brand-700 hover:underline">
                      {s.name}
                    </Link>
                  ) : (
                    s.name
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">—</p>
          )}
        </div>
      </div>
    </Container>
  )
}
