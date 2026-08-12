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
import { ArrowRight, CheckIcon, PinIcon, WhatsAppIcon } from '../../components/ui/icons'

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

  return (
    <>
      {/* 1. HERO */}
      <section className="bg-gradient-to-br from-brand-800 to-brand-600 text-white">
        <Container className="py-16 sm:py-24">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              {t.hero.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base text-brand-100 sm:text-lg">{t.hero.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/request-quotation" variant="accent" size="lg">
                {t.hero.quotation}
              </Button>
              <Button href="/paint-calculator" variant="light" size="lg">
                {t.hero.calculate}
              </Button>
              <Button href="/products" variant="outlineLight" size="lg">
                {t.hero.browse}
              </Button>
              <Button href="/ai-advisor" variant="outlineLight" size="lg">
                {t.hero.advisor}
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. TRUST */}
      <Section>
        <SectionHeading title={t.trust.title} />
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[t.trust.genuine, t.trust.outlets, t.trust.guidance, t.trust.support].map((item) => (
            <li key={item.title} className="rounded-xl border border-line bg-surface p-5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <CheckIcon />
              </span>
              <h3 className="mt-3 font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* 3. PRODUCT CATEGORIES */}
      {categories.length > 0 && (
        <Section alt>
          <SectionHeading title={t.categories.title} subtitle={t.categories.subtitle} />
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/products?category=${c.key}`}
                  className="group flex h-full items-center justify-between gap-2 rounded-xl border border-line bg-surface p-4 hover:border-brand-300 hover:bg-brand-50"
                >
                  <span className="font-medium">{c.name}</span>
                  <ArrowRight width={18} height={18} className="text-brand-600 transition group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* 4. HOW HILTY HELPS */}
      <Section>
        <SectionHeading title={t.how.title} />
        <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.how.steps.map((step, i) => (
            <li key={step.title} className="rounded-xl border border-line bg-surface p-5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {i + 1}
              </span>
              <h3 className="mt-3 font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* 5. FEATURED PRODUCTS */}
      <Section alt>
        <SectionHeading title={t.featured.title} subtitle={t.featured.subtitle} />
        {featured.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => {
              const img = mediaUrl(p.image)
              return (
                <li key={p.id} className="overflow-hidden rounded-xl border border-line bg-surface">
                  <div className="aspect-[4/3] bg-brand-50">
                    {img && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={p.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{p.name}</h3>
                    <Link href={`/products/${p.slug ?? ''}`} className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-700">
                      View details <ArrowRight width={16} height={16} />
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-line bg-surface p-8 text-center text-muted">
            <p>{t.featured.empty}</p>
            <div className="mt-4">
              <Button href="/request-quotation" variant="outline">
                {t.hero.quotation}
              </Button>
            </div>
          </div>
        )}
      </Section>

      {/* 6. PAINTING SERVICES INTRO */}
      <Section>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading title={t.servicesIntro.title} subtitle={t.servicesIntro.body} />
            <Button href="/painting-services">{t.servicesIntro.cta}</Button>
          </div>
          {services.length > 0 && (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {services.map((s) => (
                <li key={s.id} className="rounded-xl border border-line bg-surface p-4">
                  <h3 className="font-semibold">{s.name}</h3>
                  {s.summary && <p className="mt-1 text-sm text-muted">{s.summary}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Section>

      {/* 7. PROJECT & CONTRACTOR CTA */}
      <section className="bg-brand-700 text-white">
        <Container className="flex flex-col items-start gap-5 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold">{t.contractorCta.title}</h2>
            <p className="mt-2 text-brand-100">{t.contractorCta.body}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/request-quotation" variant="accent">
              {t.contractorCta.quote}
            </Button>
            <Button href="/painters-contractors" variant="outlineLight">
              {t.contractorCta.register}
            </Button>
          </div>
        </Container>
      </section>

      {/* 8. BRANCH SUMMARY */}
      <Section alt>
        <SectionHeading title={t.branches.title} subtitle={t.branches.subtitle} />
        {branches.length > 0 ? (
          <>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {branches.map((b) => (
                <li key={b.id} className="rounded-xl border border-line bg-surface p-5">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <PinIcon />
                  </span>
                  <h3 className="mt-3 font-semibold">{b.name}</h3>
                  {b.region && <p className="text-sm text-muted">{b.region}</p>}
                  {b.phone && (
                    <a href={`tel:${b.phone.replace(/\s/g, '')}`} className="mt-2 inline-block text-sm text-brand-700">
                      {b.phone}
                    </a>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Button href="/branches" variant="outline">
                {t.branches.all}
              </Button>
            </div>
          </>
        ) : (
          <p className="text-muted">{t.branches.empty}</p>
        )}
      </Section>

      {/* 9. COMPLETED PROJECTS (real only) */}
      <Section>
        <SectionHeading title={t.projects.title} subtitle={t.projects.subtitle} />
        {projects.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((pr) => {
              const cover = mediaUrl(Array.isArray(pr.images) && pr.images[0] ? pr.images[0].image : null)
              return (
                <li key={pr.id} className="overflow-hidden rounded-xl border border-line bg-surface">
                  <div className="aspect-[4/3] bg-brand-50">
                    {cover && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover} alt={pr.title} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{pr.title}</h3>
                    {pr.location && <p className="mt-1 text-sm text-muted">{pr.location}</p>}
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-muted">{t.projects.empty}</p>
        )}
      </Section>

      {/* 10. AI PAINT ADVISOR */}
      <Section alt>
        <div className="rounded-2xl border border-line bg-surface p-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold">{t.advisor.title}</h2>
            <p className="mt-2 text-muted">{t.advisor.body}</p>
            <div className="mt-5">
              <Button href="/ai-advisor">{t.advisor.cta}</Button>
            </div>
            <p className="mt-3 text-xs text-muted">{t.advisor.note}</p>
          </div>
        </div>
      </Section>

      {/* 11. FINAL WHATSAPP & QUOTATION CTA */}
      <section className="bg-brand-900 text-white">
        <Container className="flex flex-col items-start gap-5 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">{t.finalCta.title}</h2>
            <p className="mt-2 text-brand-100">{t.finalCta.body}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/request-quotation" variant="accent">
              {t.finalCta.quote}
            </Button>
            <Button href={SITE.whatsappHref} external variant="whatsapp">
              <WhatsAppIcon width={18} height={18} /> {t.finalCta.whatsapp}
            </Button>
          </div>
        </Container>
      </section>
    </>
  )
}
