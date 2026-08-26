'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { Dictionary, Locale } from '../i18n/dictionaries'
import { NAV_ITEMS, PRIMARY_NAV, SITE, UTILITY_NAV } from '../lib/site'
import { Container } from './ui/Container'
import { Logo } from './ui/Logo'
import { Button } from './ui/Button'
import { LanguageSelector } from './LanguageSelector'
import { CloseIcon, MailIcon, MenuIcon, PhoneIcon, SearchIcon, WhatsAppIcon } from './ui/icons'

export function Header({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const pathname = usePathname()
  const router = useRouter()

  const label = (key: (typeof NAV_ITEMS)[number]['key']) => dict.nav[key]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeAll = () => {
    setOpen(false)
    setSearchOpen(false)
  }

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = new FormData(e.currentTarget).get('q')?.toString().trim()
    setOpen(false)
    setSearchOpen(false)
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
  }

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  return (
    <header className="sticky top-0 z-40">
      {/* Utility bar — hours, trade routes, contact, language. */}
      <div className="hidden bg-brand-900 text-brand-200 lg:block">
        <Container className="flex h-10 items-center justify-between text-[0.8125rem]">
          <p className="tabular">{dict.footer.hours}</p>
          <div className="flex items-center gap-6">
            {UTILITY_NAV.map((item) => (
              <Link key={item.key} href={item.href} onClick={closeAll} className="link-quiet hover:text-white">
                {label(item.key)}
              </Link>
            ))}
            <a href={SITE.phoneHref} className="inline-flex items-center gap-1.5 font-semibold text-white">
              <PhoneIcon width={14} height={14} /> <span className="tabular">{SITE.phone}</span>
            </a>
            <LanguageSelector locale={locale} label={dict.nav.language} tone="dark" />
          </div>
        </Container>
      </div>

      {/* Main bar */}
      <div
        className={`border-b bg-surface/95 backdrop-blur transition-shadow duration-300 ${
          scrolled ? 'border-line shadow-soft' : 'border-line/60'
        }`}
      >
        <Container className="flex h-[4.5rem] items-center justify-between gap-6">
          <Link href="/" aria-label={SITE.name} className="shrink-0">
            <Logo />
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-7 font-display text-[0.9375rem] font-medium">
              {PRIMARY_NAV.map((item) => {
                const active = isActive(item.href)
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      onClick={closeAll}
                      aria-current={active ? 'page' : undefined}
                      className={`relative inline-block py-1 transition-colors ${
                        active ? 'text-ink' : 'text-ink-soft hover:text-brand-600'
                      }`}
                    >
                      {label(item.key)}
                      <span
                        aria-hidden
                        className={`absolute -bottom-0.5 left-0 h-0.5 w-full origin-left rounded-full bg-accent-500 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          active ? 'scale-x-100' : 'scale-x-0'
                        }`}
                      />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-expanded={searchOpen}
              aria-controls="site-search-panel"
              aria-label={dict.nav.search}
              className="hidden h-10 w-10 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-surface-2 hover:text-brand-600 lg:inline-flex"
            >
              <SearchIcon />
            </button>
            <a
              href={SITE.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={dict.nav.whatsapp}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-whatsapp transition-colors hover:bg-surface-2"
            >
              <WhatsAppIcon />
            </a>
            <span className="hidden sm:block">
              <Button href="/request-quotation" size="sm">
                {dict.nav.quotation}
              </Button>
            </span>

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-ink transition-colors hover:bg-surface-2 lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? dict.nav.close : dict.nav.menu}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </Container>

        {/* Search drops in under the bar rather than competing with the nav for width. */}
        {searchOpen && (
          <div id="site-search-panel" className="border-t border-line bg-surface-2">
            <Container className="py-4">
              <form onSubmit={onSearch} role="search" className="flex items-center gap-3">
                <label htmlFor="site-search" className="sr-only">
                  {dict.nav.search}
                </label>
                <div className="flex flex-1 items-center gap-3 rounded-md border border-line bg-surface px-4">
                  <SearchIcon width={18} height={18} className="shrink-0 text-muted" />
                  <input
                    ref={searchRef}
                    id="site-search"
                    name="q"
                    type="search"
                    placeholder={dict.nav.searchPlaceholder}
                    className="h-11 w-full bg-transparent text-[0.9375rem] outline-none placeholder:text-muted/80"
                  />
                </div>
                <Button size="md" className="shrink-0">
                  {dict.nav.search}
                </Button>
              </form>
            </Container>
          </div>
        )}
      </div>

      {/* Mobile drawer */}
      {open && (
        <div id="mobile-nav" className="max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-b border-line bg-surface lg:hidden">
          <Container className="space-y-6 py-6">
            <form onSubmit={onSearch} role="search">
              <label htmlFor="m-search" className="sr-only">
                {dict.nav.search}
              </label>
              <div className="flex items-center gap-3 rounded-md border border-line bg-surface-2 px-4">
                <SearchIcon width={18} height={18} className="shrink-0 text-muted" />
                <input
                  id="m-search"
                  name="q"
                  type="search"
                  placeholder={dict.nav.searchPlaceholder}
                  className="h-11 w-full bg-transparent text-[0.9375rem] outline-none placeholder:text-muted/80"
                />
              </div>
            </form>

            <nav aria-label="Mobile">
              <ul className="-mx-2">
                {NAV_ITEMS.filter((i) => i.key !== 'quotation').map((item) => {
                  const active = isActive(item.href)
                  return (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        onClick={closeAll}
                        aria-current={active ? 'page' : undefined}
                        className={`flex items-center justify-between rounded-md px-2 py-3 font-display text-base font-medium transition-colors ${
                          active ? 'bg-brand-50 text-brand-700' : 'text-ink hover:bg-surface-2'
                        }`}
                      >
                        {label(item.key)}
                        {active && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent-500" />}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button href="/request-quotation" size="md">
                {dict.nav.quotation}
              </Button>
              <Button href={SITE.whatsappHref} external variant="whatsapp" size="md">
                <WhatsAppIcon width={18} height={18} /> {dict.nav.whatsapp}
              </Button>
            </div>

            <div className="space-y-3 border-t border-line pt-6 text-sm text-muted">
              <a href={SITE.phoneHref} className="flex items-center gap-2.5 text-ink">
                <PhoneIcon width={16} height={16} className="text-brand-500" />
                <span className="tabular font-semibold">{SITE.phone}</span>
              </a>
              <a href={`mailto:${SITE.email}`} className="flex items-center gap-2.5 text-ink">
                <MailIcon width={16} height={16} className="text-brand-500" />
                {SITE.email}
              </a>
              <p className="tabular pt-1">{dict.footer.hours}</p>
              <div className="pt-2">
                <LanguageSelector locale={locale} label={dict.nav.language} />
              </div>
            </div>
          </Container>
        </div>
      )}
    </header>
  )
}
