'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Dictionary, Locale } from '../i18n/dictionaries'
import { NAV_ITEMS, SITE } from '../lib/site'
import { Container } from './ui/Container'
import { Logo } from './ui/Logo'
import { Button } from './ui/Button'
import { LanguageSelector } from './LanguageSelector'
import { CloseIcon, MenuIcon, PhoneIcon, SearchIcon, WhatsAppIcon } from './ui/icons'

export function Header({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const links = NAV_ITEMS.filter((i) => i.key !== 'quotation')
  const label = (key: (typeof NAV_ITEMS)[number]['key']) => dict.nav[key]

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = new FormData(e.currentTarget).get('q')?.toString().trim()
    setOpen(false)
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      {/* Utility bar (desktop) */}
      <div className="hidden border-b border-line bg-surface-2 md:block">
        <Container className="flex h-9 items-center justify-between text-xs text-muted">
          <p>{dict.footer.hours}</p>
          <div className="flex items-center gap-4">
            <a href={SITE.phoneHref} className="inline-flex items-center gap-1 hover:text-brand-700">
              <PhoneIcon width={14} height={14} /> {SITE.phone}
            </a>
            <LanguageSelector locale={locale} label={dict.nav.language} />
          </div>
        </Container>
      </div>

      {/* Main bar */}
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label={SITE.name}>
          <Logo />
        </Link>

        {/* Desktop search */}
        <form onSubmit={onSearch} role="search" className="hidden flex-1 max-w-sm lg:flex">
          <label htmlFor="site-search" className="sr-only">
            {dict.nav.search}
          </label>
          <div className="flex w-full items-center rounded-lg border border-line bg-surface px-3">
            <SearchIcon width={18} height={18} className="text-muted" />
            <input
              id="site-search"
              name="q"
              type="search"
              placeholder={dict.nav.searchPlaceholder}
              className="w-full bg-transparent px-2 py-2 text-sm outline-none"
            />
          </div>
        </form>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          <a
            href={SITE.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={dict.nav.whatsapp}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#128C7E] hover:bg-brand-50"
          >
            <WhatsAppIcon />
          </a>
          <Button href="/request-quotation" size="sm">
            {dict.nav.quotation}
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? dict.nav.close : dict.nav.menu}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </Container>

      {/* Desktop nav row */}
      <nav aria-label="Primary" className="hidden border-t border-line bg-surface md:block">
        <Container>
          <ul className="flex flex-wrap gap-x-6 gap-y-1 py-2 text-sm font-medium">
            {links.map((item) => {
              const active = pathname === item.href
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`inline-block py-1 ${active ? 'text-brand-700' : 'text-ink hover:text-brand-700'}`}
                  >
                    {label(item.key)}
                  </Link>
                </li>
              )
            })}
          </ul>
        </Container>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-nav" className="md:hidden">
          <Container className="space-y-4 border-t border-line py-4">
            <form onSubmit={onSearch} role="search">
              <label htmlFor="m-search" className="sr-only">
                {dict.nav.search}
              </label>
              <div className="flex items-center rounded-lg border border-line px-3">
                <SearchIcon width={18} height={18} className="text-muted" />
                <input
                  id="m-search"
                  name="q"
                  type="search"
                  placeholder={dict.nav.searchPlaceholder}
                  className="w-full bg-transparent px-2 py-2.5 text-sm outline-none"
                />
              </div>
            </form>

            <ul className="divide-y divide-line rounded-lg border border-line">
              {NAV_ITEMS.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block px-3 py-3 text-sm font-medium text-ink hover:bg-brand-50"
                  >
                    {label(item.key)}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-2">
              <Button href={SITE.whatsappHref} external variant="whatsapp" size="sm">
                <WhatsAppIcon width={16} height={16} /> {dict.nav.whatsapp}
              </Button>
              <Button href={SITE.phoneHref} external variant="outline" size="sm">
                <PhoneIcon width={16} height={16} /> {dict.nav.call}
              </Button>
              <LanguageSelector locale={locale} label={dict.nav.language} />
            </div>
          </Container>
        </div>
      )}
    </header>
  )
}
