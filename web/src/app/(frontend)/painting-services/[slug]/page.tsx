import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDictionary } from '../../../../i18n/dictionaries'
import { getLocale } from '../../../../i18n/locale'
import { getServiceBySlug } from '../../../../lib/payload'
import { Container } from '../../../../components/ui/Container'
import { CheckIcon } from '../../../../components/ui/icons'
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
    <div>
      <h2 className="text-lg font-bold">{title}</h2>
      <ul className="mt-3 space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <CheckIcon width={18} height={18} className="mt-0.5 shrink-0 text-brand-600" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
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
    <Container className="py-10">
      <Link href="/painting-services" className="text-sm text-muted hover:text-brand-700">
        ← {t.pages.services.all}
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">{s.name}</h1>
      {s.heroIntro && <p className="mt-2 max-w-2xl text-muted">{s.heroIntro}</p>}

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="space-y-8">
          <DetailList title={t.pages.services.scope} items={scope} />
          {process.length > 0 && (
            <div>
              <h2 className="text-lg font-bold">{t.pages.services.process}</h2>
              <ol className="mt-3 space-y-3">
                {process.map((p, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium">{p.title}</p>
                      {p.detail && <p className="text-sm text-muted">{p.detail}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
          <DetailList title={t.pages.services.provides} items={provides} />
          <DetailList title={t.pages.services.confirms} items={confirms} />
          <p className="rounded-lg bg-surface-2 p-4 text-sm text-muted">{t.pages.services.noGuarantee}</p>
        </div>

        {/* Request site visit */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-lg font-bold">{t.pages.services.requestVisit}</h2>
            <div className="mt-4">
              <SiteVisitForm t={t} serviceContext={s.name} />
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}
