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
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-md px-5 font-display text-[0.9375rem] font-semibold transition-[background-color,box-shadow,transform] duration-200 ${
        added
          ? 'bg-success-bg text-success ring-1 ring-inset ring-success/20'
          : 'bg-accent-500 text-white shadow-soft hover:bg-accent-600 hover:shadow-lift active:translate-y-px'
      }`}
    >
      {added && <CheckIcon width={16} height={16} />}
      {added ? addedLabel : label}
    </button>
  )
}
