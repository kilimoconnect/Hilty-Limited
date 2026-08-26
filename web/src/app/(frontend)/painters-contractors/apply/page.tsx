import type { Metadata } from 'next'
import { getDictionary } from '../../../../i18n/dictionaries'
import { getLocale } from '../../../../i18n/locale'
import { Container } from '../../../../components/ui/Container'
import { PageHeader } from '../../../../components/ui/PageHeader'
import { Panel } from '../../../../components/ui/Panel'
import { EnquiryForm } from '../../../../components/forms/EnquiryForm'

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getLocale())
  return { title: t.pages.pro.applyTitle, description: t.pages.pro.applyBody }
}

export default async function ApplyPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const t = getDictionary(await getLocale())
  const sp = await searchParams
  const type = (Array.isArray(sp.type) ? sp.type[0] : sp.type) || 'project_pricing'
  return (
    <>
      <PageHeader
        eyebrow={t.home.contractorEyebrow}
        title={t.pages.pro.applyTitle}
        lead={t.pages.pro.applyBody}
        breadcrumb={[
          { label: t.nav.home, href: '/' },
          { label: t.nav.painters, href: '/painters-contractors' },
        ]}
      />
      <Container width="content" className="py-14 lg:py-20">
        <Panel className="p-6 sm:p-9">
          <EnquiryForm t={t} defaultType={type} />
        </Panel>
      </Container>
    </>
  )
}
