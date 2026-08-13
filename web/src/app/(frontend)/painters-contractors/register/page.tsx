import type { Metadata } from 'next'
import { getDictionary } from '../../../../i18n/dictionaries'
import { getLocale } from '../../../../i18n/locale'
import { Container } from '../../../../components/ui/Container'
import { PainterForm } from '../../../../components/forms/PainterForm'

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getLocale())
  return { title: t.pages.pro.registerTitle, description: t.pages.pro.registerBody }
}

export default async function RegisterPage() {
  const t = getDictionary(await getLocale())
  return (
    <Container className="max-w-2xl py-10">
      <h1 className="text-2xl font-bold tracking-tight">{t.pages.pro.registerTitle}</h1>
      <p className="mt-2 text-muted">{t.pages.pro.registerBody}</p>
      <div className="mt-8">
        <PainterForm t={t} />
      </div>
    </Container>
  )
}
