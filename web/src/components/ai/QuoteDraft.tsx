'use client'

import { useState } from 'react'
import type { Dictionary, Locale } from '../../i18n/dictionaries'
import { SITE } from '../../lib/site'
import { quoteDraftAction } from '../../app/(frontend)/ai-estimate/actions'
import type { AdvisorResponse } from '../../lib/ai/types'
import { ArrowRight, InfoIcon, PaletteIcon, WhatsAppIcon } from '../ui/icons'

export function QuoteDraft({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const t = dict.pages.estimate
  const [desc, setDesc] = useState('')
  const [pending, setPending] = useState(false)
  const [res, setRes] = useState<AdvisorResponse | null>(null)
  const [error, setError] = useState(false)

  const generate = async () => {
    const d = desc.trim()
    if (!d || pending) return
    setError(false)
    setPending(true)
    try {
      const r = await quoteDraftAction({ description: d, locale })
      setRes(r)
    } catch {
      setError(true)
    } finally {
      setPending(false)
    }
  }

  const waText = encodeURIComponent(
    (locale === 'sw' ? 'Habari Hilty, naomba nukuu kwa mradi huu:\n' : 'Hello Hilty, I would like a quotation for this project:\n') +
      (res?.project_summary || desc),
  )

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12">
      {/* Input */}
      <div className="lg:col-span-2">
        <label htmlFor="estimate-desc" className="font-display text-[0.9375rem] font-semibold">
          {t.label}
        </label>
        <textarea
          id="estimate-desc"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={7}
          placeholder={t.placeholder}
          className="mt-3 w-full resize-none rounded-md border border-line bg-surface px-4 py-3.5 text-[0.9375rem] leading-relaxed outline-none transition-colors placeholder:text-muted/70 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
        />
        <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-muted">{t.hint}</p>
        <button
          type="button"
          onClick={generate}
          disabled={pending || !desc.trim()}
          className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-accent-500 px-5 font-display text-[0.9375rem] font-semibold text-white transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto"
        >
          <PaletteIcon width={17} height={17} />
          {pending ? t.generating : t.generate}
        </button>
        {error && <p className="mt-3 text-[0.8125rem] text-danger">{t.error}</p>}
      </div>

      {/* Draft output */}
      <div className="lg:col-span-3">
        <div className="rounded-lg border border-line bg-surface-2 p-6 sm:p-8">
          <h2 className="font-display text-h3 font-semibold">{t.draftTitle}</h2>

          {!res && !pending && <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted">{t.subtitle}</p>}
          {pending && <p className="mt-4 text-[0.9375rem] text-muted">{t.generating}</p>}

          {res && !pending && (
            <div className="mt-5 space-y-6">
              <p className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-ink-soft">{res.customer_message}</p>

              {res.recommended_system_steps?.length > 0 && (
                <div>
                  <p className="font-display text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-muted">
                    {t.planLabel}
                  </p>
                  <ol className="mt-3 space-y-2.5">
                    {res.recommended_system_steps.map((s, i) => (
                      <li key={i} className="flex gap-3 text-[0.875rem] leading-relaxed text-ink-soft">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 font-display text-[0.6875rem] font-semibold text-brand-700">
                          {i + 1}
                        </span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {res.recommended_products?.length > 0 && (
                <div>
                  <p className="font-display text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-muted">
                    {t.productsLabel}
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {res.recommended_products.map((p, i) => (
                      <a
                        key={i}
                        href={`/products?q=${encodeURIComponent(p.name)}`}
                        className="group flex items-start gap-3 rounded-md border border-line bg-surface p-3.5 transition-colors hover:border-brand-300"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block font-display text-[0.875rem] font-semibold leading-snug text-ink">
                            {p.name}
                          </span>
                          {p.why && <span className="mt-0.5 block text-[0.8125rem] leading-relaxed text-muted">{p.why}</span>}
                        </span>
                        <ArrowRight width={14} height={14} className="mt-1 shrink-0 text-brand-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {res.missing_information?.length > 0 && (
                <div className="rounded-md border border-line bg-surface px-4 py-3.5">
                  <p className="font-display text-[0.8125rem] font-semibold text-ink-soft">{t.missingLabel}:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.875rem] leading-relaxed text-muted">
                    {res.missing_information.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-3 border-t border-line pt-5">
                <a
                  href={`${SITE.whatsappHref}?text=${waText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-md bg-whatsapp px-5 font-display text-[0.9375rem] font-semibold text-white transition-colors hover:bg-whatsapp-dark"
                >
                  <WhatsAppIcon width={17} height={17} />
                  {t.sendWhatsapp}
                </a>
                <a
                  href="/request-quotation"
                  className="inline-flex h-11 items-center gap-2 rounded-md border border-line-strong bg-surface px-5 font-display text-[0.9375rem] font-semibold transition-colors hover:border-brand-600 hover:text-brand-700"
                >
                  {t.requestQuote}
                  <ArrowRight width={15} height={15} />
                </a>
              </div>
            </div>
          )}

          <p className="mt-6 flex items-start gap-2 border-t border-line pt-5 text-[0.75rem] leading-relaxed text-muted">
            <InfoIcon width={14} height={14} className="mt-0.5 shrink-0" />
            {t.disclaimer}
          </p>
        </div>
      </div>
    </div>
  )
}
