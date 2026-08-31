import type { SVGProps } from 'react'

const s = (props: SVGProps<SVGSVGElement>) => ({
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...props,
})

export const SearchIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...s(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
)

export const MenuIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...s(p)}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

export const CloseIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...s(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export const PhoneIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...s(p)}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.3-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.8 2Z" />
  </svg>
)

export const ChevronDown = (p: SVGProps<SVGSVGElement>) => (
  <svg {...s(p)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
)

export const CheckIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...s(p)}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

export const GlobeIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z" />
  </svg>
)

export const PinIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...s(p)}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

export const ArrowRight = (p: SVGProps<SVGSVGElement>) => (
  <svg {...s(p)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export const WhatsAppIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.2-.7.2s-.7 1-.9 1.1c-.2.2-.3.2-.6.1a7.9 7.9 0 0 1-2.4-1.5 9 9 0 0 1-1.6-2c-.2-.4 0-.5.1-.7l.5-.5c.2-.2.2-.3.3-.5s0-.4 0-.6l-.9-2.1c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5 0-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6 2.6 1.1 2.7.7 3.2.7.5 0 1.6-.7 1.9-1.3.2-.7.2-1.2.1-1.3l-.5-.3ZM12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.3A10 10 0 1 0 12 2Zm0 18.3a8.3 8.3 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.3 8.3 0 1 1 12 20.3Z" />
  </svg>
)

export const ArrowUpRight = (p: SVGProps<SVGSVGElement>) => (
  <svg {...s(p)}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
)

export const ChevronRight = (p: SVGProps<SVGSVGElement>) => (
  <svg {...s(p)}>
    <path d="m9 6 6 6-6 6" />
  </svg>
)

export const SparkIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...s(p)}>
    <path d="M12 3.5 13.9 9l5.6 1.9-5.6 1.9L12 18.4l-1.9-5.6L4.5 11 10.1 9 12 3.5Z" />
    <path d="M18.5 4v3M20 5.5h-3" />
  </svg>
)

export const RulerIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...s(p)}>
    <rect x="2.5" y="8" width="19" height="8" rx="1.5" />
    <path d="M7 8v3M11 8v4M15 8v3M19 8v4" />
  </svg>
)

export const ShieldCheckIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...s(p)}>
    <path d="M12 3 5 5.7v5.6c0 4.3 2.9 7.6 7 9.7 4.1-2.1 7-5.4 7-9.7V5.7L12 3Z" />
    <path d="m9 12 2.2 2.2L15.5 10" />
  </svg>
)

export const PaletteIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...s(p)}>
    <path d="M12 3a9 9 0 0 0 0 18c1.4 0 2-.9 2-1.8 0-1.2-1-1.7-1-2.7 0-.8.7-1.5 1.6-1.5H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8Z" />
    <circle cx="8" cy="10.5" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="7.8" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="16" cy="10.5" r="1.1" fill="currentColor" stroke="none" />
  </svg>
)

export const BrushIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...s(p)}>
    <path d="M14.5 3.5 9 9l6 6 5.5-5.5a2.1 2.1 0 0 0 0-3L17.5 3.5a2.1 2.1 0 0 0-3 0Z" />
    <path d="M9 9 4.8 13.2A3.5 3.5 0 0 0 4 16v2.5A1.5 1.5 0 0 0 5.5 20H8a3.5 3.5 0 0 0 2.8-.8L15 15" />
  </svg>
)

export const TruckIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...s(p)}>
    <path d="M2.5 6.5h11v9h-11z" />
    <path d="M13.5 10h3.6l2.9 3v2.5h-6.5z" />
    <circle cx="7" cy="17.5" r="1.8" />
    <circle cx="16.5" cy="17.5" r="1.8" />
  </svg>
)

export const ClockIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5V12l3 1.8" />
  </svg>
)

export const MailIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...s(p)}>
    <rect x="2.5" y="5" width="19" height="14" rx="2" />
    <path d="m3.5 6.5 8.5 6 8.5-6" />
  </svg>
)

export const LayersIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...s(p)}>
    <path d="m12 3 9 4.5-9 4.5-9-4.5L12 3Z" />
    <path d="m3 12.5 9 4.5 9-4.5" />
  </svg>
)

export const UsersIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...s(p)}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
    <path d="M16 5.4a3.2 3.2 0 0 1 0 5.2M17.5 14.6a5.5 5.5 0 0 1 3 4.9" />
  </svg>
)

export const InfoIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...s(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 7.8h.01" />
  </svg>
)

export const FilterIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...s(p)}>
    <path d="M3.5 6h17M6.5 12h11M10 18h4" />
  </svg>
)

export const StarIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...s(p)}>
    <path d="m12 4 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7L6.9 19.4l1-5.6-4-3.9 5.6-.8L12 4Z" />
  </svg>
)

// Agricultural commodities — a wheat stalk.
export const GrainIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...s(p)}>
    <path d="M12 21V9" />
    <path d="M12 9c0-2.2-1.6-3.8-3.8-3.8C8.2 7.4 9.8 9 12 9Zm0 0c0-2.2 1.6-3.8 3.8-3.8C15.8 7.4 14.2 9 12 9Z" />
    <path d="M12 14.5c0-2.2-1.6-3.8-3.8-3.8C8.2 12.9 9.8 14.5 12 14.5Zm0 0c0-2.2 1.6-3.8 3.8-3.8C15.8 12.9 14.2 14.5 12 14.5Z" />
  </svg>
)

// Fertilizer — a tied sack.
export const SackIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...s(p)}>
    <path d="M9.5 3h5l-1.2 3h-2.6L9.5 3Z" />
    <path d="M10.7 6C7.9 7.4 6 10.4 6 14a5 5 0 0 0 5 5h2a5 5 0 0 0 5-5c0-3.6-1.9-6.6-4.7-8" />
    <path d="M8.5 13h7" />
  </svg>
)

// Cooking oil — a bottle.
export const BottleIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...s(p)}>
    <path d="M10 2.5h4V5l1.3 2.6c.5 1 .7 2 .7 3.1V19a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-8.3c0-1.1.2-2.1.7-3.1L10 5V2.5Z" />
    <path d="M8 12.5h8" />
  </svg>
)
