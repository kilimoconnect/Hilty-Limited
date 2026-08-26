import type { Metadata } from 'next'
import { getDictionary } from '../../../i18n/dictionaries'
import { getLocale } from '../../../i18n/locale'
import { getActiveBranches } from '../../../lib/payload'
import { Container } from '../../../components/ui/Container'
import { PageHeader } from '../../../components/ui/PageHeader'
import { DesignStudio } from '../../../components/design/DesignStudio'

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getLocale())
  return { title: t.studio.title, description: t.studio.subtitle }
}

export default async function DesignStudioPage() {
  const locale = await getLocale()
  const t = getDictionary(locale)
  const branches = await getActiveBranches(50)
  return (
    <>
      <PageHeader
        eyebrow={t.home.toolsEyebrow}
        title={t.studio.title}
        lead={t.studio.subtitle}
        breadcrumb={[
          { label: t.nav.home, href: '/' },
          { label: t.nav.studio, href: '/design-studio' },
        ]}
      />
      <Container className="py-14 lg:py-20">
        <DesignStudio dict={t} locale={locale} branches={branches.map((b) => ({ id: b.id, name: b.name }))} />
      </Container>
    </>
  )
}
