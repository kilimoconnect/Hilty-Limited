import { getClient } from '../payload'

/**
 * Deterministic palette generation (NOT AI). Produces three schemes with approximate colours and
 * plain descriptive names (never invented brand shade names/codes), mapping the main role to a
 * VERIFIED/active catalogue product where one is suitable. Colours are approximate on screen.
 */
export type PaletteRole = {
  role: 'main' | 'accent' | 'ceiling_trim'
  name: string
  hex: string
  productId: number | null
  productName: string | null
  finish: string | null
}
export type GeneratedPalette = { key: 'safe' | 'balanced' | 'bold'; title: string; explanation: string; roles: PaletteRole[] }

const SETS = {
  warm: { main: ['Warm White', '#F3EBDD'], trim: ['Soft Ivory', '#F7F3EA'], accentBalanced: ['Terracotta', '#B5651D'], accentBold: ['Deep Clay', '#8A3B24'] },
  cool: { main: ['Cool Grey', '#D8DEE4'], trim: ['Bright White', '#F7F9FB'], accentBalanced: ['Slate Blue', '#3E5C76'], accentBold: ['Deep Teal', '#14454A'] },
  neutral: { main: ['Soft Greige', '#E3DDD3'], trim: ['Chalk White', '#F5F2EC'], accentBalanced: ['Sage', '#8A9A7B'], accentBold: ['Charcoal', '#3A3A3A'] },
} as const

type Temp = keyof typeof SETS

export async function generatePalettes(opts: { temperature?: string | null; interiorExterior?: string | null; preferredFinish?: string | null }): Promise<GeneratedPalette[]> {
  const payload = await getClient()
  const useType = opts.interiorExterior === 'exterior' ? 'exterior' : 'interior'
  const res = await payload.find({ collection: 'products', where: { active: { equals: true } }, limit: 50, depth: 0, overrideAccess: true })
  const suitable = res.docs.filter((d) => (d.useTypes ?? []).includes(useType))
  const mainProduct = suitable[0] ?? res.docs[0] ?? null
  const finish = opts.preferredFinish || mainProduct?.finish || null
  const set = SETS[(opts.temperature as Temp) in SETS ? (opts.temperature as Temp) : 'neutral']

  const mk = (key: GeneratedPalette['key'], title: string, explanation: string, accent: readonly [string, string]): GeneratedPalette => ({
    key,
    title,
    explanation,
    roles: [
      { role: 'main', name: set.main[0], hex: set.main[1], productId: mainProduct?.id ?? null, productName: mainProduct?.name ?? null, finish },
      { role: 'accent', name: accent[0], hex: accent[1], productId: null, productName: null, finish },
      { role: 'ceiling_trim', name: set.trim[0], hex: set.trim[1], productId: null, productName: null, finish: 'matt' },
    ],
  })

  return [
    mk('safe', 'Safe & timeless', 'A calm, timeless scheme that suits most spaces and is easy to live with.', set.main as unknown as [string, string]),
    mk('balanced', 'Balanced & distinctive', 'A balanced scheme with one distinctive accent for character.', set.accentBalanced),
    mk('bold', 'Bold statement', 'A confident scheme with a bold accent for a strong impression.', set.accentBold),
  ]
}
