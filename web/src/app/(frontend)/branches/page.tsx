import type { Metadata } from 'next'
import Link from 'next/link'
import { getDictionary } from '../../../i18n/dictionaries'
import { getLocale } from '../../../i18n/locale'
import { getActiveBranches } from '../../../lib/payload'
import { Section, SectionHeading } from '../../../components/ui/Section'
import { PinIcon } from '../../../components/ui/icons'

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getLocale())
  return { title: t.pages.branches.title, description: t.pages.branches.subtitle }
}

export default async function BranchesPage() {
  const t = getDictionary(await getLocale())
  const branches = await getActiveBranches(50)

  return (
    <Section>
      <SectionHeading title={t.pages.branches.title} subtitle={t.pages.branches.subtitle} />
      {branches.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((b) => (
            <li key={b.id} className="flex h-full flex-col rounded-xl border border-line bg-surface p-5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <PinIcon />
              </span>
              <h3 className="mt-3 font-semibold">{b.name}</h3>
              {b.region && <p className="text-sm text-muted">{b.region}</p>}
              {b.phone && (
                <a href={`tel:${b.phone.replace(/\s/g, '')}`} className="mt-2 text-sm text-brand-700">
                  {b.phone}
                </a>
              )}
              <Link href={`/branches/${b.slug ?? ''}`} className="mt-4 text-sm font-medium text-brand-700 hover:underline">
                {t.pages.branches.view} →
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted">{t.pages.branches.empty}</p>
      )}
    </Section>
  )
}
