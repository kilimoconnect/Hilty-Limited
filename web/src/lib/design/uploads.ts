import sharp from 'sharp'
import type { Payload } from 'payload'
import { sniffImageMime, type ImageMime } from './image/validate'

const EXT_BY_MIME: Record<ImageMime, string[]> = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
}
const MAX_DIM = 8000
const MIN_DIM = 64

export type ProcessedImage = { buffer: Buffer; mime: ImageMime; ext: string; width: number; height: number }

/**
 * Validate an uploaded image (real MIME via magic bytes, extension, declared MIME, size,
 * dimensions), then RE-ENCODE it safely with sharp — baking EXIF orientation and STRIPPING all
 * metadata (EXIF / GPS location). Only JPEG, PNG and WebP are accepted.
 */
export async function validateAndProcessImage(input: {
  buffer: Buffer
  filename: string
  declaredMime?: string
  maxMB: number
}): Promise<ProcessedImage> {
  const { buffer, filename, declaredMime, maxMB } = input
  if (!buffer || buffer.length === 0) throw new Error('Empty file.')
  if (buffer.length > maxMB * 1024 * 1024) throw new Error(`Image is too large (max ${maxMB} MB).`)

  const sniff = sniffImageMime(buffer)
  if (!sniff) throw new Error('Unsupported image type — only JPEG, PNG and WebP are allowed.')
  const ext = (filename.split('.').pop() || '').toLowerCase()
  if (!EXT_BY_MIME[sniff].includes(ext)) throw new Error('File extension does not match the image content.')
  if (declaredMime && declaredMime !== sniff) throw new Error('Declared file type does not match the image content.')

  const meta = await sharp(buffer).metadata()
  const w = meta.width || 0
  const h = meta.height || 0
  if (w < MIN_DIM || h < MIN_DIM) throw new Error('Image is too small.')
  if (w > MAX_DIM || h > MAX_DIM) throw new Error(`Image dimensions exceed ${MAX_DIM}px.`)

  // Re-encode; sharp does NOT copy input metadata unless withMetadata() is called → EXIF/GPS stripped.
  const pipeline = sharp(buffer).rotate() // bake EXIF orientation, then orientation tag is dropped
  let outBuffer: Buffer
  let outMime: ImageMime
  let outExt: string
  if (sniff === 'image/png') {
    outBuffer = await pipeline.png().toBuffer()
    outMime = 'image/png'
    outExt = 'png'
  } else if (sniff === 'image/webp') {
    outBuffer = await pipeline.webp().toBuffer()
    outMime = 'image/webp'
    outExt = 'webp'
  } else {
    outBuffer = await pipeline.jpeg({ quality: 88, mozjpeg: true }).toBuffer()
    outMime = 'image/jpeg'
    outExt = 'jpg'
  }
  const outMeta = await sharp(outBuffer).metadata()
  return { buffer: outBuffer, mime: outMime, ext: outExt, width: outMeta.width || w, height: outMeta.height || h }
}

/** Store bytes privately in the `documents` collection (staff-only read; not a public directory). */
export async function storePrivateImage(payload: Payload, buffer: Buffer, mime: string, name: string, kind = 'design'): Promise<number> {
  const doc = await payload.create({
    collection: 'documents',
    data: { kind, label: name } as never,
    file: { data: buffer, mimetype: mime, name, size: buffer.length },
    overrideAccess: true,
  })
  return (doc as { id: number }).id
}

export async function deleteDocument(payload: Payload, id: number | null | undefined): Promise<void> {
  if (!id) return
  await payload.delete({ collection: 'documents', id, overrideAccess: true }).catch(() => {})
}

/** Does EXIF metadata survive processing? Test helper — returns true if any metadata remains. */
export async function hasExif(buffer: Buffer): Promise<boolean> {
  const meta = await sharp(buffer).metadata()
  return Boolean(meta.exif)
}
