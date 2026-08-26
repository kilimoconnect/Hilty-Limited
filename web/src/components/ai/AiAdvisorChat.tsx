'use client'

import { useEffect, useRef, useState } from 'react'
import type { Dictionary, Locale } from '../../i18n/dictionaries'
import { SITE } from '../../lib/site'
import { advisorChatAction } from '../../app/(frontend)/ai-advisor/actions'
import type { AdvisorResponse } from '../../lib/ai/types'
import { ArrowRight, InfoIcon, PaletteIcon, SparkIcon, WhatsAppIcon } from '../ui/icons'

type Msg = { role: 'user' | 'assistant'; content: string }

const nextHref: Record<string, string> = {
  use_calculator: '/paint-calculator',
  request_quote: '/request-quotation',
  book_visit: '/book-visit',
  find_branch: '/branches',
}

export function AiAdvisorChat({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const t = dict.advisor
  const sessionIdRef = useRef<string>('')
  const [messages, setMessages] = useState<Msg[]>([{ role: 'assistant', content: t.greeting }])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [consent, setConsent] = useState(false)
  const [last, setLast] = useState<AdvisorResponse | null>(null)
  const [error, setError] = useState(false)
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!sessionIdRef.current) sessionIdRef.current = Math.random().toString(36).slice(2)
  }, [])
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, pending])

  const send = async () => {
    const text = input.trim()
    if (!text || pending) return
    setError(false)
    const next: Msg[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setPending(true)
    try {
      const res = await advisorChatAction({ messages: next.filter((m) => m.content !== t.greeting), locale, consent, sessionId: sessionIdRef.current })
      setLast(res)
      setMessages((m) => [...m, { role: 'assistant', content: res.customer_message }])
    } catch {
      setError(true)
      setMessages((m) => [...m, { role: 'assistant', content: t.error }])
    } finally {
      setPending(false)
    }
  }

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const action = last?.suggested_next_action
  const showWhatsapp = action === 'whatsapp' || action === 'human_handoff' || last?.needs_human
  const waText = encodeURIComponent(`Hello Hilty, I was chatting with the Paint Advisor about my project.`)

  return (
    <div className="mx-auto flex max-w-3xl flex-col">
      <p className="mb-5 flex items-start gap-3 rounded-md border border-warning/20 bg-warning-bg px-4 py-3.5 text-[0.8125rem] leading-relaxed text-warning">
        <InfoIcon width={17} height={17} className="mt-0.5 shrink-0" />
        {t.disclaimer}
      </p>

      <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-soft">
        <div className="flex items-center gap-3 border-b border-line bg-surface-2 px-5 py-3.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-accent-500 text-white">
            <SparkIcon width={17} height={17} />
          </span>
          <p className="font-display text-[0.9375rem] font-semibold">{t.title}</p>
        </div>

        <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto p-5" style={{ minHeight: '46vh', maxHeight: '58vh' }} aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-4 py-3 text-[0.9375rem] leading-relaxed ${m.role === 'user' ? 'rounded-br-sm bg-brand-600 text-white' : 'rounded-bl-sm bg-surface-2 text-ink-soft'}`}>{m.content}</div>
          </div>
        ))}
        {pending && (
          <div className="flex justify-start">
            <div className="rounded-lg rounded-bl-sm bg-surface-2 px-4 py-3 text-[0.9375rem] text-muted">{t.sending}</div>
          </div>
        )}

        {/* Suggestions after the latest assistant reply */}
        {last && !pending && (
          <div className="space-y-3 border-t border-line pt-4">
            {last.recommended_products?.length > 0 && (
              <p className="text-[0.8125rem] text-muted">
                <span className="font-display font-semibold text-ink-soft">{t.recommended}:</span>{' '}
                {last.recommended_products.map((p) => p.name).join(', ')}
              </p>
            )}
            {last.safety_or_uncertainty_note && (
              <p className="text-[0.8125rem] leading-relaxed text-warning">{last.safety_or_uncertainty_note}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {action && nextHref[action] && (
                <a
                  href={nextHref[action]}
                  className="group inline-flex h-9 items-center gap-2 rounded-md bg-brand-600 px-3.5 font-display text-[0.8125rem] font-semibold text-white transition-colors hover:bg-brand-700"
                >
                  {(t.next as Record<string, string>)[action]}
                  <ArrowRight width={14} height={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </a>
              )}
              <a
                href="/design-studio"
                className="inline-flex h-9 items-center gap-2 rounded-md border border-line-strong px-3.5 font-display text-[0.8125rem] font-semibold transition-colors hover:border-brand-600 hover:text-brand-700"
              >
                <PaletteIcon width={15} height={15} className="text-accent-500" />
                {t.next.design}
              </a>
              {showWhatsapp && (
                <a
                  href={`${SITE.whatsappHref}?text=${waText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-whatsapp px-3.5 font-display text-[0.8125rem] font-semibold text-white transition-colors hover:bg-whatsapp-dark"
                >
                  <WhatsAppIcon width={15} height={15} />
                  {t.next.whatsapp}
                </a>
              )}
            </div>
          </div>
        )}
        </div>

        {/* Composer */}
        <div className="border-t border-line bg-surface-2 p-5">
          <div className="flex items-end gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              rows={2}
              placeholder={t.placeholder}
              aria-label={t.placeholder}
              className="w-full resize-none rounded-md border border-line bg-surface px-3.5 py-3 text-[0.9375rem] outline-none transition-colors placeholder:text-muted/70 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
            />
            <button
              type="button"
              onClick={send}
              disabled={pending || !input.trim()}
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-md bg-accent-500 px-5 font-display text-[0.9375rem] font-semibold text-white transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-55"
            >
              {pending ? t.sending : t.send}
            </button>
          </div>
          <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-[0.8125rem] leading-relaxed text-muted">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-brand-600)]"
            />
            {t.consent}
          </label>
          {error && <p className="mt-2 text-[0.8125rem] text-danger">{t.error}</p>}
        </div>
      </div>
    </div>
  )
}
