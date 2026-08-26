import type { Metadata } from 'next'
import { getDictionary } from '../../../i18n/dictionaries'
import { getLocale } from '../../../i18n/locale'
import { Container } from '../../../components/ui/Container'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Panel } from '../../../components/ui/Panel'
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
    <>
      <PageHeader
        eyebrow={t.home.servicesEyebrow}
        title={t.pages.services.requestVisit}
        lead={t.pages.services.noGuarantee}
        breadcrumb={[
          { label: t.nav.home, href: '/' },
          { label: t.nav.services, href: '/painting-services' },
        ]}
      />
      <Container width="content" className="py-14 lg:py-20">
        <Panel className="p-6 sm:p-9">
          <SiteVisitForm t={t} serviceContext={service} />
        </Panel>
      </Container>
    </>
  )
}
