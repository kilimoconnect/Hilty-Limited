import Link from 'next/link'
import type { Dictionary } from '../i18n/dictionaries'
import { OPENING_HOURS, SITE } from '../lib/site'
import { Container } from './ui/Container'
import { Logo } from './ui/Logo'
import { ClockIcon, MailIcon, PhoneIcon, WhatsAppIcon } from './ui/icons'

const RAIL = ['#D9C4A9', '#A9BFCB', '#9B4A3A', '#C7C9C4', '#7A5230', '#E3E0D8', '#C8D2CB', '#8C8577', '#2F5D63']

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
    { label: dict.nav.studio, href: '/design-studio' },
    { label: dict.nav.projects, href: '/projects' },
    { label: dict.nav.quotation, href: '/request-quotation' },
  ]

  return (
    <footer className="mt-auto bg-brand-900 text-brand-200">
      <Container className="grid grid-cols-1 gap-12 py-16 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8 lg:py-20">
        <div className="lg:col-span-4">
          <Logo tone="light" />
          <p className="mt-6 max-w-xs text-lead leading-relaxed text-white/80">{dict.footer.tagline}</p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <a
              href={SITE.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-white/10 px-4 font-display text-sm font-semibold text-white transition-colors hover:bg-white/20"
            >
              <WhatsAppIcon width={17} height={17} /> WhatsApp
            </a>
            <a
              href={SITE.phoneHref}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-white/10 px-4 font-display text-sm font-semibold text-white transition-colors hover:bg-white/20"
            >
              <PhoneIcon width={16} height={16} /> {dict.nav.call}
            </a>
          </div>
        </div>

        <nav aria-label={dict.footer.company} className="lg:col-span-2">
          <h2 className="font-display text-eyebrow font-semibold uppercase tracking-[0.14em] text-white">
            {dict.footer.company}
          </h2>
          <ul className="mt-5 space-y-3 text-[0.9375rem]">
            {company.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-quiet hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={dict.footer.shop} className="lg:col-span-3">
          <h2 className="font-display text-eyebrow font-semibold uppercase tracking-[0.14em] text-white">
            {dict.footer.shop}
          </h2>
          <ul className="mt-5 space-y-3 text-[0.9375rem]">
            {shop.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-quiet hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-3">
          <h2 className="font-display text-eyebrow font-semibold uppercase tracking-[0.14em] text-white">
            {dict.footer.contact}
          </h2>
          <ul className="mt-5 space-y-3.5 text-[0.9375rem]">
            <li>
              <a href={SITE.phoneHref} className="tabular flex items-center gap-2.5 font-semibold text-white">
                <PhoneIcon width={16} height={16} className="shrink-0 text-brand-300" />
                {SITE.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="flex items-center gap-2.5 hover:text-white">
                <MailIcon width={16} height={16} className="shrink-0 text-brand-300" />
                {SITE.email}
              </a>
            </li>
            <li className="flex gap-2.5">
              <ClockIcon width={16} height={16} className="mt-1 shrink-0 text-brand-300" />
              <span className="tabular space-y-0.5">
                <span className="block">{OPENING_HOURS.weekdays}</span>
                <span className="block">{OPENING_HOURS.saturday}</span>
                <span className="block text-brand-300">{OPENING_HOURS.sunday}</span>
              </span>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-4 py-8 text-[0.8125rem] leading-relaxed text-brand-300">
          <p className="max-w-3xl">{dict.footer.disclaimer}</p>
          <p>
            © {new Date().getFullYear()} Hilty Company Limited. {dict.footer.rights}
          </p>
        </Container>
      </div>

      {/* Colour card edge — the chip device closing the page. */}
      <div aria-hidden className="flex h-1.5">
        {RAIL.map((tone) => (
          <span key={tone} className="flex-1" style={{ backgroundColor: tone }} />
        ))}
      </div>
    </footer>
  )
}
