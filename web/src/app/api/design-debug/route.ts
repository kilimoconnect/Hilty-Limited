import { NextResponse } from 'next/server'
import { createDesignProject } from '../../../lib/design/studioFlow'

export const maxDuration = 60

// TEMPORARY diagnostic — remove after.
export async function GET(req: Request) {
  const url = new URL(req.url)
  if (url.searchParams.get('key') !== 'hiltydbg') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const raw = process.env.DATABASE_URI?.startsWith('postgres') ? process.env.DATABASE_URI : process.env.POSTGRES_URL
  let host = 'unknown'
  try {
    const m = /@([^/]+)\//.exec(raw || '')
    host = m ? m[1] : 'no-match'
  } catch {
    /* ignore */
  }

  const attempts: string[] = []
  for (let i = 0; i < 5; i++) {
    try {
      const proj = await createDesignProject({ name: 'dbg', sector: 'residential', language: 'en' })
      return NextResponse.json({ ok: true, host, attempt: i + 1, projectId: proj.projectId, priorErrors: attempts })
    } catch (e) {
      attempts.push(String((e as Error)?.message || e).slice(0, 160))
      await new Promise((r) => setTimeout(r, 700 * (i + 1)))
    }
  }
  return NextResponse.json({ ok: false, host, attempts })
}
