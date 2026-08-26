import type { Metadata } from 'next'
import { getDictionary } from '../../../i18n/dictionaries'
import { getLocale } from '../../../i18n/locale'
import { Button } from '../../../components/ui/Button'
import { Container } from '../../../components/ui/Container'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Panel } from '../../../components/ui/Panel'
import { LayersIcon, UsersIcon } from '../../../components/ui/icons'

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getLocale())
  return { title: t.pages.pro.title, description: t.pages.pro.subtitle }
}

export default async function ProPage() {
  const t = getDictionary(await getLocale())

  const routes = [
    {
      icon: <UsersIcon width={22} height={22} />,
      title: t.pages.pro.registerTitle,
      body: t.pages.pro.registerBody,
      cta: t.pages.pro.register,
      href: '/painters-contractors/register',
    },
    {
      icon: <LayersIcon width={22} height={22} />,
      title: t.pages.pro.applyTitle,
      body: t.pages.pro.applyBody,
      cta: t.pages.pro.apply,
      href: '/painters-contractors/apply',
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow={t.home.contractorEyebrow}
        title={t.pages.pro.title}
        lead={t.pages.pro.subtitle}
        breadcrumb={[
          { label: t.nav.home, href: '/' },
          { label: t.nav.painters, href: '/painters-contractors' },
        ]}
      />

      <Container className="py-14 lg:py-20">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {routes.map((r) => (
            <Panel key={r.href} className="flex flex-col p-8 sm:p-10">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-accent-50 text-accent-500">
                {r.icon}
              </span>
              <h2 className="mt-6 text-h2">{r.title}</h2>
              <p className="mt-4 flex-1 text-lead text-muted">{r.body}</p>
              <div className="mt-8">
                <Button href={r.href} size="lg">
                  {r.cta}
                </Button>
              </div>
            </Panel>
          ))}
        </div>
      </Container>
    </>
  )
}
