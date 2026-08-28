/**
 * Wordmark. The mark is the Hilty shield from the brand sheet: a navy escutcheon
 * carrying three bars that read both as a bar chart and as an "H" — clay (left
 * upright), a shorter royal-blue centre, and a tall light bar (right upright).
 * Colours are the approved palette: navy #1f2740, clay #c0603c, blue #5b7fdb,
 * light #e4e7ef. Deliberately distinct from the Hilti (construction) brand.
 */
export function ShieldMark({ size = 34, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={(size * 70) / 60}
      viewBox="0 0 60 70"
      aria-hidden
      className={`shrink-0 ${className}`}
    >
      {/* Escutcheon */}
      <path
        d="M8 16 Q8 4 20 4 H40 Q52 4 52 16 V40 C52 50 44 56 30 66 C16 56 8 50 8 40 Z"
        fill="#1f2740"
      />
      {/* Bars — read as an H, or as a chart */}
      <rect x="18" y="22" width="6" height="22" rx="1.4" fill="#c0603c" />
      <rect x="27" y="30" width="6" height="14" rx="1.4" fill="#5b7fdb" />
      <rect x="36" y="20" width="6" height="24" rx="1.4" fill="#e4e7ef" />
    </svg>
  )
}

export function Logo({ tone = 'dark', className = '' }: { tone?: 'dark' | 'light'; className?: string }) {
  const textColor = tone === 'light' ? 'text-white' : 'text-ink'
  const subColor = tone === 'light' ? 'text-brand-200' : 'text-muted'
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <ShieldMark size={34} />
      <span className="leading-none">
        <span
          className={`block font-display text-[1.3rem] font-bold uppercase leading-none tracking-[-0.02em] ${textColor}`}
        >
          Hilty
        </span>
        <span className="mt-1.5 flex items-center gap-1.5">
          <span aria-hidden className="h-[2px] w-3.5 rounded-full bg-accent-500" />
          <span
            className={`block font-display text-[0.5625rem] font-semibold uppercase leading-none tracking-[0.24em] ${subColor}`}
          >
            Limited
          </span>
        </span>
      </span>
    </span>
  )
}
