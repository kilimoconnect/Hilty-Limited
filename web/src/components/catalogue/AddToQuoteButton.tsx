'use client'

import { useEffect, useState } from 'react'
import { CheckIcon } from '../ui/icons'

type QuoteItem = { slug: string; name: string }
const KEY = 'hilty_quote'

/**
 * Adds a product to a client-side quotation list (localStorage). The full quotation
 * request flow consumes this list in a later portion. No checkout, no prices.
 */
export function AddToQuoteButton({ slug, name, label, addedLabel }: { slug: string; name: string; label: string; addedLabel: string }) {
  const [added, setAdded] = useState(false)

  useEffect(() => {
    try {
      const list: QuoteItem[] = JSON.parse(localStorage.getItem(KEY) || '[]')
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from client-only localStorage after mount
      setAdded(list.some((i) => i.slug === slug))
    } catch {
      /* ignore */
    }
  }, [slug])

  const add = () => {
    try {
      const list: QuoteItem[] = JSON.parse(localStorage.getItem(KEY) || '[]')
      if (!list.some((i) => i.slug === slug)) {
        list.push({ slug, name })
        localStorage.setItem(KEY, JSON.stringify(list))
      }
      setAdded(true)
    } catch {
      setAdded(true)
    }
  }

  return (
    <button
      type="button"
      onClick={add}
      aria-pressed={added}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
        added ? 'bg-brand-50 text-brand-700' : 'bg-brand-600 text-white hover:bg-brand-700'
      }`}
    >
      {added && <CheckIcon width={16} height={16} />}
      {added ? addedLabel : label}
    </button>
  )
}
