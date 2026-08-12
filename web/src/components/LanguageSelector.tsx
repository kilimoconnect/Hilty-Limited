'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import type { Locale } from '../i18n/dictionaries'
import { LOCALE_COOKIE } from '../i18n/dictionaries'

export function LanguageSelector({ locale, label }: { locale: Locale; label: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const set = (next: Locale) => {
    if (next === locale) return
    // eslint-disable-next-line react-hooks/immutability -- setting a cookie is an intentional browser side effect
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`
    startTransition(() => router.refresh())
  }

  return (
    <div className="inline-flex items-center rounded-lg border border-line" role="group" aria-label={label}>
      {(['en', 'sw'] as Locale[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => set(l)}
          aria-pressed={locale === l}
          disabled={pending}
          className={`px-2.5 py-1.5 text-xs font-semibold uppercase transition-colors ${
            locale === l ? 'bg-brand-600 text-white' : 'text-muted hover:bg-brand-50'
          } ${l === 'en' ? 'rounded-l-md' : 'rounded-r-md'}`}
        >
          {l}
        </button>
      ))}
    </div>
  )
}
