/** Dependency-free image sniffing / validation shared by uploads and the provider service. */
export type ImageMime = 'image/jpeg' | 'image/png' | 'image/webp'

export function sniffImageMime(buf: Buffer): ImageMime | null {
  if (!buf || buf.length < 12) return null
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg'
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png'
  if (buf.subarray(0, 4).toString('latin1') === 'RIFF' && buf.subarray(8, 12).toString('latin1') === 'WEBP') return 'image/webp'
  return null
}

/** Valid provider image output = non-empty bytes with a recognised image signature. */
export function isValidImageBytes(buf: Buffer): boolean {
  return !!buf && buf.length > 0 && sniffImageMime(buf) !== null
}
