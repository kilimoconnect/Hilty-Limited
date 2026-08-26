import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDictionary } from '../../../../i18n/dictionaries'
import { getLocale } from '../../../../i18n/locale'
import { getServiceBySlug } from '../../../../lib/payload'
import { Container } from '../../../../components/ui/Container'
import { PageHeader } from '../../../../components/ui/PageHeader'
import { Panel } from '../../../../components/ui/Panel'
import { CheckIcon, InfoIcon } from '../../../../components/ui/icons'
import { SiteVisitForm } from '../../../../components/forms/SiteVisitForm'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const s = await getServiceBySlug(slug)
  if (!s) return { title: 'Service' }
  return { title: s.name, description: s.summary || s.heroIntro || undefined }
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null
  return (
    <section>
      <h2 className="font-display text-h3 font-semibold">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-3 text-[0.9375rem] leading-relaxed text-ink-soft">
            <CheckIcon width={18} height={18} className="mt-1 shrink-0 text-accent-500" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default async function ServiceDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const t = getDictionary(await getLocale())
  const s = await getServiceBySlug(slug)
  if (!s) notFound()

  const scope = (s.scope ?? []).map((x) => x.item).filter((v): v is string => Boolean(v))
  const provides = (s.customerProvides ?? []).map((x) => x.item).filter((v): v is string => Boolean(v))
  const confirms = (s.hiltyConfirms ?? []).map((x) => x.item).filter((v): v is string => Boolean(v))
  const process = (s.process ?? []).filter((p) => p.title || p.detail)

  return (
    <>
      <PageHeader
        eyebrow={t.home.servicesEyebrow}
        title={s.name}
        lead={s.heroIntro || s.summary || undefined}
        breadcrumb={[
          { label: t.nav.home, href: '/' },
          { label: t.pages.services.all, href: '/painting-services' },
        ]}
      />

      <Container className="py-14 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-12 lg:col-span-7">
            <DetailList title={t.pages.services.scope} items={scope} />

            {process.length > 0 && (
              <section>
                <h2 className="font-display text-h3 font-semibold">{t.pages.services.process}</h2>
                <ol className="mt-5 space-y-0 divide-y divide-line border-y border-line">
                  {process.map((p, i) => (
                    <li key={i} className="flex gap-5 py-5">
                      <span className="tabular font-display text-lg font-bold text-accent-500">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <p className="font-display font-semibold">{p.title}</p>
                        {p.detail && <p className="mt-1 text-[0.9375rem] leading-relaxed text-muted">{p.detail}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <DetailList title={t.pages.services.provides} items={provides} />
            <DetailList title={t.pages.services.confirms} items={confirms} />

            <p className="flex items-start gap-3 rounded-md bg-surface-2 px-5 py-4 text-[0.9375rem] leading-relaxed text-muted">
              <InfoIcon width={18} height={18} className="mt-0.5 shrink-0 text-brand-500" />
              {t.pages.services.noGuarantee}
            </p>
          </div>

          <div className="lg:col-span-5">
            <Panel className="p-6 sm:p-8 lg:sticky lg:top-32">
              <h2 className="font-display text-h3 font-semibold">{t.pages.services.requestVisit}</h2>
              <div className="mt-6">
                <SiteVisitForm t={t} serviceContext={s.name} />
              </div>
            </Panel>
          </div>
        </div>
      </Container>
    </>
  )
}
