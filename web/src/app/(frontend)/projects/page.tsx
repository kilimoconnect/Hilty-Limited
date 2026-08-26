import type { Metadata } from 'next'
import { getDictionary } from '../../../i18n/dictionaries'
import { getLocale } from '../../../i18n/locale'
import { getCompletedProjects } from '../../../lib/payload'
import { mediaUrl, relName } from '../../../lib/format'
import { Button } from '../../../components/ui/Button'
import { Container } from '../../../components/ui/Container'
import { EmptyState } from '../../../components/ui/EmptyState'
import { PageHeader } from '../../../components/ui/PageHeader'
import { LayersIcon } from '../../../components/ui/icons'

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getLocale())
  return { title: t.pages.projects.title, description: t.pages.projects.subtitle }
}

export default async function ProjectsPage() {
  const t = getDictionary(await getLocale())
  const projects = await getCompletedProjects(30)

  return (
    <>
      <PageHeader
        eyebrow={t.home.projectsEyebrow}
        title={t.pages.projects.title}
        lead={t.pages.projects.subtitle}
        breadcrumb={[
          { label: t.nav.home, href: '/' },
          { label: t.nav.projects, href: '/projects' },
        ]}
      />

      <Container className="py-14 lg:py-20">
        {projects.length === 0 ? (
          <EmptyState
            icon={<LayersIcon width={22} height={22} />}
            title={t.pages.projects.empty}
            body={t.servicesIntro.body}
            action={
              <>
                <Button href="/painting-services">{t.servicesIntro.cta}</Button>
                <Button href="/request-quotation" variant="outline">
                  {t.hero.quotation}
                </Button>
              </>
            }
          />
        ) : (
          <ul className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {projects.map((pr) => {
              const before = mediaUrl(pr.beforeImage)
              const after =
                mediaUrl(pr.afterImage) || mediaUrl(Array.isArray(pr.images) && pr.images[0] ? pr.images[0].image : null)
              const products = (pr.productsUsed ?? []).map(relName).filter(Boolean)
              const testimonial = pr.client?.testimonial && pr.client?.consent?.given ? pr.client.testimonial : null

              const facts: { label: string; value: string }[] = [
                ...(pr.location ? [{ label: t.pages.projects.location, value: pr.location }] : []),
                ...(pr.projectType ? [{ label: t.pages.projects.type, value: pr.projectType }] : []),
                ...(products.length > 0 ? [{ label: t.pages.projects.products, value: products.join(', ') }] : []),
                ...(pr.completionDate
                  ? [{ label: t.pages.projects.completed, value: new Date(pr.completionDate).toLocaleDateString() }]
                  : []),
              ]

              return (
                <li key={pr.id} className="overflow-hidden rounded-lg border border-line bg-surface">
                  {(before || after) && (
                    <div className="grid grid-cols-2 gap-px bg-line">
                      <figure className="relative bg-surface">
                        <div className="aspect-[4/3] bg-surface-3">
                          {before && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={before}
                              alt={`${pr.title} — ${t.pages.projects.before}`}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <figcaption className="absolute left-3 top-3 rounded-sm bg-ink/75 px-2 py-1 font-display text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-white backdrop-blur">
                          {t.pages.projects.before}
                        </figcaption>
                      </figure>
                      <figure className="relative bg-surface">
                        <div className="aspect-[4/3] bg-surface-3">
                          {after && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={after}
                              alt={`${pr.title} — ${t.pages.projects.after}`}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <figcaption className="absolute left-3 top-3 rounded-sm bg-accent-500 px-2 py-1 font-display text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-white">
                          {t.pages.projects.after}
                        </figcaption>
                      </figure>
                    </div>
                  )}

                  <div className="p-6 sm:p-8">
                    <h2 className="text-h2">{pr.title}</h2>

                    {facts.length > 0 && (
                      <dl className="mt-6 divide-y divide-line border-y border-line text-[0.9375rem]">
                        {facts.map((f) => (
                          <div key={f.label} className="grid grid-cols-3 gap-4 py-3">
                            <dt className="font-display text-[0.8125rem] font-semibold uppercase tracking-[0.06em] text-muted">
                              {f.label}
                            </dt>
                            <dd className="col-span-2 text-ink-soft">{f.value}</dd>
                          </div>
                        ))}
                      </dl>
                    )}

                    {pr.scope && <p className="mt-5 leading-relaxed text-muted">{pr.scope}</p>}

                    {testimonial && (
                      <blockquote className="mt-6 border-l-2 border-accent-300 bg-surface-2 px-5 py-4 text-[0.9375rem] leading-relaxed text-ink-soft">
                        <p>“{testimonial}”</p>
                        {pr.client?.name && (
                          <cite className="mt-2 block font-display text-[0.8125rem] font-semibold not-italic text-muted">
                            — {pr.client.name}
                          </cite>
                        )}
                      </blockquote>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Container>
    </>
  )
}
