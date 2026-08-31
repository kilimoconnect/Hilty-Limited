import type { Metadata } from 'next'
import { getDictionary } from '../../../i18n/dictionaries'
import { getLocale } from '../../../i18n/locale'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { Container } from '../../../components/ui/Container'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Panel } from '../../../components/ui/Panel'
import {
  BottleIcon,
  BrushIcon,
  GrainIcon,
  LayersIcon,
  PaletteIcon,
  SackIcon,
  ShieldCheckIcon,
  TruckIcon,
  UsersIcon,
} from '../../../components/ui/icons'

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getLocale())
  return { title: t.pages.about.title, description: t.pages.about.subtitle }
}

const doIcons = [ShieldCheckIcon, PaletteIcon, BrushIcon, TruckIcon]
const valueIcons = [ShieldCheckIcon, PaletteIcon, LayersIcon, UsersIcon]
const businessIcons = [PaletteIcon, GrainIcon, SackIcon, BottleIcon]

export default async function AboutPage() {
  const t = getDictionary(await getLocale())
  const a = t.pages.about

  return (
    <>
      <PageHeader
        eyebrow={t.nav.about}
        title={a.title}
        lead={a.subtitle}
        breadcrumb={[
          { label: t.nav.home, href: '/' },
          { label: t.nav.about, href: '/about' },
        ]}
      />

      {/* Who we are */}
      <Container className="py-14 lg:py-20">
        <div className="max-w-3xl">
          <p className="eyebrow">{a.introTitle}</p>
          <div className="mt-6 space-y-5 text-lead leading-relaxed text-muted">
            {a.intro.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>
      </Container>

      {/* Our businesses — the Hilty Limited divisions */}
      <div className="border-y border-line">
        <Container className="py-14 lg:py-20">
          <div className="max-w-2xl">
            <h2 className="font-display text-h2 font-semibold">{a.businessesTitle}</h2>
            <p className="mt-4 text-lead leading-relaxed text-muted">{a.businessesLead}</p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {a.businesses.map((b, i) => {
              const Icon = businessIcons[i % businessIcons.length]
              return (
                <Panel key={b.title} className="flex flex-col gap-4 p-6 sm:p-7">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                      <Icon width={24} height={24} />
                    </span>
                    <Badge tone={i === 0 ? 'brand' : b.tag === 'Kibaba' ? 'accent' : 'neutral'}>{b.tag}</Badge>
                  </div>
                  <div>
                    <h3 className="font-display text-[1.0625rem] font-semibold">{b.title}</h3>
                    <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{b.body}</p>
                  </div>
                </Panel>
              )
            })}
          </div>
          <p className="mt-8 text-[0.9375rem] leading-relaxed text-muted">{a.businessesNote}</p>
        </Container>
      </div>

      {/* What we do */}
      <div className="border-y border-line bg-surface-2">
        <Container className="py-14 lg:py-20">
          <h2 className="font-display text-h2 font-semibold">{a.doTitle}</h2>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {a.do.map((item, i) => {
              const Icon = doIcons[i % doIcons.length]
              return (
                <Panel key={item.title} className="flex gap-4 p-6 sm:p-7">
                  <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                    <Icon width={22} height={22} />
                  </span>
                  <div>
                    <h3 className="font-display text-[1.0625rem] font-semibold">{item.title}</h3>
                    <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{item.body}</p>
                  </div>
                </Panel>
              )
            })}
          </div>
        </Container>
      </div>

      {/* What you can rely on */}
      <Container className="py-14 lg:py-20">
        <h2 className="font-display text-h2 font-semibold">{a.valuesTitle}</h2>
        <dl className="mt-10 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {a.values.map((v, i) => {
            const Icon = valueIcons[i % valueIcons.length]
            return (
              <div key={v.title}>
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-50 text-accent-600">
                  <Icon width={20} height={20} />
                </span>
                <dt className="mt-4 font-display text-[1.0625rem] font-semibold">{v.title}</dt>
                <dd className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{v.body}</dd>
              </div>
            )
          })}
        </dl>
      </Container>

      {/* CTA */}
      <div className="border-t border-line">
        <Container className="py-14 lg:py-20">
          <Panel tone="dark" className="p-8 text-center sm:p-12">
            <h2 className="font-display text-h2 font-semibold text-white">{a.ctaTitle}</h2>
            <p className="mx-auto mt-4 max-w-xl text-lead leading-relaxed text-brand-100/85">{a.ctaBody}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button href="/branches">{a.visitBranches}</Button>
              <Button href="/request-quotation" variant="outline">
                {a.requestQuote}
              </Button>
            </div>
          </Panel>
        </Container>
      </div>
    </>
  )
}
