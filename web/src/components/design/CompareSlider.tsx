'use client'

import { useState } from 'react'

/** Original vs design slider. Both images shown; a divider reveals the design over the original. */
export function CompareSlider({ originalUrl, designUrl, originalLabel, designLabel }: { originalUrl: string; designUrl: string; originalLabel: string; designLabel: string }) {
  const [pos, setPos] = useState(50)
  return (
    <div>
      <div className="relative w-full overflow-hidden rounded-xl border border-line">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={originalUrl} alt={originalLabel} className="block w-full" />
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={designUrl} alt={designLabel} className="block h-full w-auto max-w-none" style={{ width: '100vw', maxWidth: 'none' }} />
        </div>
        <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-[11px] text-white">{originalLabel}</span>
        <span className="absolute right-2 top-2 rounded bg-brand-700 px-2 py-0.5 text-[11px] text-white">{designLabel}</span>
        <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }}>
          <div className="h-full w-0.5 bg-white/90" />
        </div>
      </div>
      <label className="mt-2 block">
        <span className="sr-only">Compare</span>
        <input type="range" min={0} max={100} value={pos} onChange={(e) => setPos(Number(e.target.value))} className="w-full" />
      </label>
    </div>
  )
}
