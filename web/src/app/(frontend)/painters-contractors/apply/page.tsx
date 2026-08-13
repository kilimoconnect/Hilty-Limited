import type { Metadata } from 'next'
import { getDictionary } from '../../../../i18n/dictionaries'
import { getLocale } from '../../../../i18n/locale'
import { Container } from '../../../../components/ui/Container'
import { EnquiryForm } from '../../../../components/forms/EnquiryForm'

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getLocale())
  return { title: t.pages.pro.applyTitle, description: t.pages.pro.applyBody }
}

export default async function ApplyPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const t = getDictionary(await getLocale())
  const sp = await searchParams
  const type = (Array.isArray(sp.type) ? sp.type[0] : sp.type) || 'project_pricing'
  return (
    <Container className="max-w-2xl py-10">
      <h1 className="text-2xl font-bold tracking-tight">{t.pages.pro.applyTitle}</h1>
      <p className="mt-2 text-muted">{t.pages.pro.applyBody}</p>
      <div className="mt-8">
        <EnquiryForm t={t} defaultType={type} />
      </div>
    </Container>
  )
}
