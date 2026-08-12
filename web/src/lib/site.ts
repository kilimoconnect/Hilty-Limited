/**
 * Site-wide constants. Contact details are the CONFIRMED public values and are
 * preserved until the owner changes them. Nav targets that aren't built yet render
 * a "coming soon" placeholder page (later portions).
 */
export const SITE = {
  name: 'Hilty Paint & Coatings Centre',
  shortName: 'Hilty',
  phone: '+255 757 327 708',
  phoneHref: 'tel:+255757327708',
  whatsapp: '255757327708',
  whatsappHref: 'https://wa.me/255757327708',
  email: 'info@hilty.co.tz',
  instagram: 'https://instagram.com/hilty',
  facebook: 'https://facebook.com/hilty',
} as const

export type NavKey =
  | 'home'
  | 'products'
  | 'calculator'
  | 'services'
  | 'projects'
  | 'painters'
  | 'branches'
  | 'about'
  | 'quotation'

export const NAV_ITEMS: { key: NavKey; href: string }[] = [
  { key: 'home', href: '/' },
  { key: 'products', href: '/products' },
  { key: 'calculator', href: '/paint-calculator' },
  { key: 'services', href: '/painting-services' },
  { key: 'projects', href: '/projects' },
  { key: 'painters', href: '/painters-contractors' },
  { key: 'branches', href: '/branches' },
  { key: 'about', href: '/about' },
  { key: 'quotation', href: '/request-quotation' },
]
