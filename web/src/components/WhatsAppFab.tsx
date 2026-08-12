import { SITE } from '../lib/site'
import { WhatsAppIcon } from './ui/icons'

export function WhatsAppFab({ label }: { label: string }) {
  return (
    <a
      href={SITE.whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:brightness-95"
    >
      <WhatsAppIcon width={28} height={28} />
    </a>
  )
}
