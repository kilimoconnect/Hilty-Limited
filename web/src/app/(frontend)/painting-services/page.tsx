import type { Metadata } from 'next'
import Link from 'next/link'
import { getDictionary } from '../../../i18n/dictionaries'
import { getLocale } from '../../../i18n/locale'
import { getActiveServices } from '../../../lib/payload'
import { Button } from '../../../components/ui/Button'
import { Container } from '../../../components/ui/Container'
import { EmptyState } from '../../../components/ui/EmptyState'
import { PageHeader } from '../../../components/ui/PageHeader'
import { ArrowRight, BrushIcon } from '../../../components/ui/icons'
import { DesignCta } from '../../../components/design/DesignCta'

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getLocale())
  return { title: t.pages.services.title, description: t.pages.services.subtitle }
}

export default async function ServicesPage() {
  const t = getDictionary(await getLocale())
  const services = await getActiveServices(20)

  return (
    <>
      <PageHeader
        eyebrow={t.home.servicesEyebrow}
        title={t.pages.services.title}
        lead={t.pages.services.subtitle}
        breadcrumb={[
          { label: t.nav.home, href: '/' },
          { label: t.nav.services, href: '/painting-services' },
        ]}
        actions={
          <>
            <Button href="/book-visit">{t.pages.services.requestVisit}</Button>
            <Button href="/request-quotation" variant="outline">
              {t.hero.quotation}
            </Button>
          </>
        }
      />

      <Container className="py-14 lg:py-20">
        {services.length > 0 ? (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/painting-services/${s.slug ?? ''}`}
                  className="group flex h-full flex-col rounded-lg border border-line bg-surface p-6 transition-[border-color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                    <BrushIcon width={21} height={21} />
                  </span>
                  <h2 className="mt-5 font-display text-h3 font-semibold">{s.name}</h2>
                  {s.summary && <p className="mt-2.5 flex-1 text-[0.9375rem] leading-relaxed text-muted">{s.summary}</p>}
                  <span className="mt-6 inline-flex items-center gap-2 border-t border-line pt-5 font-display text-sm font-semibold text-brand-600">
                    {t.pages.services.requestVisit}
                    <ArrowRight
                      width={16}
                      height={16}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={<BrushIcon width={22} height={22} />}
            title={t.pages.services.subtitle}
            action={<Button href="/request-quotation">{t.hero.quotation}</Button>}
          />
        )}

        <p className="mt-8 text-[0.8125rem] text-muted">{t.pages.services.noGuarantee}</p>

        <div className="mt-14">
          <DesignCta dict={t} variant="banner" />
        </div>
      </Container>
    </>
  )
}
