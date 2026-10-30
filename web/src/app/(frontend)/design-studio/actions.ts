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

/** Transient DB connection errors (Supabase session-pooler exhaustion) — recover by retrying. */
const isConnError = (e: unknown): boolean =>
  /EMAXCONNSESSION|begin transaction|cannot connect to postgres|timeout exceeded when trying to connect|too many clients|Connection terminated|ECONNRESET/i.test(
    String((e as Error)?.message || e),
  )

async function retryDb<T>(fn: () => Promise<T>, tries = 4): Promise<T> {
  let last: unknown
  for (let i = 0; i < tries; i++) {
    try {
      return await fn()
    } catch (e) {
      last = e
      if (!isConnError(e) || i === tries - 1) throw e
      await new Promise((r) => setTimeout(r, 500 * (i + 1) + Math.floor(Math.random() * 400)))
    }
  }
  throw last
}

export async function createProjectAction(input: { name: string; sector?: 'residential' | 'commercial'; location?: string; language?: 'en' | 'sw'; customerRef?: string }) {
  return retryDb(() => createDesignProject(input))
}

export async function uploadSpaceAction(formData: FormData) {
  const file = formData.get('image')
  if (!(file instanceof File) || file.size === 0) return { ok: false as const, error: 'no_file' }
  const buffer = Buffer.from(await file.arrayBuffer())
  return retryDb(() => attachSpaceImage({
    projectId: Number(formData.get('projectId')),
    buffer,
    filename: file.name,
    declaredMime: file.type,
    name: formData.get('name')?.toString() || undefined,
    surfaceType: formData.get('surfaceType')?.toString() || undefined,
    interiorExterior: (formData.get('interiorExterior')?.toString() as 'interior' | 'exterior') || undefined,
    ownershipConfirmed: formData.get('ownershipConfirmed') === 'true',
  }))
}

export async function saveSurfacesAction(spaceId: number, surfaces: { id?: number; type: string; mask?: unknown; confirmedByUser: boolean; areaM2?: number }[]) {
  return retryDb(() => saveSpaceSurfaces(spaceId, surfaces))
}

export async function savePreferencesAction(projectId: number, prefs: Record<string, unknown>) {
  return retryDb(() => savePreferences(projectId, prefs))
}

export async function makePalettesAction(projectId: number, opts: { temperature?: string; interiorExterior?: string; preferredFinish?: string }) {
  return retryDb(() => makePalettes(projectId, opts))
}

export async function makeVariantAction(input: { spaceId: number; paletteId?: number; surfaces: { type: string; confirmedByUser?: boolean | null }[]; disclaimerAccepted: boolean; sessionId: string; conceptMode?: boolean }) {
  const cid = await clientId()
  return retryDb(() => makeVariant({ ...input, clientId: cid }))
}

export async function convertPlanAction(input: { projectId: number; spaceId?: number; paletteId?: number; rooms: RoomInput[]; coats?: number; wastePct?: number }) {
  return retryDb(() => convertToPlan(input))
}

export async function saveDesignLeadAction(input: { projectId: number; name: string; phone: string; email?: string; location?: string; branchId?: number; budget?: string; timeline?: string; siteVisitPreference?: string; consent: boolean }) {
  return retryDb(() => saveDesignLead(input))
}

export async function loadProjectAction(projectId: number) {
  return retryDb(() => loadProjectState(projectId))
}

export async function removeProjectAction(projectId: number) {
  await retryDb(() => removeDesignProject(projectId))
  return { ok: true as const }
}
