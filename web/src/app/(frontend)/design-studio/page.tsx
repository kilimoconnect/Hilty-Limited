import type { Metadata } from 'next'
import { getDictionary } from '../../../i18n/dictionaries'
import { getLocale } from '../../../i18n/locale'
import { getActiveBranches } from '../../../lib/payload'
import { Container } from '../../../components/ui/Container'
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
    <Container className="py-10">
      <h1 className="text-3xl font-bold tracking-tight">{t.studio.title}</h1>
      <p className="mt-2 max-w-2xl text-muted">{t.studio.subtitle}</p>
      <div className="mt-8">
        <DesignStudio dict={t} locale={locale} branches={branches.map((b) => ({ id: b.id, name: b.name }))} />
      </div>
    </Container>
  )
}
