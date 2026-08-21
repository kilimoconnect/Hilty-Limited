'use client'
/* eslint-disable react-hooks/immutability -- imperative canvas drawing mutates canvas contexts and stroke buffers by design */

import { useEffect, useRef, useState } from 'react'
import type { Dictionary } from '../../i18n/dictionaries'

export type Stroke = { tool: 'brush' | 'erase'; size: number; points: { x: number; y: number }[] }

/** Touch-capable mask editor: brush, erase, undo, redo, reset and zoom. */
export function MaskEditor({ imageUrl, width, height, dict, onChange }: { imageUrl: string; width: number; height: number; dict: Dictionary; onChange?: (strokes: Stroke[]) => void }) {
  const t = dict.studio.surfaces
  const displayRef = useRef<HTMLCanvasElement | null>(null)
  const maskRef = useRef<HTMLCanvasElement | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [redo, setRedo] = useState<Stroke[]>([])
  const [tool, setTool] = useState<'brush' | 'erase'>('brush')
  const [size, setSize] = useState(40)
  const [zoom, setZoom] = useState(1)
  const drawing = useRef<Stroke | null>(null)

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imgRef.current = img
      redraw(strokes)
    }
    img.src = imageUrl
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl])

  const applyStroke = (ctx: CanvasRenderingContext2D, s: Stroke) => {
    ctx.globalCompositeOperation = s.tool === 'erase' ? 'destination-out' : 'source-over'
    ctx.strokeStyle = 'rgba(255,255,255,1)'
    ctx.lineWidth = s.size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    s.points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)))
    if (s.points.length === 1) ctx.lineTo(s.points[0].x + 0.1, s.points[0].y + 0.1)
    ctx.stroke()
  }

  const redraw = (list: Stroke[]) => {
    const mask = maskRef.current
    const disp = displayRef.current
    if (!mask || !disp) return
    const mctx = mask.getContext('2d')!
    mctx.clearRect(0, 0, mask.width, mask.height)
    for (const s of list) applyStroke(mctx, s)
    const dctx = disp.getContext('2d')!
    dctx.clearRect(0, 0, disp.width, disp.height)
    if (imgRef.current) dctx.drawImage(imgRef.current, 0, 0, disp.width, disp.height)
    dctx.save()
    dctx.globalAlpha = 0.4
    dctx.drawImage(mask, 0, 0)
    dctx.restore()
  }

  const posFromEvent = (e: React.PointerEvent) => {
    const disp = displayRef.current!
    const rect = disp.getBoundingClientRect()
    return { x: ((e.clientX - rect.left) / rect.width) * disp.width, y: ((e.clientY - rect.top) / rect.height) * disp.height }
  }

  const onDown = (e: React.PointerEvent) => {
    ;(e.target as Element).setPointerCapture(e.pointerId)
    drawing.current = { tool, size, points: [posFromEvent(e)] }
    redraw([...strokes, drawing.current])
  }
  const onMove = (e: React.PointerEvent) => {
    if (!drawing.current) return
    drawing.current.points.push(posFromEvent(e))
    redraw([...strokes, drawing.current])
  }
  const onUp = () => {
    if (!drawing.current) return
    const next = [...strokes, drawing.current]
    drawing.current = null
    setStrokes(next)
    setRedo([])
    onChange?.(next)
  }

  const undo = () => {
    if (!strokes.length) return
    const next = strokes.slice(0, -1)
    setRedo((r) => [...r, strokes[strokes.length - 1]])
    setStrokes(next)
    redraw(next)
    onChange?.(next)
  }
  const doRedo = () => {
    if (!redo.length) return
    const s = redo[redo.length - 1]
    const next = [...strokes, s]
    setRedo((r) => r.slice(0, -1))
    setStrokes(next)
    redraw(next)
    onChange?.(next)
  }
  const reset = () => {
    setStrokes([])
    setRedo([])
    redraw([])
    onChange?.([])
  }

  useEffect(() => {
    redraw(strokes)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const btn = 'inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-sm hover:bg-brand-50'
  const active = 'bg-brand-600 text-white border-brand-600 hover:bg-brand-700'

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2" role="toolbar" aria-label="Mask tools">
        <button type="button" onClick={() => setTool('brush')} className={`${btn} ${tool === 'brush' ? active : ''}`} aria-pressed={tool === 'brush'}>{t.brush}</button>
        <button type="button" onClick={() => setTool('erase')} className={`${btn} ${tool === 'erase' ? active : ''}`} aria-pressed={tool === 'erase'}>{t.erase}</button>
        <button type="button" onClick={undo} className={btn} disabled={!strokes.length}>{t.undo}</button>
        <button type="button" onClick={doRedo} className={btn} disabled={!redo.length}>{t.redo}</button>
        <button type="button" onClick={reset} className={btn}>{t.reset}</button>
        <button type="button" onClick={() => setZoom((z) => Math.min(3, z + 0.25))} className={btn} aria-label={t.zoomIn}>＋</button>
        <button type="button" onClick={() => setZoom((z) => Math.max(1, z - 0.25))} className={btn} aria-label={t.zoomOut}>－</button>
        <label className="flex items-center gap-2 text-sm">
          <span className="sr-only">Brush size</span>
          <input type="range" min={10} max={120} value={size} onChange={(e) => setSize(Number(e.target.value))} />
        </label>
      </div>
      <div className="max-w-full overflow-auto rounded-xl border border-line bg-surface-2">
        <canvas
          ref={displayRef}
          width={width}
          height={height}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          className="block touch-none"
          style={{ width: `${width * zoom}px`, height: 'auto', maxWidth: zoom === 1 ? '100%' : 'none', cursor: 'crosshair' }}
        />
        <canvas ref={maskRef} width={width} height={height} className="hidden" />
      </div>
      <p className="mt-2 text-xs text-muted">{t.note}</p>
    </div>
  )
}
