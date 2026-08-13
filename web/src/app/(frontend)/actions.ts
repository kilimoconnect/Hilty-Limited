'use server'

import { submitEnquiry, submitPainter, submitSiteVisit } from '../../lib/submissions'
import { MAX_FILES } from '../../lib/uploads'
import type { UploadInput } from '../../lib/uploads'

export type FormState = { ok?: boolean; error?: string; reference?: string }

const str = (fd: FormData, k: string) => (fd.get(k)?.toString() ?? '').trim() || undefined
const checked = (fd: FormData, k: string) => {
  const v = fd.get(k)?.toString()
  return v === 'on' || v === 'true' || v === '1'
}
const csv = (fd: FormData, k: string) =>
  (fd.get(k)?.toString() ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

async function filesFrom(fd: FormData, key: string): Promise<UploadInput[]> {
  const out: UploadInput[] = []
  for (const entry of fd.getAll(key)) {
    if (entry instanceof File && entry.size > 0) {
      out.push({ name: entry.name, type: entry.type, buffer: Buffer.from(await entry.arrayBuffer()) })
    }
  }
  return out
}

export async function siteVisitAction(_prev: FormState, fd: FormData): Promise<FormState> {
  try {
    const res = await submitSiteVisit({
      name: str(fd, 'name') ?? '',
      phone: str(fd, 'phone') ?? '',
      email: str(fd, 'email'),
      location: str(fd, 'location'),
      preferredDate: str(fd, 'preferredDate'),
      preferredTime: str(fd, 'preferredTime'),
      propertyType: str(fd, 'propertyType'),
      notes: str(fd, 'notes'),
      serviceContext: str(fd, 'serviceContext'),
      consent: checked(fd, 'consent'),
    })
    return res.ok ? { ok: true, reference: res.reference } : { error: res.error }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Something went wrong.' }
  }
}

export async function painterAction(_prev: FormState, fd: FormData): Promise<FormState> {
  try {
    const type = str(fd, 'type') as 'painter' | 'contractor' | 'company' | undefined
    const years = str(fd, 'yearsExperience')
    const res = await submitPainter({
      fullName: str(fd, 'fullName') ?? '',
      type,
      phone: str(fd, 'phone') ?? '',
      whatsapp: str(fd, 'whatsapp'),
      email: str(fd, 'email'),
      region: str(fd, 'region'),
      districts: csv(fd, 'districts'),
      skills: csv(fd, 'skills'),
      yearsExperience: years ? Number(years) : undefined,
      consent: checked(fd, 'consent'),
    })
    return res.ok ? { ok: true, reference: res.reference } : { error: res.error }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Something went wrong.' }
  }
}

export async function enquiryAction(_prev: FormState, fd: FormData): Promise<FormState> {
  try {
    const files = await filesFrom(fd, 'documents')
    if (files.length > MAX_FILES) return { error: `Please attach at most ${MAX_FILES} files.` }
    const area = str(fd, 'estimatedArea')
    const type = (str(fd, 'type') ?? 'general') as
      | 'contractor_account'
      | 'developer'
      | 'project_pricing'
      | 'bulk_supply'
      | 'general'
    const res = await submitEnquiry(
      {
        type,
        name: str(fd, 'name') ?? '',
        company: str(fd, 'company'),
        role: str(fd, 'role'),
        phone: str(fd, 'phone') ?? '',
        email: str(fd, 'email'),
        registrationNumber: str(fd, 'registrationNumber'),
        projectDescription: str(fd, 'projectDescription'),
        estimatedArea: area ? Number(area) : undefined,
        quantities: str(fd, 'quantities'),
        consent: checked(fd, 'consent'),
      },
      files,
    )
    return res.ok ? { ok: true, reference: res.reference } : { error: res.error }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Something went wrong.' }
  }
}
