/**
 * Wordmark. The mark is the Hilty shield from the brand sheet: a navy escutcheon
 * with a soft rounded base, carrying three bars that read both as a bar chart and
 * as an "H" — clay (left), a shorter royal-blue centre, and a tall light bar
 * (right) — with HILTY set in spaced caps beneath. Approved palette: navy #1f2740,
 * clay #c0603c, blue #5b7fdb, light #e4e7ef. Distinct from Hilti (construction).
 */
export function ShieldMark({
  size = 36,
  withText = true,
  className = '',
}: {
  size?: number
  withText?: boolean
  className?: string
}) {
  return (
    <svg
      width={(size * 120) / 138}
      height={size}
      viewBox="0 0 120 138"
      aria-hidden
      className={`shrink-0 ${className}`}
    >
      {/* Escutcheon — straight shoulders, soft rounded base */}
      <path
        d="M8 24 Q8 6 26 6 H94 Q112 6 112 24 V95 C112 116 92 130 60 133 C28 130 8 116 8 95 Z"
        fill="#1f2740"
      />
      {/* Bars — read as an H, or as a chart */}
      <rect x="27" y="54" width="18" height="46" rx="2" fill="#c0603c" />
      <rect x="51" y="66" width="18" height="34" rx="2" fill="#5b7fdb" />
      <rect x="75" y="48" width="18" height="52" rx="2" fill="#e4e7ef" />
      {withText && (
        <text
          x="60"
          y="120"
          textAnchor="middle"
          className="font-display"
          fontSize="10"
          fontWeight="700"
          letterSpacing="3"
          fill="#dfe4ee"
        >
          HILTY
        </text>
      )}
    </svg>
  )
}

export function Logo({ tone = 'dark', className = '' }: { tone?: 'dark' | 'light'; className?: string }) {
  const textColor = tone === 'light' ? 'text-white' : 'text-ink'
  const subColor = tone === 'light' ? 'text-brand-200' : 'text-muted'
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <ShieldMark size={40} />
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
