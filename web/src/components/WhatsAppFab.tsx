import { SITE } from '../lib/site'
import { WhatsAppIcon } from './ui/icons'

/**
 * WhatsApp is how most customers actually reach Hilty, so it stays pinned —
 * but as a labelled pill on desktop rather than a bare green circle.
 */
export function WhatsAppFab({ label }: { label: string }) {
  return (
    <a
      href={SITE.whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="group fixed bottom-5 right-5 z-40 inline-flex h-14 items-center gap-3 rounded-full bg-whatsapp pl-4 pr-4 text-white shadow-lift transition-[background-color,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-whatsapp-dark sm:pr-5"
    >
      <WhatsAppIcon width={26} height={26} className="shrink-0" />
      <span className="hidden font-display text-[0.9375rem] font-semibold sm:inline">{label}</span>
    </a>
  )
}
