'use client'

import { useState } from 'react'

/** Original vs design slider. Both images shown; a divider reveals the design over the original. */
export function CompareSlider({ originalUrl, designUrl, originalLabel, designLabel }: { originalUrl: string; designUrl: string; originalLabel: string; designLabel: string }) {
  const [pos, setPos] = useState(50)
  return (
    <div>
      <div className="relative w-full overflow-hidden rounded-lg border border-line shadow-soft">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={originalUrl} alt={originalLabel} className="block w-full" />
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={designUrl} alt={designLabel} className="block h-full w-auto max-w-none" style={{ width: '100vw', maxWidth: 'none' }} />
        </div>
        <span className="absolute left-3 top-3 rounded-sm bg-ink/75 px-2 py-1 font-display text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-white backdrop-blur">
          {originalLabel}
        </span>
        <span className="absolute right-3 top-3 rounded-sm bg-accent-500 px-2 py-1 font-display text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-white">
          {designLabel}
        </span>
        <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }}>
          <div className="h-full w-0.5 bg-white shadow-[0_0_0_1px_rgba(10,26,40,0.25)]" />
        </div>
      </div>
      <label className="mt-4 block">
        <span className="sr-only">Compare</span>
        <input type="range" min={0} max={100} value={pos} onChange={(e) => setPos(Number(e.target.value))} className="w-full accent-[var(--color-accent-500)]" />
      </label>
    </div>
  )
}
