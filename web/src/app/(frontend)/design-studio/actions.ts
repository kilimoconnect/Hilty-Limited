'use server'

import { headers } from 'next/headers'
import { createHash } from 'crypto'
import {
  attachSpaceImage,
  convertToPlan,
  createDesignProject,
  loadProjectState,
  makePalettes,
  makeVariant,
  removeDesignProject,
  saveDesignLead,
  savePreferences,
  saveSpaceSurfaces,
} from '../../../lib/design/studioFlow'
import type { RoomInput } from '../../../lib/calc'

async function clientId(): Promise<string> {
  const h = await headers()
  const ip = (h.get('x-forwarded-for') || '').split(',')[0].trim() || h.get('x-real-ip') || 'anonymous'
  return createHash('sha256').update(ip).digest('hex').slice(0, 24) // hashed — never store raw IP
}

export async function createProjectAction(input: { name: string; sector?: 'residential' | 'commercial'; location?: string; language?: 'en' | 'sw'; customerRef?: string }) {
  return createDesignProject(input)
}

export async function uploadSpaceAction(formData: FormData) {
  const file = formData.get('image')
  if (!(file instanceof File) || file.size === 0) return { ok: false as const, error: 'no_file' }
  const buffer = Buffer.from(await file.arrayBuffer())
  return attachSpaceImage({
    projectId: Number(formData.get('projectId')),
    buffer,
    filename: file.name,
    declaredMime: file.type,
    name: formData.get('name')?.toString() || undefined,
    surfaceType: formData.get('surfaceType')?.toString() || undefined,
    interiorExterior: (formData.get('interiorExterior')?.toString() as 'interior' | 'exterior') || undefined,
    ownershipConfirmed: formData.get('ownershipConfirmed') === 'true',
  })
}

export async function saveSurfacesAction(spaceId: number, surfaces: { id?: number; type: string; mask?: unknown; confirmedByUser: boolean; areaM2?: number }[]) {
  return saveSpaceSurfaces(spaceId, surfaces)
}

export async function savePreferencesAction(projectId: number, prefs: Record<string, unknown>) {
  return savePreferences(projectId, prefs)
}

export async function makePalettesAction(projectId: number, opts: { temperature?: string; interiorExterior?: string; preferredFinish?: string }) {
  return makePalettes(projectId, opts)
}

export async function makeVariantAction(input: { spaceId: number; paletteId?: number; surfaces: { type: string; confirmedByUser?: boolean | null }[]; disclaimerAccepted: boolean; sessionId: string; conceptMode?: boolean }) {
  return makeVariant({ ...input, clientId: await clientId() })
}

export async function convertPlanAction(input: { projectId: number; spaceId?: number; paletteId?: number; rooms: RoomInput[]; coats?: number; wastePct?: number }) {
  return convertToPlan(input)
}

export async function saveDesignLeadAction(input: { projectId: number; name: string; phone: string; email?: string; location?: string; branchId?: number; budget?: string; timeline?: string; siteVisitPreference?: string; consent: boolean }) {
  return saveDesignLead(input)
}

export async function loadProjectAction(projectId: number) {
  return loadProjectState(projectId)
}

export async function removeProjectAction(projectId: number) {
  await removeDesignProject(projectId)
  return { ok: true as const }
}
