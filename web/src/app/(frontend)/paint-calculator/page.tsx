import type { Metadata } from 'next'
import { getDictionary } from '../../../i18n/dictionaries'
import { getLocale } from '../../../i18n/locale'
import { getActiveBranches, getCalculatorProducts } from '../../../lib/payload'
import { SITE } from '../../../lib/site'
import { Container } from '../../../components/ui/Container'
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
    <Container className="py-10">
      <h1 className="text-3xl font-bold tracking-tight">{t.calc.title}</h1>
      <p className="mt-2 max-w-2xl text-muted">{t.calc.subtitle}</p>
      <TrackEvent type="calculator_started" />
      <div className="mt-8">
        <PaintCalculator
          t={t}
          products={products}
          branches={branches.map((b) => ({ id: b.id, name: b.name }))}
          whatsapp={SITE.whatsapp}
        />
      </div>
    </Container>
  )
}
