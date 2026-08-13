import type { Metadata } from 'next'
import { getDictionary } from '../../../i18n/dictionaries'
import { getLocale } from '../../../i18n/locale'
import { getCompletedProjects } from '../../../lib/payload'
import { mediaUrl, relName } from '../../../lib/format'
import { Section, SectionHeading } from '../../../components/ui/Section'

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getLocale())
  return { title: t.pages.projects.title, description: t.pages.projects.subtitle }
}

export default async function ProjectsPage() {
  const t = getDictionary(await getLocale())
  const projects = await getCompletedProjects(30)

  return (
    <Section>
      <SectionHeading title={t.pages.projects.title} subtitle={t.pages.projects.subtitle} />
      {projects.length === 0 ? (
        <p className="text-muted">{t.pages.projects.empty}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {projects.map((pr) => {
            const before = mediaUrl(pr.beforeImage)
            const after = mediaUrl(pr.afterImage) || mediaUrl(Array.isArray(pr.images) && pr.images[0] ? pr.images[0].image : null)
            const products = (pr.productsUsed ?? []).map(relName).filter(Boolean)
            const testimonial = pr.client?.testimonial && pr.client?.consent?.given ? pr.client.testimonial : null
            return (
              <li key={pr.id} className="overflow-hidden rounded-2xl border border-line bg-surface">
                {(before || after) && (
                  <div className="grid grid-cols-2">
                    <figure className="relative">
                      <div className="aspect-[4/3] bg-brand-50">
                        {before && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={before} alt={`${pr.title} — ${t.pages.projects.before}`} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <figcaption className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-[11px] text-white">
                        {t.pages.projects.before}
                      </figcaption>
                    </figure>
                    <figure className="relative">
                      <div className="aspect-[4/3] bg-brand-100">
                        {after && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={after} alt={`${pr.title} — ${t.pages.projects.after}`} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <figcaption className="absolute left-2 top-2 rounded bg-brand-700 px-2 py-0.5 text-[11px] text-white">
                        {t.pages.projects.after}
                      </figcaption>
                    </figure>
                  </div>
                )}
                <div className="space-y-3 p-5">
                  <h3 className="text-lg font-bold">{pr.title}</h3>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    {pr.location && (
                      <>
                        <dt className="text-muted">{t.pages.projects.location}</dt>
                        <dd>{pr.location}</dd>
                      </>
                    )}
                    {pr.projectType && (
                      <>
                        <dt className="text-muted">{t.pages.projects.type}</dt>
                        <dd>{pr.projectType}</dd>
                      </>
                    )}
                    {products.length > 0 && (
                      <>
                        <dt className="text-muted">{t.pages.projects.products}</dt>
                        <dd>{products.join(', ')}</dd>
                      </>
                    )}
                    {pr.completionDate && (
                      <>
                        <dt className="text-muted">{t.pages.projects.completed}</dt>
                        <dd>{new Date(pr.completionDate).toLocaleDateString()}</dd>
                      </>
                    )}
                  </dl>
                  {pr.scope && <p className="text-sm text-muted">{pr.scope}</p>}
                  {testimonial && (
                    <blockquote className="border-l-2 border-brand-300 pl-3 text-sm italic text-muted">
                      “{testimonial}”
                      {pr.client?.name && <cite className="mt-1 block not-italic">— {pr.client.name}</cite>}
                    </blockquote>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Section>
  )
}
