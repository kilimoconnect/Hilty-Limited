/**
 * Wordmark. The mark is a colour chip caught mid-coat: a square field of brand
 * blue with a clay second coat laid across the lower corner — the two-coat
 * system Hilty sells, reduced to a monogram. Deliberately distinct from the
 * Hilti (construction) brand. Replace with the official approved asset when
 * supplied (see HILTY_CONTENT_GAPS.md).
 */
export function Logo({ tone = 'dark', className = '' }: { tone?: 'dark' | 'light'; className?: string }) {
  const textColor = tone === 'light' ? 'text-white' : 'text-ink'
  const subColor = tone === 'light' ? 'text-brand-200' : 'text-muted'
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden className="shrink-0">
        <rect x="1" y="1" width="30" height="30" rx="7" fill="var(--color-brand-600)" />
        <path d="M31 17.5V25a6 6 0 0 1-6 6h-13Z" fill="var(--color-accent-500)" />
        <path d="M12 31 31 17.5" stroke="#fff" strokeWidth="1.25" strokeOpacity=".85" />
        <path
          d="M11 9.5v13M21 9.5v13M11 16h10"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeOpacity=".95"
        />
      </svg>
      <span className="leading-none">
        <span className={`block font-display text-[1.3rem] font-bold leading-none tracking-[-0.03em] ${textColor}`}>
          Hilty
        </span>
        <span className={`mt-1 block font-display text-[0.5625rem] font-semibold uppercase leading-none tracking-[0.2em] ${subColor}`}>
          Paint &amp; Coatings
        </span>
      </span>
    </span>
  )
}
