/**
 * Category colour coding. These are interface colours drawn from the materials
 * each category is made of — sand, oxide, walnut, filler, teal — not paint
 * colours from any manufacturer's range, and they are never presented as such.
 */
const CATEGORY_TONES: Record<string, string> = {
  interior_paint: '#D9C4A9',
  exterior_paint: '#A9BFCB',
  roof_paint: '#9B4A3A',
  primer_undercoat: '#BCC0BB',
  wood_metal_coatings: '#7A5230',
  wall_preparation: '#D6D2C6',
  thinners_solvents: '#C8D2CB',
  brushes_rollers_tools: '#8C8577',
  waterproofing_protective: '#2F5D63',
}

const FALLBACKS = ['#B7C4CD', '#CBBBA4', '#9DAFB8', '#8C8577', '#2F5D63', '#D9C4A9']

export function categoryTone(key: string | null | undefined, index = 0): string {
  if (key && CATEGORY_TONES[key]) return CATEGORY_TONES[key]
  return FALLBACKS[index % FALLBACKS.length]
}

export function Swatch({ tone, className = '' }: { tone: string; className?: string }) {
  return <span aria-hidden className={`chip block ${className}`} style={{ backgroundColor: tone }} />
}
