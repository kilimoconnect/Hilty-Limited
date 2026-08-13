import type { Metadata } from 'next'
import { getDictionary } from '../../../i18n/dictionaries'
import { getLocale } from '../../../i18n/locale'
import { Container } from '../../../components/ui/Container'
import { SiteVisitForm } from '../../../components/forms/SiteVisitForm'

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getLocale())
  return { title: t.pages.services.requestVisit, description: t.pages.services.subtitle }
}

export default async function BookVisitPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const t = getDictionary(await getLocale())
  const sp = await searchParams
  const service = Array.isArray(sp.service) ? sp.service[0] : sp.service
  return (
    <Container className="max-w-2xl py-10">
      <h1 className="text-2xl font-bold tracking-tight">{t.pages.services.requestVisit}</h1>
      <p className="mt-2 text-muted">{t.pages.services.noGuarantee}</p>
      <div className="mt-8">
        <SiteVisitForm t={t} serviceContext={service} />
      </div>
    </Container>
  )
}
