export type SurfaceType = 'wall' | 'ceiling' | 'roof' | 'gate' | 'wood' | 'metal' | 'other'
export type ProposedSurface = { type: SurfaceType; confidence: number }

/**
 * Initial automated surface suggestion. This is a deterministic baseline (a real segmentation
 * provider plugs in later); do NOT depend solely on generative AI to identify surfaces. Every
 * suggestion must be user-confirmed/corrected before rendering.
 */
export function proposeInitialSurfaces(opts: { surfaceType?: string | null; interiorExterior?: string | null }): ProposedSurface[] {
  const t = (opts.surfaceType || '').toLowerCase()
  if (t.includes('roof')) return [{ type: 'roof', confidence: 0.5 }]
  if (t.includes('gate') || t.includes('metal')) return [{ type: 'gate', confidence: 0.4 }, { type: 'metal', confidence: 0.4 }]
  if (t.includes('wood')) return [{ type: 'wood', confidence: 0.4 }]
  if (t.includes('boundary')) return [{ type: 'wall', confidence: 0.5 }]
  if (opts.interiorExterior === 'exterior' || t.includes('facade') || t.includes('exterior')) return [{ type: 'wall', confidence: 0.5 }]
  return [{ type: 'wall', confidence: 0.5 }, { type: 'ceiling', confidence: 0.4 }]
}

export function nextMaskVersion(current?: number | null): number {
  return (typeof current === 'number' ? current : 0) + 1
}

/** No rendering until at least one surface is user-confirmed. */
export function canRender(surfaces: { confirmedByUser?: boolean | null }[]): boolean {
  return surfaces.some((s) => s.confirmedByUser === true)
}

export function confirmedTypes(surfaces: { type: string; confirmedByUser?: boolean | null }[]): string[] {
  return surfaces.filter((s) => s.confirmedByUser === true).map((s) => s.type)
}
