import type { Metadata } from 'next'
import { getDictionary } from '../../../i18n/dictionaries'
import { getLocale } from '../../../i18n/locale'
import { Container } from '../../../components/ui/Container'
import { PageHeader } from '../../../components/ui/PageHeader'
import { ColourMatch } from '../../../components/ai/ColourMatch'

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getLocale())
  return { title: t.pages.colourMatch.title, description: t.pages.colourMatch.subtitle }
}

export const maxDuration = 60

export default async function ColourMatchPage() {
  const locale = await getLocale()
  const t = getDictionary(locale)

  return (
    <>
      <PageHeader
        eyebrow={t.pages.colourMatch.eyebrow}
        title={t.pages.colourMatch.title}
        lead={t.pages.colourMatch.subtitle}
        breadcrumb={[
          { label: t.nav.home, href: '/' },
          { label: t.pages.colourMatch.title, href: '/colour-match' },
        ]}
      />
      <Container className="py-14 lg:py-20">
        <ColourMatch dict={t} locale={locale} />
      </Container>
    </>
  )
}
