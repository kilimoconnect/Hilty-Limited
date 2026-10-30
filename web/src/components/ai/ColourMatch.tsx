'use client'

import { useRef, useState } from 'react'
import type { Dictionary, Locale } from '../../i18n/dictionaries'
import { SITE } from '../../lib/site'
import { colourGuidanceAction } from '../../app/(frontend)/colour-match/actions'
import { ArrowRight, InfoIcon, PaletteIcon, SparkIcon, WhatsAppIcon } from '../ui/icons'

type Swatch = { hex: string; r: number; g: number; b: number }

const toHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')
const dist = (a: Swatch, b: { r: number; g: number; b: number }) =>
  Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2)

/** Extract up to 6 representative colours by bucketing a downscaled copy of the image. */
function extractPalette(img: HTMLImageElement): Swatch[] {
  const canvas = document.createElement('canvas')
  const w = 64
  const h = Math.max(1, Math.round((64 * img.naturalHeight) / img.naturalWidth) || 64)
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return []
  ctx.drawImage(img, 0, 0, w, h)
  const data = ctx.getImageData(0, 0, w, h).data
  const buckets = new Map<string, { r: number; g: number; b: number; n: number }>()
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 125) continue
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const key = `${r >> 4},${g >> 4},${b >> 4}`
    const e = buckets.get(key) || { r: 0, g: 0, b: 0, n: 0 }
    e.r += r
    e.g += g
    e.b += b
    e.n++
    buckets.set(key, e)
  }
  const arr = [...buckets.values()]
    .map((e) => ({ r: Math.round(e.r / e.n), g: Math.round(e.g / e.n), b: Math.round(e.b / e.n), n: e.n }))
    .sort((a, b) => b.n - a.n)
  const chosen: Swatch[] = []
  for (const c of arr) {
    if (chosen.length >= 6) break
    if (chosen.every((o) => dist(o, c) > 46)) chosen.push({ hex: toHex(c.r, c.g, c.b), r: c.r, g: c.g, b: c.b })
  }
  for (const c of arr) {
    if (chosen.length >= 5) break
    const s = { hex: toHex(c.r, c.g, c.b), r: c.r, g: c.g, b: c.b }
    if (!chosen.some((o) => o.hex === s.hex)) chosen.push(s)
  }
  return chosen
}

