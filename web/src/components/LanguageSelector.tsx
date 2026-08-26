'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import type { Locale } from '../i18n/dictionaries'
import { LOCALE_COOKIE } from '../i18n/dictionaries'

export function LanguageSelector({
  locale,
  label,
  tone = 'light',
}: {
  locale: Locale
  label: string
  /** 'light' = on a light ground; 'dark' = on the dark utility bar or footer. */
  tone?: 'light' | 'dark'
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const set = (next: Locale) => {
    if (next === locale) return
    // eslint-disable-next-line react-hooks/immutability -- setting a cookie is an intentional browser side effect
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`
    startTransition(() => router.refresh())
  }

  const dark = tone === 'dark'

  return (
    <div
      className={`inline-flex items-center rounded-sm p-0.5 ${dark ? 'bg-white/10' : 'bg-surface-2 ring-1 ring-inset ring-line'}`}
      role="group"
      aria-label={label}
    >
      {(['en', 'sw'] as Locale[]).map((l) => {
        const active = locale === l
        return (
          <button
            key={l}
            type="button"
            onClick={() => set(l)}
            aria-pressed={active}
            disabled={pending}
            className={`rounded-[0.1875rem] px-2 py-1 font-display text-[0.6875rem] font-bold uppercase tracking-[0.1em] transition-colors ${
              active
                ? dark
                  ? 'bg-white text-brand-900'
                  : 'bg-brand-600 text-white'
                : dark
                  ? 'text-brand-200 hover:text-white'
                  : 'text-muted hover:text-ink'
            }`}
          >
            {l}
          </button>
        )
      })}
    </div>
  )
}
