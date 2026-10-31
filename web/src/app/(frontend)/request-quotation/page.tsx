import type { Metadata } from 'next'
import Link from 'next/link'
import { getDictionary } from '../../../i18n/dictionaries'
import { getLocale } from '../../../i18n/locale'
import { getActiveBranches } from '../../../lib/payload'
import { Container } from '../../../components/ui/Container'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Panel } from '../../../components/ui/Panel'
import { QuotationForm } from '../../../components/forms/QuotationForm'
import { RulerIcon, ArrowRight } from '../../../components/ui/icons'

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getLocale())
  return { title: t.nav.quotation, description: t.forms.quoteLead }
}

export const maxDuration = 60

export default async function RequestQuotationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const t = getDictionary(await getLocale())
  const sp = await searchParams
  const product = Array.isArray(sp.product) ? sp.product[0] : sp.product
  const branches = await getActiveBranches(50)

  return (
    <>
      <PageHeader
        eyebrow={t.home.finalEyebrow}
        title={t.nav.quotation}
        lead={t.forms.quoteLead}
        breadcrumb={[
          { label: t.nav.home, href: '/' },
          { label: t.nav.quotation, href: '/request-quotation' },
        ]}
      />
      <Container width="content" className="py-14 lg:py-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-2">
            <Panel className="p-6 sm:p-9">
              <QuotationForm t={t} branches={branches.map((b) => ({ id: b.id, name: b.name }))} defaultProductSlug={product} />
            </Panel>
          </div>
          <aside className="space-y-4">
            <Panel tone="inset" className="p-6">
              <h2 className="flex items-center gap-2 font-display text-[1.0625rem] font-semibold">
                <RulerIcon width={20} height={20} className="text-brand-500" />
                {t.calc.title}
              </h2>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{t.calc.subtitle}</p>
              <Link
                href="/paint-calculator"
                className="group mt-4 inline-flex items-center gap-1.5 font-display text-[0.875rem] font-semibold text-brand-700"
              >
                {t.calc.title}
                <ArrowRight width={15} height={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </Panel>
            <Panel tone="inset" className="p-6 text-[0.875rem] leading-relaxed text-muted">
              {t.pages.services.noGuarantee}
            </Panel>
          </aside>
        </div>
      </Container>
    </>
  )
}
