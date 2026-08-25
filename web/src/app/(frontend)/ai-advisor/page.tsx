import type { Metadata } from 'next'
import { getDictionary } from '../../../i18n/dictionaries'
import { getLocale } from '../../../i18n/locale'
import { Container } from '../../../components/ui/Container'
import { AiAdvisorChat } from '../../../components/ai/AiAdvisorChat'

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getLocale())
  return { title: t.advisor.title, description: t.advisor.body }
}

export default async function AiAdvisorPage() {
  const locale = await getLocale()
  const t = getDictionary(locale)
  return (
    <Container className="py-10">
      <h1 className="text-3xl font-bold tracking-tight">{t.advisor.title}</h1>
      <p className="mt-2 max-w-2xl text-muted">{t.advisor.body}</p>
      <div className="mt-8">
        <AiAdvisorChat dict={t} locale={locale} />
      </div>
    </Container>
  )
}
