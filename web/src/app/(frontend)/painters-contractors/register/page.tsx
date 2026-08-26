import type { Metadata } from 'next'
import { getDictionary } from '../../../../i18n/dictionaries'
import { getLocale } from '../../../../i18n/locale'
import { Container } from '../../../../components/ui/Container'
import { PageHeader } from '../../../../components/ui/PageHeader'
import { Panel } from '../../../../components/ui/Panel'
import { PainterForm } from '../../../../components/forms/PainterForm'

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getLocale())
  return { title: t.pages.pro.registerTitle, description: t.pages.pro.registerBody }
}

export default async function RegisterPage() {
  const t = getDictionary(await getLocale())
  return (
    <>
      <PageHeader
        eyebrow={t.home.contractorEyebrow}
        title={t.pages.pro.registerTitle}
        lead={t.pages.pro.registerBody}
        breadcrumb={[
          { label: t.nav.home, href: '/' },
          { label: t.nav.painters, href: '/painters-contractors' },
        ]}
      />
      <Container width="content" className="py-14 lg:py-20">
        <Panel className="p-6 sm:p-9">
          <PainterForm t={t} />
        </Panel>
      </Container>
    </>
  )
}
