/**
 * Placeholder wordmark using the company name. Replace with the official approved
 * Hilty logo asset when supplied (see HILTY_CONTENT_GAPS.md). Deliberately distinct
 * from the Hilti (construction) brand.
 */
export function Logo({ tone = 'dark', className = '' }: { tone?: 'dark' | 'light'; className?: string }) {
  const textColor = tone === 'light' ? 'text-white' : 'text-brand-700'
  const subColor = tone === 'light' ? 'text-brand-100' : 'text-muted'
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden className="shrink-0">
        <path
          d="M12 2S5 10.5 5 15a7 7 0 0 0 14 0c0-4.5-7-13-7-13Z"
          fill="var(--color-brand-600)"
        />
        <path d="M12 2S5 10.5 5 15a7 7 0 0 0 3 5.7" fill="none" stroke="var(--color-accent-500)" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <span className="leading-none">
        <span className={`block text-lg font-extrabold tracking-tight ${textColor}`}>Hilty</span>
        <span className={`block text-[10px] font-medium uppercase tracking-wider ${subColor}`}>
          Paint &amp; Coatings
        </span>
      </span>
    </span>
  )
}
