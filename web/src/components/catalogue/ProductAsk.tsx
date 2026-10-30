'use client'

import { useState } from 'react'
import type { Dictionary, Locale } from '../../i18n/dictionaries'
import { SITE } from '../../lib/site'
import { askProductAction } from '../../app/(frontend)/products/[slug]/actions'
import { InfoIcon, SparkIcon, WhatsAppIcon } from '../ui/icons'

type QA = { q: string; a: string; needsHuman?: boolean }

export function ProductAsk({
  productId,
  productName,
  dict,
  locale,
}: {
  productId: number
  productName: string
  dict: Dictionary
  locale: Locale
}) {
  const t = dict.product
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [thread, setThread] = useState<QA[]>([])
  const [error, setError] = useState(false)

  const ask = async (question: string) => {
    const q = question.trim()
    if (!q || pending) return
    setError(false)
    setPending(true)
    setInput('')
    try {
      const res = await askProductAction({ productId, productName, question: q, locale })
      setThread((prev) => [...prev, { q, a: res.answer || t.askError, needsHuman: res.needsHuman }])
    } catch {
      setError(true)
      setThread((prev) => [...prev, { q, a: t.askError }])
    } finally {
      setPending(false)
    }
  }

  const waText = encodeURIComponent(
    locale === 'sw'
      ? `Habari Hilty, naomba kujua kuhusu: ${productName}`
      : `Hello Hilty, I'd like to ask about: ${productName}`,
  )
  const showWhatsapp = thread.some((x) => x.needsHuman)

  return (
    <section className="rounded-lg border border-line bg-surface-2 p-6 sm:p-7">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-accent-500 text-white">
          <SparkIcon width={18} height={18} />
        </span>
        <div>
          <h2 className="font-display text-h3 font-semibold leading-tight">{t.askTitle}</h2>
        </div>
      </div>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">{t.askLead}</p>

      {thread.length > 0 && (
        <div className="mt-6 space-y-5">
          {thread.map((qa, i) => (
            <div key={i} className="space-y-2.5">
              <p className="flex items-start gap-2 font-display text-[0.9375rem] font-semibold text-ink">
                <span className="text-brand-500">Q.</span>
                {qa.q}
              </p>
              <p className="whitespace-pre-wrap rounded-md border border-line bg-surface px-4 py-3.5 text-[0.9375rem] leading-relaxed text-ink-soft">
                {qa.a}
              </p>
            </div>
          ))}
        </div>
      )}

      {pending && <p className="mt-5 text-[0.9375rem] text-muted">{t.askSending}</p>}

      {thread.length === 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {(t.askSuggestions as readonly string[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => ask(s)}
              disabled={pending}
              className="rounded-full border border-line-strong bg-surface px-3.5 py-2 text-[0.8125rem] font-medium text-ink-soft transition-colors hover:border-brand-500 hover:text-brand-700 disabled:opacity-55"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-end gap-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              ask(input)
            }
          }}
          rows={2}
          placeholder={t.askPlaceholder}
          aria-label={t.askTitle}
          className="w-full resize-none rounded-md border border-line bg-surface px-3.5 py-3 text-[0.9375rem] outline-none transition-colors placeholder:text-muted/70 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
        />
        <button
          type="button"
          onClick={() => ask(input)}
          disabled={pending || !input.trim()}
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-md bg-accent-500 px-5 font-display text-[0.9375rem] font-semibold text-white transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-55"
        >
          {pending ? t.askSending : t.askSend}
        </button>
      </div>

      {showWhatsapp && (
        <a
          href={`${SITE.whatsappHref}?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-whatsapp px-4 font-display text-[0.8125rem] font-semibold text-white transition-colors hover:bg-whatsapp-dark"
        >
          <WhatsAppIcon width={15} height={15} />
          {dict.advisor.next.whatsapp}
        </a>
      )}

      {error && <p className="mt-3 text-[0.8125rem] text-danger">{t.askError}</p>}

      <p className="mt-5 flex items-start gap-2 text-[0.75rem] leading-relaxed text-muted">
        <InfoIcon width={14} height={14} className="mt-0.5 shrink-0" />
        {t.askDisclaimer}
      </p>
    </section>
  )
}
