import type { Metadata } from 'next'
import Link from 'next/link'
import { getDictionary } from '../../../i18n/dictionaries'
import { getLocale } from '../../../i18n/locale'
import { getActiveServices } from '../../../lib/payload'
import { Container } from '../../../components/ui/Container'
import { Section, SectionHeading } from '../../../components/ui/Section'
import { ArrowRight } from '../../../components/ui/icons'
import { DesignCta } from '../../../components/design/DesignCta'

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getLocale())
  return { title: t.pages.services.title, description: t.pages.services.subtitle }
}

export default async function ServicesPage() {
  const t = getDictionary(await getLocale())
  const services = await getActiveServices(20)

  return (
    <Section>
      <SectionHeading title={t.pages.services.title} subtitle={t.pages.services.subtitle} />
      {services.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <li key={s.id}>
              <Link
                href={`/painting-services/${s.slug ?? ''}`}
                className="group flex h-full flex-col rounded-xl border border-line bg-surface p-5 hover:border-brand-300"
              >
                <h3 className="font-semibold">{s.name}</h3>
                {s.summary && <p className="mt-1 flex-1 text-sm text-muted">{s.summary}</p>}
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-700">
                  {t.pages.services.requestVisit} <ArrowRight width={16} height={16} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <Container className="px-0">
          <p className="text-muted">{t.pages.services.subtitle}</p>
        </Container>
      )}
      <div className="mt-10">
        <DesignCta dict={t} variant="banner" />
      </div>
    </Section>
  )
}
