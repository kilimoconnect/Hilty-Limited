import type { Metadata } from 'next'
import { getDictionary } from '../../../i18n/dictionaries'
import { getLocale } from '../../../i18n/locale'
import { Container } from '../../../components/ui/Container'
import { PageHeader } from '../../../components/ui/PageHeader'
import { QuoteDraft } from '../../../components/ai/QuoteDraft'

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getLocale())
  return { title: t.pages.estimate.title, description: t.pages.estimate.subtitle }
}

export default async function AiEstimatePage() {
  const locale = await getLocale()
  const t = getDictionary(locale)

  return (
    <>
      <PageHeader
        eyebrow={t.pages.estimate.eyebrow}
        title={t.pages.estimate.title}
        lead={t.pages.estimate.subtitle}
        breadcrumb={[
          { label: t.nav.home, href: '/' },
          { label: t.pages.estimate.title, href: '/ai-estimate' },
        ]}
      />
      <Container className="py-14 lg:py-20">
        <QuoteDraft dict={t} locale={locale} />
      </Container>
    </>
  )
}
