import { getClient } from './payload'
import { notifyStaff } from './notify'
import { storeDocuments, type UploadInput } from './uploads'

export type SubmitResult = { ok: boolean; reference?: string; error?: string; notified?: boolean }

const RETENTION_MS = 2 * 365 * 24 * 60 * 60 * 1000 // ~2 years
const retainUntil = () => new Date(Date.now() + RETENTION_MS).toISOString()
const consentBlock = (channel = 'website', purpose = 'service_request') => ({
  given: true,
  purpose,
  channel,
  timestamp: new Date().toISOString(),
})

// ---------- Site-visit request ----------
export type SiteVisitInput = {
  name: string
  phone: string
  email?: string
  location?: string
  preferredDate?: string
  preferredTime?: string
  propertyType?: string
  notes?: string
  serviceContext?: string
  consent: boolean
}

export async function submitSiteVisit(input: SiteVisitInput): Promise<SubmitResult> {
  if (!input.name?.trim() || !input.phone?.trim()) return { ok: false, error: 'Name and phone are required.' }
  if (!input.consent) return { ok: false, error: 'Please accept the consent to be contacted.' }
  const payload = await getClient()
  const notes = [input.notes, input.serviceContext ? `Service: ${input.serviceContext}` : ''].filter(Boolean).join('\n')
  const doc = await payload.create({
    collection: 'site-visit-requests',
    data: {
      name: input.name,
      phone: input.phone,
      email: input.email,
      location: input.location,
      preferredDate: input.preferredDate || undefined,
      preferredTime: input.preferredTime,
      propertyType: input.propertyType,
      notes,
      consent: consentBlock('website', 'service_request'),
      retention: { retainUntil: retainUntil(), legalBasis: 'consent' },
    } as never,
    overrideAccess: true,
  })
  const ref = (doc as { reference?: string }).reference
  const notified = await notifyStaff(payload, `New site-visit request ${ref ?? ''}`, [
    `Name: ${input.name}`,
    `Phone: ${input.phone}`,
    input.email ? `Email: ${input.email}` : '',
    input.location ? `Location: ${input.location}` : '',
    notes,
  ].filter(Boolean))
  return { ok: true, reference: ref, notified }
}

// ---------- Painter / contractor registration ----------
export type PainterInput = {
  fullName: string
  type?: 'painter' | 'contractor' | 'company'
  phone: string
  whatsapp?: string
  email?: string
  region?: string
  districts?: string[]
  skills?: string[]
  yearsExperience?: number
  consent: boolean
}

export async function submitPainter(input: PainterInput): Promise<SubmitResult> {
  if (!input.fullName?.trim() || !input.phone?.trim()) return { ok: false, error: 'Full name and phone are required.' }
  if (!input.consent) return { ok: false, error: 'Please accept the consent to be contacted.' }
  const payload = await getClient()
  const doc = await payload.create({
    collection: 'painters',
    data: {
      fullName: input.fullName,
      type: input.type ?? 'painter',
      phone: input.phone,
      whatsapp: input.whatsapp,
      email: input.email,
      region: input.region,
      districts: (input.districts ?? []).map((district) => ({ district })),
      skills: (input.skills ?? []).map((skill) => ({ skill })),
      yearsExperience: input.yearsExperience,
      status: 'pending',
      consent: consentBlock('website', 'registration'),
      retention: { retainUntil: retainUntil(), legalBasis: 'consent' },
    } as never,
    overrideAccess: true,
  })
  const notified = await notifyStaff(payload, `New painter/contractor registration`, [
    `Name: ${input.fullName}`,
    `Type: ${input.type ?? 'painter'}`,
    `Phone: ${input.phone}`,
    input.region ? `Region: ${input.region}` : '',
  ].filter(Boolean))
  return { ok: true, reference: String((doc as { id: number }).id), notified }
}

// ---------- Professional enquiry (contractor/developer/project-pricing/bulk-supply) ----------
export type EnquiryInput = {
  type: 'contractor_account' | 'developer' | 'project_pricing' | 'bulk_supply' | 'general'
  name: string
  company?: string
  role?: string
  phone: string
  email?: string
  registrationNumber?: string
  projectDescription?: string
  estimatedArea?: number
  quantities?: string
  consent: boolean
}

export async function submitEnquiry(input: EnquiryInput, files: UploadInput[] = []): Promise<SubmitResult> {
  if (!input.name?.trim() || !input.phone?.trim()) return { ok: false, error: 'Name and phone are required.' }
  if (!input.consent) return { ok: false, error: 'Please accept the consent to be contacted.' }
  const payload = await getClient()

  let documents: { file: number }[] = []
  if (files.length > 0) {
    try {
      const ids = await storeDocuments(payload, files, 'boq')
      documents = ids.map((file) => ({ file }))
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'File upload failed.' }
    }
  }

  const doc = await payload.create({
    collection: 'enquiries',
    data: {
      type: input.type,
      name: input.name,
      company: input.company,
      role: input.role,
      phone: input.phone,
      email: input.email,
      registrationNumber: input.registrationNumber,
      projectDescription: input.projectDescription,
      estimatedArea: input.estimatedArea,
      quantities: input.quantities,
      documents,
      status: 'new',
      consent: consentBlock('website', 'service_request'),
      retention: { retainUntil: retainUntil(), legalBasis: 'consent' },
    } as never,
    overrideAccess: true,
  })
  const ref = (doc as { reference?: string }).reference
  const notified = await notifyStaff(payload, `New ${input.type} enquiry ${ref ?? ''}`, [
    `Type: ${input.type}`,
    `Name: ${input.name}`,
    input.company ? `Company: ${input.company}` : '',
    `Phone: ${input.phone}`,
    documents.length ? `Documents: ${documents.length}` : '',
  ].filter(Boolean))
  return { ok: true, reference: ref, notified }
}
