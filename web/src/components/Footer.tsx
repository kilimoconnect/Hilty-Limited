import Link from 'next/link'
import type { Dictionary } from '../i18n/dictionaries'
import { SITE } from '../lib/site'
import { Container } from './ui/Container'
import { Logo } from './ui/Logo'

export function Footer({ dict }: { dict: Dictionary }) {
  const company = [
    { label: dict.nav.about, href: '/about' },
    { label: dict.nav.branches, href: '/branches' },
    { label: dict.nav.services, href: '/painting-services' },
    { label: dict.nav.painters, href: '/painters-contractors' },
  ]
  const shop = [
    { label: dict.nav.products, href: '/products' },
    { label: dict.nav.calculator, href: '/paint-calculator' },
    { label: dict.nav.projects, href: '/projects' },
    { label: dict.nav.quotation, href: '/request-quotation' },
  ]

  return (
    <footer className="mt-auto bg-brand-900 text-brand-100">
      <Container className="grid grid-cols-1 gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-xs text-sm text-brand-200">{dict.footer.tagline}</p>
        </div>

        <nav aria-label={dict.footer.company}>
          <h3 className="text-sm font-semibold text-white">{dict.footer.company}</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {company.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={dict.footer.shop}>
          <h3 className="text-sm font-semibold text-white">{dict.footer.shop}</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {shop.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="text-sm font-semibold text-white">{dict.footer.contact}</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href={SITE.phoneHref} className="hover:text-white">
                {SITE.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="hover:text-white">
                {SITE.email}
              </a>
            </li>
            <li>
              <a href={SITE.whatsappHref} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                WhatsApp
              </a>
            </li>
            <li className="pt-1 text-brand-200">{dict.footer.hours}</li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-brand-800">
        <Container className="flex flex-col gap-3 py-6 text-xs text-brand-200">
          <p>{dict.footer.disclaimer}</p>
          <p>
            © {new Date().getFullYear()} Hilty Company Limited. {dict.footer.rights}
          </p>
        </Container>
      </div>
    </footer>
  )
}
