import sharp from 'sharp'

/** Composite an unobtrusive "AI visualisation" indicator onto a generated image. */
export async function addWatermark(buffer: Buffer, label = 'AI visualisation'): Promise<Buffer> {
  const meta = await sharp(buffer).metadata()
  const w = meta.width || 1024
  const h = meta.height || 1024
  const fs = Math.max(14, Math.round(w * 0.025))
  const pad = Math.round(fs * 0.5)
  const boxW = Math.round(label.length * fs * 0.6) + pad * 2
  const boxH = fs + pad * 2
  const x = w - boxW - 12
  const y = h - boxH - 12
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><g opacity="0.9"><rect x="${x}" y="${y}" rx="6" width="${boxW}" height="${boxH}" fill="#000000" fill-opacity="0.55"/><text x="${x + pad}" y="${y + boxH - pad - 2}" font-family="sans-serif" font-size="${fs}" fill="#ffffff">${label}</text></g></svg>`
  return sharp(buffer).composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).png().toBuffer()
}
