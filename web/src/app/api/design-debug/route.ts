import { NextResponse } from 'next/server'
import { createDesignProject, savePreferences, makePalettes } from '../../../lib/design/studioFlow'

export const maxDuration = 60

// TEMPORARY diagnostic — remove after.
export async function GET(req: Request) {
  const url = new URL(req.url)
  if (url.searchParams.get('key') !== 'hiltydbg') return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  const steps: Record<string, unknown> = {}
  try {
    const proj = await createDesignProject({ name: 'debug design', sector: 'residential', language: 'en' })
    steps.createProject = { ok: true, projectId: proj.projectId, reference: proj.reference }
    try {
      await savePreferences(proj.projectId, { temperature: 'neutral', preferredFinish: '', mood: '' })
      steps.savePreferences = { ok: true }
    } catch (e) {
      steps.savePreferences = { ok: false, error: String((e as Error)?.message || e), stack: String((e as Error)?.stack || '').slice(0, 900) }
      return NextResponse.json({ failedAt: 'savePreferences', steps })
    }
    try {
      const pal = await makePalettes(proj.projectId, { temperature: 'neutral', interiorExterior: 'interior' })
      steps.makePalettes = { ok: true, count: pal.palettes.length }
    } catch (e) {
      steps.makePalettes = { ok: false, error: String((e as Error)?.message || e), stack: String((e as Error)?.stack || '').slice(0, 900) }
      return NextResponse.json({ failedAt: 'makePalettes', steps })
    }
    return NextResponse.json({ ok: true, steps })
  } catch (e) {
    steps.createProject = { ok: false, error: String((e as Error)?.message || e), stack: String((e as Error)?.stack || '').slice(0, 1200) }
    return NextResponse.json({ failedAt: 'createProject', steps })
  }
}
