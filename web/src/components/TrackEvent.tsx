'use client'

import { useEffect, useRef } from 'react'
import { trackEventAction } from '../app/(frontend)/track/actions'

/** Fires a one-time analytics beacon on mount (e.g. product_viewed, calculator_started). */
export function TrackEvent({ type, eventRef }: { type: string; eventRef?: string }) {
  const done = useRef(false)
  useEffect(() => {
    if (done.current) return
    done.current = true
    void trackEventAction(type, eventRef)
  }, [type, eventRef])
  return null
}
