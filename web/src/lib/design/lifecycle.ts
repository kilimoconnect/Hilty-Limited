import type { Payload } from 'payload'
import { deleteDocument } from './uploads'

const idOf = (v: unknown): number | undefined => (typeof v === 'number' ? v : v && typeof v === 'object' && 'id' in v ? (v as { id: number }).id : undefined)

/**
 * Delete a design project and everything under it (spaces, surfaces, variants, palettes,
 * preferences, product plans) plus the private image documents — for the customer's right to
 * delete their images and project.
 */
export async function deleteProject(payload: Payload, projectId: number): Promise<{ deleted: Record<string, number> }> {
  const deleted: Record<string, number> = { spaces: 0, surfaces: 0, variants: 0, palettes: 0, preferences: 0, plans: 0, images: 0, project: 0 }

  const spaces = await payload.find({ collection: 'design-spaces', where: { project: { equals: projectId } }, limit: 500, overrideAccess: true })
  for (const s of spaces.docs) {
    await deleteDocument(payload, idOf(s.originalImage))
    await deleteDocument(payload, idOf(s.processedImage))
    deleted.images += 2

    const variants = await payload.find({ collection: 'design-variants', where: { space: { equals: s.id } }, limit: 500, overrideAccess: true })
    for (const v of variants.docs) {
      await deleteDocument(payload, idOf(v.image))
      await payload.delete({ collection: 'design-variants', id: v.id, overrideAccess: true })
      deleted.variants++
      deleted.images++
    }

    const surfaces = await payload.find({ collection: 'design-surfaces', where: { space: { equals: s.id } }, limit: 500, overrideAccess: true })
    for (const f of surfaces.docs) {
      await deleteDocument(payload, idOf(f.maskImage))
      await payload.delete({ collection: 'design-surfaces', id: f.id, overrideAccess: true })
      deleted.surfaces++
    }

    await payload.delete({ collection: 'design-spaces', id: s.id, overrideAccess: true })
    deleted.spaces++
  }

  const delByProject = async (collection: 'design-palettes' | 'design-preferences' | 'design-product-plan') => {
    const r = await payload.find({ collection, where: { project: { equals: projectId } }, limit: 500, overrideAccess: true })
    for (const d of r.docs) await payload.delete({ collection, id: d.id, overrideAccess: true })
    return r.docs.length
  }
  deleted.palettes = await delByProject('design-palettes')
  deleted.preferences = await delByProject('design-preferences')
  deleted.plans = await delByProject('design-product-plan')

  await payload.delete({ collection: 'design-projects', id: projectId, overrideAccess: true })
  deleted.project = 1
  return { deleted }
}

/** Delete design projects whose retention date has passed (automatic retention/deletion). */
export async function purgeExpiredDesignData(payload: Payload): Promise<number> {
  const now = new Date().toISOString()
  const res = await payload.find({ collection: 'design-projects', where: { 'retention.retainUntil': { less_than: now } }, limit: 200, overrideAccess: true })
  for (const p of res.docs) await deleteProject(payload, p.id)
  return res.docs.length
}
