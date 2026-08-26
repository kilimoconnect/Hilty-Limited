import type { Metadata } from 'next'
import { getDictionary } from '../../../i18n/dictionaries'
import { getLocale } from '../../../i18n/locale'
import { getActiveBranches, getCalculatorProducts } from '../../../lib/payload'
import { SITE } from '../../../lib/site'
import { Container } from '../../../components/ui/Container'
import { PageHeader } from '../../../components/ui/PageHeader'
import { PaintCalculator } from '../../../components/calculator/PaintCalculator'
import { TrackEvent } from '../../../components/TrackEvent'

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getLocale())
  return { title: t.calc.title, description: t.calc.subtitle }
}

export default async function CalculatorPage() {
  const t = getDictionary(await getLocale())
  const [products, branches] = await Promise.all([getCalculatorProducts(), getActiveBranches(50)])

  return (
    <>
      <PageHeader
        eyebrow={t.home.toolsEyebrow}
        title={t.calc.title}
        lead={t.calc.subtitle}
        breadcrumb={[
          { label: t.nav.home, href: '/' },
          { label: t.calc.title, href: '/paint-calculator' },
        ]}
      />
      <TrackEvent type="calculator_started" />
      <Container className="py-14 lg:py-20">
        <PaintCalculator
          t={t}
          products={products}
          branches={branches.map((b) => ({ id: b.id, name: b.name }))}
          whatsapp={SITE.whatsapp}
        />
      </Container>
    </>
  )
}
