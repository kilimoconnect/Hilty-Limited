import type { Metadata } from 'next'
import { getDictionary } from '../../../i18n/dictionaries'
import { getLocale } from '../../../i18n/locale'
import { Section, SectionHeading } from '../../../components/ui/Section'
import { Button } from '../../../components/ui/Button'

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getLocale())
  return { title: t.pages.pro.title, description: t.pages.pro.subtitle }
}

export default async function ProPage() {
  const t = getDictionary(await getLocale())
  return (
    <Section>
      <SectionHeading title={t.pages.pro.title} subtitle={t.pages.pro.subtitle} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-lg font-bold">{t.pages.pro.registerTitle}</h2>
          <p className="mt-2 flex-1 text-sm text-muted">{t.pages.pro.registerBody}</p>
          <div className="mt-4">
            <Button href="/painters-contractors/register">{t.pages.pro.register}</Button>
          </div>
        </div>
        <div className="flex flex-col rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-lg font-bold">{t.pages.pro.applyTitle}</h2>
          <p className="mt-2 flex-1 text-sm text-muted">{t.pages.pro.applyBody}</p>
          <div className="mt-4">
            <Button href="/painters-contractors/apply">{t.pages.pro.apply}</Button>
          </div>
        </div>
      </div>
    </Section>
  )
}
