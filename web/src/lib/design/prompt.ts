export const PROMPT_VERSION = 'v1'

/**
 * Build the image-edit instruction enforcing the recolouring rules: edit only confirmed masked
 * surfaces, preserve geometry/openings/furniture/fixtures/perspective, don't add or remove things
 * (unless concept mode), don't hide defects, and never present the result as an exact colour.
 */
export function buildEditPrompt(opts: {
  confirmedSurfaceTypes: string[]
  paletteRoles: { role?: string | null; shadeName?: string | null }[]
  conceptMode?: boolean
}): string {
  const surfaces = opts.confirmedSurfaceTypes.join(', ') || 'the confirmed masked surfaces'
  const colours = opts.paletteRoles.map((r) => `${r.role || 'surface'}: ${r.shadeName || 'selected shade'}`).join('; ') || 'the selected shades'
  return [
    `Recolour ONLY the confirmed masked surfaces (${surfaces}) in this photograph.`,
    'Preserve the room geometry, doors, windows, furniture, flooring, fixtures and the original photograph and perspective exactly.',
    opts.conceptMode
      ? 'Concept-design mode: modest styling suggestions are permitted, clearly as a concept.'
      : 'Do NOT add or remove furniture, décor or structural elements.',
    'Do NOT remove, hide or repair any surface defects.',
    `Apply approximate colours — ${colours}.`,
    'This is an indicative visualisation only, not an exact representation of the final colour.',
  ].join(' ')
}