export function ColourMatch({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const t = dict.pages.colourMatch
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [imgUrl, setImgUrl] = useState<string | null>(null)
  const [palette, setPalette] = useState<Swatch[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const [guidance, setGuidance] = useState<string | null>(null)
  const [loadingGuidance, setLoadingGuidance] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const onFile = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) {
      setError(true)
      return
    }
    setError(false)
    setGuidance(null)
    setBusy(true)
    const url = URL.createObjectURL(file)
    setImgUrl(url)
    const img = new Image()
    img.onload = () => {
      try {
        setPalette(extractPalette(img))
      } catch {
        setError(true)
      } finally {
        setBusy(false)
      }
    }
    img.onerror = () => {
      setError(true)
      setBusy(false)
    }
    img.src = url
  }

  const getGuidance = async () => {
    if (!palette.length || loadingGuidance) return
    setLoadingGuidance(true)
    try {
      const res = await colourGuidanceAction({ hexes: palette.map((p) => p.hex), locale })
      setGuidance(res.guidance || null)
    } catch {
      setGuidance(null)
    } finally {
      setLoadingGuidance(false)
    }
  }

  const copy = (hex: string) => {
    navigator.clipboard?.writeText(hex).then(
      () => {
        setCopied(hex)
        setTimeout(() => setCopied((c) => (c === hex ? null : c)), 1400)
      },
      () => {},
    )
  }

  const waText = encodeURIComponent(
    (locale === 'sw' ? 'Habari Hilty, naomba kulinganisha rangi hizi na Plascon:\n' : 'Hello Hilty, please match these colours to Plascon:\n') +
      palette.map((p) => p.hex).join(', '),
  )

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
      {/* Upload / preview */}
      <div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        {!imgUrl ? (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-line-strong bg-surface-2 text-center transition-colors hover:border-brand-500 hover:bg-surface"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <PaletteIcon width={24} height={24} />
            </span>
            <span className="font-display text-[0.9375rem] font-semibold text-ink">{t.upload}</span>
            <span className="max-w-xs px-6 text-[0.8125rem] leading-relaxed text-muted">{t.hint}</span>
          </button>
        ) : (
          <div>
            <div className="overflow-hidden rounded-lg border border-line bg-surface-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgUrl} alt="" className="max-h-[22rem] w-full object-contain" />
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mt-3 inline-flex h-10 items-center gap-2 rounded-md border border-line-strong bg-surface px-4 font-display text-[0.8125rem] font-semibold transition-colors hover:border-brand-600 hover:text-brand-700"
            >
              {t.change}
            </button>
          </div>
        )}
        {error && <p className="mt-3 text-[0.8125rem] text-danger">{t.error}</p>}
      </div>

      {/* Palette + guidance */}
      <div>
        <div className="rounded-lg border border-line bg-surface-2 p-6 sm:p-7">
          <h2 className="font-display text-h3 font-semibold">{t.paletteTitle}</h2>

          {busy && <p className="mt-4 text-[0.9375rem] text-muted">{t.extracting}</p>}

          {!busy && palette.length === 0 && (
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted">{t.subtitle}</p>
          )}

          {palette.length > 0 && (
            <>
              <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6 lg:grid-cols-3 xl:grid-cols-6">
                {palette.map((s) => (
                  <button
                    key={s.hex}
                    type="button"
                    onClick={() => copy(s.hex)}
                    className="group text-left"
                    title={s.hex}
                  >
                    <span
                      className="block aspect-square w-full rounded-md border border-line shadow-soft"
                      style={{ backgroundColor: s.hex }}
                    />
                    <span className="mt-1.5 block font-display text-[0.6875rem] font-semibold uppercase tracking-[0.04em] text-muted">
                      {copied === s.hex ? t.copied : s.hex}
                    </span>
                  </button>
                ))}
              </div>

              {!guidance && (
                <button
                  type="button"
                  onClick={getGuidance}
                  disabled={loadingGuidance}
                  className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-accent-500 px-5 font-display text-[0.9375rem] font-semibold text-white transition-colors hover:bg-accent-600 disabled:opacity-55"
                >
                  <SparkIcon width={17} height={17} />
                  {loadingGuidance ? t.guidanceLoading : t.guidance}
                </button>
              )}

              {loadingGuidance && guidance === null && (
                <p className="mt-5 text-[0.9375rem] text-muted">{t.guidanceLoading}</p>
              )}

              {guidance && (
                <div className="mt-6">
                  <p className="font-display text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-muted">
                    {t.guidanceTitle}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-ink-soft">{guidance}</p>
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-5">
                <a
                  href={`${SITE.whatsappHref}?text=${waText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-md bg-whatsapp px-5 font-display text-[0.9375rem] font-semibold text-white transition-colors hover:bg-whatsapp-dark"
                >
                  <WhatsAppIcon width={17} height={17} />
                  {t.sendWhatsapp}
                </a>
                <a
                  href="/design-studio"
                  className="inline-flex h-11 items-center gap-2 rounded-md border border-line-strong bg-surface px-5 font-display text-[0.9375rem] font-semibold transition-colors hover:border-brand-600 hover:text-brand-700"
                >
                  {t.tryStudio}
                  <ArrowRight width={15} height={15} />
                </a>
              </div>
            </>
          )}

          <p className="mt-6 flex items-start gap-2 border-t border-line pt-5 text-[0.75rem] leading-relaxed text-muted">
            <InfoIcon width={14} height={14} className="mt-0.5 shrink-0" />
            {t.disclaimer}
          </p>
        </div>
      </div>
    </div>
  )
}
