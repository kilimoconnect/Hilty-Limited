import Link from 'next/link'
import { getDictionary } from '../../i18n/dictionaries'
import { getLocale } from '../../i18n/locale'
import {
  getActiveBranches,
  getActiveServices,
  getCategories,
  getCompletedProjects,
  getFeaturedProducts,
} from '../../lib/payload'
import { SITE } from '../../lib/site'
import { Button } from '../../components/ui/Button'
import { Container } from '../../components/ui/Container'
import { Section, SectionHeading } from '../../components/ui/Section'
import { Panel } from '../../components/ui/Panel'
import { EmptyState } from '../../components/ui/EmptyState'
import { categoryTone, Swatch } from '../../components/ui/Swatch'
import {
  ArrowRight,
  ArrowUpRight,
  BrushIcon,
  LayersIcon,
  PaletteIcon,
  PinIcon,
  RulerIcon,
  ShieldCheckIcon,
  SparkIcon,
  UsersIcon,
  WhatsAppIcon,
} from '../../components/ui/icons'

const mediaUrl = (m: unknown): string | null =>
  m && typeof m === 'object' && 'url' in m ? ((m as { url?: string }).url ?? null) : null

export default async function HomePage() {
  const locale = await getLocale()
  const t = getDictionary(locale)

  const [categories, featured, services, branches, projects] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
    getActiveServices(3),
    getActiveBranches(),
    getCompletedProjects(),
  ])

  const trust = [
    { ...t.trust.genuine, icon: <ShieldCheckIcon width={22} height={22} /> },
    { ...t.trust.outlets, icon: <PinIcon width={22} height={22} /> },
    { ...t.trust.guidance, icon: <UsersIcon width={22} height={22} /> },
    { ...t.trust.support, icon: <LayersIcon width={22} height={22} /> },
  ]

  const tools = [
    {
      href: '/paint-calculator',
      title: t.calc.title,
      body: t.calc.subtitle,
      icon: <RulerIcon width={22} height={22} />,
    },
    {
      href: '/ai-advisor',
      title: t.advisor.title,
      body: t.advisor.body,
      icon: <SparkIcon width={22} height={22} />,
    },
    {
      href: '/design-studio',
      title: t.studio.title,
      body: t.studio.subtitle,
      icon: <PaletteIcon width={22} height={22} />,
    },
  ]

  const cardCategories = categories.slice(0, 4)

  return (
    <>
      {/* ─── 1. HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brand-900 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(120% 90% at 12% 0%, rgba(44,102,144,0.55) 0%, rgba(7,30,48,0) 62%), radial-gradient(90% 80% at 100% 100%, rgba(169,77,37,0.28) 0%, rgba(7,30,48,0) 60%)',
          }}
        />
        <Container className="relative grid gap-14 py-16 sm:py-20 lg:grid-cols-12 lg:items-center lg:gap-10 lg:py-28">
          <div className="lg:col-span-7">
            <p className="eyebrow eyebrow-light rise rise-1">{t.home.heroEyebrow}</p>
            <h1 className="rise rise-2 mt-6 text-display text-white">{t.hero.title}</h1>
            <p className="rise rise-3 mt-7 max-w-xl text-lead text-white/80">{t.hero.subtitle}</p>

            <div className="rise rise-3 mt-10 flex flex-wrap gap-3">
              <Button href="/request-quotation" size="lg" className="w-full sm:w-auto">
                {t.hero.quotation}
              </Button>
              <Button href="/products" variant="outlineLight" size="lg" className="w-full sm:w-auto">
                {t.hero.browse}
              </Button>
            </div>

            <div className="rise rise-4 mt-12 border-t border-white/15 pt-7">
              <p className="font-display text-eyebrow font-semibold uppercase tracking-[0.14em] text-brand-300">
                {t.home.toolsLabel}
              </p>
              <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
                {tools.map((tool) => (
                  <li key={tool.href}>
                    <Link
                      href={tool.href}
                      className="group inline-flex items-center gap-2 font-display text-[0.9375rem] font-medium text-white/90 transition-colors hover:text-white"
                    >
                      <span className="text-accent-300">{tool.icon}</span>
                      <span className="link-quiet">{tool.title}</span>
                      <ArrowUpRight
                        width={15}
                        height={15}
                        className="text-brand-300 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Colour card — the physical object a paint shop hands you, on screen. */}
          <div className="rise rise-4 lg:col-span-5">
            <div className="relative mx-auto max-w-sm lg:ml-auto lg:mr-0">
              <div aria-hidden className="absolute -right-3 -top-3 h-full w-full rounded-xl bg-white/10" />
              <div className="relative rounded-xl bg-surface p-5 text-ink shadow-panel sm:p-6">
                <div className="flex items-baseline justify-between gap-4 border-b border-line pb-4">
                  <p className="font-display text-base font-semibold">{t.home.cardTitle}</p>
                  <p className="font-display text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted">
                    Hilty
                  </p>
                </div>
                <ul className="mt-5 grid grid-cols-2 gap-4">
                  {(cardCategories.length > 0 ? cardCategories : [null, null, null, null]).map((c, i) => (
                    <li key={c?.id ?? i}>
                      <Swatch tone={categoryTone(c?.key, i)} className="aspect-[5/4] w-full" />
                      <p className="mt-2.5 font-display text-[0.8125rem] font-medium leading-snug text-ink-soft">
                        {c?.name ?? ' '}
                      </p>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 border-t border-line pt-4 text-[0.8125rem] text-muted">{t.home.cardNote}</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── 2. WHY HILTY ────────────────────────────────────────────────── */}
      <Section padded={false}>
        <ul className="grid grid-cols-1 divide-y divide-line border-x-0 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          {trust.map((item) => (
            <li key={item.title} className="px-0 py-9 lg:px-8 lg:first:pl-0 lg:last:pr-0">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                {item.icon}
              </span>
              <h3 className="mt-5 font-display text-h3 font-semibold">{item.title}</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* ─── 3. SHOP BY CATEGORY ─────────────────────────────────────────── */}
      {categories.length > 0 && (
        <Section tone="alt">
          <SectionHeading
            eyebrow={t.home.categoriesEyebrow}
            title={t.categories.title}
            subtitle={t.categories.subtitle}
            action={
              <Button href="/products" variant="outline">
                {t.catalogue.title} <ArrowRight width={16} height={16} />
              </Button>
            }
          />
          <ul className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
            {categories.map((c, i) => (
              <li key={c.id}>
                <Link
                  href={`/products?category=${c.key}`}
                  className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface transition-[border-color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift"
                >
                  <span
                    aria-hidden
                    className="block h-24 w-full sm:h-28"
                    style={{ backgroundColor: categoryTone(c.key, i) }}
                  />
                  <span className="flex flex-1 items-center justify-between gap-3 p-4 sm:p-5">
                    <span className="font-display text-[0.9375rem] font-semibold leading-snug sm:text-base">
                      {c.name}
                    </span>
                    <ArrowRight
                      width={18}
                      height={18}
                      className="shrink-0 text-brand-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-brand-600"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ─── 4. TOOLS ────────────────────────────────────────────────────── */}
      <Section tone="dark">
        <SectionHeading
          eyebrow={t.home.toolsEyebrow}
          title={t.home.toolsTitle}
          subtitle={t.home.toolsSubtitle}
          tone="light"
        />
        <ul className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {tools.map((tool) => (
            <li key={tool.href}>
              <Link
                href={tool.href}
                className="group flex h-full flex-col rounded-lg border border-white/12 bg-white/[0.04] p-7 transition-[background-color,border-color,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.08]"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-accent-500 text-white">
                  {tool.icon}
                </span>
                <h3 className="mt-6 font-display text-h3 font-semibold text-white">{tool.title}</h3>
                <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-brand-100/80">{tool.body}</p>
                <span className="mt-6 inline-flex items-center gap-2 font-display text-sm font-semibold text-white">
                  {t.home.open}
                  <ArrowRight
                    width={16}
                    height={16}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-2xl text-[0.8125rem] leading-relaxed text-brand-300">{t.advisor.note}</p>
      </Section>

      {/* ─── 5. HOW IT WORKS ─────────────────────────────────────────────── */}
      <Section>
        <SectionHeading eyebrow={t.home.howEyebrow} title={t.how.title} />
        <ol className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {t.how.steps.map((step, i) => (
            <li key={step.title} className="relative">
              <div className="flex items-center gap-4">
                <span className="tabular font-display text-2xl font-bold text-accent-500">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span aria-hidden className="h-px flex-1 bg-line" />
              </div>
              <h3 className="mt-5 font-display text-h3 font-semibold">{step.title}</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* ─── 6. FEATURED PRODUCTS ────────────────────────────────────────── */}
      <Section tone="alt">
        <SectionHeading
          eyebrow={t.home.featuredEyebrow}
          title={t.featured.title}
          subtitle={t.featured.subtitle}
          action={
            featured.length > 0 ? (
              <Button href="/products" variant="outline">
                {t.catalogue.title} <ArrowRight width={16} height={16} />
              </Button>
            ) : undefined
          }
        />
        {featured.length > 0 ? (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => {
              const img = mediaUrl(p.image)
              return (
                <li key={p.id}>
                  <Link
                    href={`/products/${p.slug ?? ''}`}
                    className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface transition-[border-color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-surface-3">
                      {img && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img}
                          alt={p.name}
                          className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-display text-h3 font-semibold">{p.name}</h3>
                      <span className="mt-auto inline-flex items-center gap-2 pt-4 font-display text-sm font-semibold text-brand-600">
                        {t.catalogue.viewDetails}
                        <ArrowRight
                          width={16}
                          height={16}
                          className="transition-transform duration-200 group-hover:translate-x-1"
                        />
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : (
          <EmptyState
            icon={<BrushIcon width={22} height={22} />}
            title={t.catalogue.empty}
            action={<Button href="/request-quotation">{t.hero.quotation}</Button>}
          />
        )}
      </Section>

      {/* ─── 7. PAINTING SERVICES ────────────────────────────────────────── */}
      <Section>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="eyebrow">{t.home.servicesEyebrow}</p>
            <h2 className="mt-4 text-h2">{t.servicesIntro.title}</h2>
            <p className="mt-5 text-lead text-muted">{t.servicesIntro.body}</p>
            <div className="mt-8">
              <Button href="/painting-services" variant="outline" size="lg">
                {t.servicesIntro.cta} <ArrowRight width={16} height={16} />
              </Button>
            </div>
          </div>
          <div className="lg:col-span-7">
            {services.length > 0 ? (
              <ul className="divide-y divide-line border-y border-line">
                {services.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/painting-services/${s.slug ?? ''}`}
                      className="group flex items-start gap-5 py-6 transition-colors hover:bg-surface-2"
                    >
                      <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                        <BrushIcon width={20} height={20} />
                      </span>
                      <span className="flex-1">
                        <span className="block font-display text-h3 font-semibold">{s.name}</span>
                        {s.summary && <span className="mt-1.5 block text-[0.9375rem] text-muted">{s.summary}</span>}
                      </span>
                      <ArrowRight
                        width={18}
                        height={18}
                        className="mt-3 shrink-0 text-brand-400 transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={<BrushIcon width={22} height={22} />}
                title={t.pages.services.subtitle}
                action={<Button href="/request-quotation">{t.hero.quotation}</Button>}
              />
            )}
          </div>
        </div>
      </Section>

      {/* ─── 8. COMPLETED PROJECTS ───────────────────────────────────────── */}
      <Section tone="alt">
        <SectionHeading eyebrow={t.home.projectsEyebrow} title={t.projects.title} subtitle={t.projects.subtitle} />
        {projects.length > 0 ? (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((pr) => {
              const cover = mediaUrl(Array.isArray(pr.images) && pr.images[0] ? pr.images[0].image : null)
              return (
                <li key={pr.id} className="overflow-hidden rounded-lg border border-line bg-surface">
                  <div className="aspect-[4/3] bg-surface-3">
                    {cover && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover} alt={pr.title} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-h3 font-semibold">{pr.title}</h3>
                    {pr.location && <p className="mt-1.5 text-[0.9375rem] text-muted">{pr.location}</p>}
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <EmptyState
            icon={<LayersIcon width={22} height={22} />}
            title={t.projects.empty}
            body={t.servicesIntro.body}
            action={
              <Button href="/painting-services" variant="outline">
                {t.servicesIntro.cta}
              </Button>
            }
          />
        )}
      </Section>

      {/* ─── 9. BRANCHES ─────────────────────────────────────────────────── */}
      <Section>
        <SectionHeading
          eyebrow={t.home.branchesEyebrow}
          title={t.branches.title}
          subtitle={t.branches.subtitle}
          action={
            branches.length > 0 ? (
              <Button href="/branches" variant="outline">
                {t.branches.all} <ArrowRight width={16} height={16} />
              </Button>
            ) : undefined
          }
        />
        {branches.length > 0 ? (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {branches.map((b) => (
              <Panel as="li" key={b.id} className="p-6">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                  <PinIcon width={20} height={20} />
                </span>
                <h3 className="mt-5 font-display text-h3 font-semibold">{b.name}</h3>
                {b.region && <p className="mt-1 text-[0.9375rem] text-muted">{b.region}</p>}
                {b.phone && (
                  <a
                    href={`tel:${b.phone.replace(/\s/g, '')}`}
                    className="tabular link-quiet mt-3 inline-block font-semibold text-brand-600"
                  >
                    {b.phone}
                  </a>
                )}
                <Link
                  href={`/branches/${b.slug ?? ''}`}
                  className="group mt-5 inline-flex items-center gap-2 border-t border-line pt-5 font-display text-sm font-semibold text-ink"
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
          <EmptyState icon={<PinIcon width={22} height={22} />} title={t.branches.empty} />
        )}
      </Section>

      {/* ─── 10. TRADE & PROJECTS ────────────────────────────────────────── */}
      <Section tone="alt">
        <Panel className="overflow-hidden">
          <div className="grid grid-cols-1 items-center gap-10 p-8 sm:p-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <p className="eyebrow">{t.home.contractorEyebrow}</p>
              <h2 className="mt-4 text-h2">{t.contractorCta.title}</h2>
              <p className="mt-4 max-w-xl text-lead text-muted">{t.contractorCta.body}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:col-span-6 lg:justify-end">
              <Button href="/request-quotation">{t.contractorCta.quote}</Button>
              <Button href="/painters-contractors" variant="outline">
                {t.contractorCta.register}
              </Button>
            </div>
          </div>
        </Panel>
      </Section>

      {/* ─── 11. FINAL CTA ───────────────────────────────────────────────── */}
      <section className="bg-brand-900 text-white">
        <Container className="flex flex-col items-start gap-8 py-16 sm:py-20 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="eyebrow eyebrow-light">{t.home.finalEyebrow}</p>
            <h2 className="mt-4 text-h2 text-white">{t.finalCta.title}</h2>
            <p className="mt-4 text-lead text-white/80">{t.finalCta.body}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/request-quotation" size="lg">
              {t.finalCta.quote}
            </Button>
            <Button href={SITE.whatsappHref} external variant="outlineLight" size="lg">
              <WhatsAppIcon width={18} height={18} /> {t.finalCta.whatsapp}
            </Button>
          </div>
        </Container>
      </section>
    </>
  )
}
