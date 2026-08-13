import type { Payload } from 'payload'

/**
 * Secure upload handling for BOQ / project documents.
 * Controls: file-type allowlist (extension + MIME), size limit, count limit, and a
 * basic content-signature check that rejects executables ("malware" first line of defence).
 *
 * NOTE: this is not a substitute for a real antivirus scan. In production, add a malware
 * scan (e.g. ClamAV or a cloud scanning service) before the file is marked available.
 */
export const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10 MB
export const MAX_FILES = 5

const ALLOWED_EXT = new Set(['pdf', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'xlsx', 'xls', 'csv', 'doc', 'docx'])
const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

export type UploadInput = { name: string; type: string; buffer: Buffer }

/** Returns an error string if the file is rejected, or null if it passes. */
export function validateUpload(f: UploadInput): string | null {
  if (!f.buffer || f.buffer.length === 0) return 'Empty file.'
  if (f.buffer.length > MAX_FILE_BYTES) return `"${f.name}" is too large (max 10 MB).`
  const ext = (f.name.split('.').pop() || '').toLowerCase()
  if (!ALLOWED_EXT.has(ext)) return `File type ".${ext}" is not allowed.`
  if (!ALLOWED_MIME.has(f.type)) return `File type "${f.type}" is not allowed.`

  // Reject common executable / script signatures.
  const head = f.buffer.subarray(0, 4)
  const hex = head.toString('hex').toLowerCase()
  const shebang = f.buffer.subarray(0, 2).toString('latin1')
  if (
    hex.startsWith('4d5a') || // MZ (Windows PE)
    hex.startsWith('7f454c46') || // ELF
    hex === 'cafebabe' || // Mach-O fat / Java class
    hex === 'feedface' ||
    hex === 'feedfacf' ||
    shebang === '#!'
  ) {
    return `"${f.name}" was rejected by the security check.`
  }

  // If it claims to be a PDF, verify the magic bytes.
  if ((ext === 'pdf' || f.type === 'application/pdf') && !f.buffer.subarray(0, 5).toString('latin1').startsWith('%PDF')) {
    return `"${f.name}" is not a valid PDF.`
  }
  return null
}

/** Validate + store a list of files privately in the `documents` collection. Returns doc ids. */
export async function storeDocuments(payload: Payload, files: UploadInput[], kind = 'boq'): Promise<number[]> {
  if (files.length > MAX_FILES) throw new Error(`Too many files (max ${MAX_FILES}).`)
  const ids: number[] = []
  for (const f of files) {
    const err = validateUpload(f)
    if (err) throw new Error(err)
    const doc = await payload.create({
      collection: 'documents',
      data: { kind, label: f.name } as never,
      file: { data: f.buffer, mimetype: f.type, name: f.name, size: f.buffer.length },
      overrideAccess: true,
    })
    ids.push(doc.id)
  }
  return ids
}
