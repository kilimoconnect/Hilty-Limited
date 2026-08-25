'use client'

import { useEffect, useRef, useState } from 'react'
import type { Dictionary, Locale } from '../../i18n/dictionaries'
import { SITE } from '../../lib/site'
import { advisorChatAction } from '../../app/(frontend)/ai-advisor/actions'
import type { AdvisorResponse } from '../../lib/ai/types'

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
    <div className="mx-auto flex max-w-2xl flex-col">
      <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">{t.disclaimer}</div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-line bg-surface p-4" style={{ minHeight: '50vh', maxHeight: '60vh' }} aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-surface-2 text-ink'}`}>{m.content}</div>
          </div>
        ))}
        {pending && <div className="flex justify-start"><div className="rounded-2xl bg-surface-2 px-4 py-2 text-sm text-muted">{t.sending}</div></div>}

        {/* Suggestions after the latest assistant reply */}
        {last && !pending && (
          <div className="space-y-2 pt-1">
            {last.recommended_products?.length > 0 && (
              <p className="text-xs text-muted">
                {t.recommended}: {last.recommended_products.map((p) => p.name).join(', ')}
              </p>
            )}
            {last.safety_or_uncertainty_note && <p className="text-xs text-amber-700">{last.safety_or_uncertainty_note}</p>}
            <div className="flex flex-wrap gap-2">
              {action && nextHref[action] && (
                <a href={nextHref[action]} className="rounded-lg border border-brand-600 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50">
                  {(t.next as Record<string, string>)[action]}
                </a>
              )}
              <a href="/design-studio" className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium hover:bg-brand-50">{t.next.design}</a>
              {showWhatsapp && (
                <a href={`${SITE.whatsappHref}?text=${waText}`} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white">
                  {t.next.whatsapp}
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="mt-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            rows={2}
            placeholder={t.placeholder}
            aria-label={t.placeholder}
            className="w-full resize-none rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand-400"
          />
          <button type="button" onClick={send} disabled={pending || !input.trim()} className="shrink-0 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {pending ? t.sending : t.send}
          </button>
        </div>
        <label className="mt-2 flex items-start gap-2 text-xs text-muted">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
          {t.consent}
        </label>
        {error && <p className="mt-1 text-xs text-red-600">{t.error}</p>}
      </div>
    </div>
  )
}
