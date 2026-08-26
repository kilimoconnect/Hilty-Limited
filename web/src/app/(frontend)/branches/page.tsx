import type { Metadata } from 'next'
import Link from 'next/link'
import { getDictionary } from '../../../i18n/dictionaries'
import { getLocale } from '../../../i18n/locale'
import { getActiveBranches } from '../../../lib/payload'
import { SITE } from '../../../lib/site'
import { Button } from '../../../components/ui/Button'
import { Container } from '../../../components/ui/Container'
import { EmptyState } from '../../../components/ui/EmptyState'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Panel } from '../../../components/ui/Panel'
import { ArrowRight, PhoneIcon, PinIcon, WhatsAppIcon } from '../../../components/ui/icons'

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getLocale())
  return { title: t.pages.branches.title, description: t.pages.branches.subtitle }
}

export default async function BranchesPage() {
  const t = getDictionary(await getLocale())
  const branches = await getActiveBranches(50)

  return (
    <>
      <PageHeader
        eyebrow={t.home.branchesEyebrow}
        title={t.pages.branches.title}
        lead={t.pages.branches.subtitle}
        breadcrumb={[
          { label: t.nav.home, href: '/' },
          { label: t.nav.branches, href: '/branches' },
        ]}
      />

      <Container className="py-14 lg:py-20">
        {branches.length > 0 ? (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {branches.map((b) => (
              <Panel as="li" key={b.id} className="flex h-full flex-col p-6">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                  <PinIcon width={21} height={21} />
                </span>
                <h2 className="mt-5 font-display text-h3 font-semibold">{b.name}</h2>
                {b.region && <p className="mt-1 text-[0.9375rem] text-muted">{b.region}</p>}

                <div className="mt-5 flex flex-1 flex-col gap-2.5 text-[0.9375rem]">
                  {b.phone && (
                    <a
                      href={`tel:${b.phone.replace(/\s/g, '')}`}
                      className="tabular inline-flex items-center gap-2.5 font-semibold text-brand-600"
                    >
                      <PhoneIcon width={16} height={16} className="shrink-0 text-brand-400" />
                      {b.phone}
                    </a>
                  )}
                  <a
                    href={SITE.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 text-ink-soft hover:text-brand-700"
                  >
                    <WhatsAppIcon width={16} height={16} className="shrink-0 text-whatsapp" />
                    {t.pages.branches.whatsapp}
                  </a>
                </div>

                <Link
                  href={`/branches/${b.slug ?? ''}`}
                  className="group mt-6 inline-flex items-center gap-2 border-t border-line pt-5 font-display text-sm font-semibold text-ink"
                >
                  {t.pages.branches.view}
                  <ArrowRight
                    width={16}
                    height={16}
                    className="text-brand-400 transition-transform duration-200 group-hover:translate-x-1"
                  />
                </Link>
              </Panel>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={<PinIcon width={22} height={22} />}
            title={t.pages.branches.empty}
            action={<Button href="/request-quotation">{t.hero.quotation}</Button>}
          />
        )}
      </Container>
    </>
  )
}
