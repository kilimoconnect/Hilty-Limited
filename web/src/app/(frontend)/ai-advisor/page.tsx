import type { Metadata } from 'next'
import { getDictionary } from '../../../i18n/dictionaries'
import { getLocale } from '../../../i18n/locale'
import { Container } from '../../../components/ui/Container'
import { PageHeader } from '../../../components/ui/PageHeader'
import { AiAdvisorChat } from '../../../components/ai/AiAdvisorChat'

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getLocale())
  return { title: t.advisor.title, description: t.advisor.body }
}

export default async function AiAdvisorPage() {
  const locale = await getLocale()
  const t = getDictionary(locale)
  return (
    <>
      <PageHeader
        eyebrow={t.home.toolsEyebrow}
        title={t.advisor.title}
        lead={t.advisor.body}
        breadcrumb={[
          { label: t.nav.home, href: '/' },
          { label: t.advisor.title, href: '/ai-advisor' },
        ]}
      />
      <Container className="py-14 lg:py-20">
        <AiAdvisorChat dict={t} locale={locale} />
      </Container>
    </>
  )
}
