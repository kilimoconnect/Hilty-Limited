'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Dictionary, Locale } from '../../i18n/dictionaries'
import { SITE } from '../../lib/site'
import {
  convertPlanAction,
  createProjectAction,
  loadProjectAction,
  makePalettesAction,
  makeVariantAction,
  removeProjectAction,
  saveDesignLeadAction,
  savePreferencesAction,
  saveSurfacesAction,
  uploadSpaceAction,
} from '../../app/(frontend)/design-studio/actions'
import { MaskEditor, type Stroke } from './MaskEditor'
import { CompareSlider } from './CompareSlider'

type Branch = { id: number; name: string }
type Palette = { id: number; key: string; title: string; explanation: string; roles: { role: string; name: string; hex: string; productName: string | null; finish: string | null }[] }
type Mode = 'recolour' | 'style' | 'wholeHome' | 'exterior' | 'noPhoto'
const LS_KEY = 'hilty_design_project'

export function DesignStudio({ dict, locale, branches }: { dict: Dictionary; locale: Locale; branches: Branch[] }) {
  const t = dict.studio
  const sessionIdRef = useRef<string>('')
  useEffect(() => {
    if (!sessionIdRef.current) sessionIdRef.current = Math.random().toString(36).slice(2)
  }, [])

  const [mode, setMode] = useState<Mode | null>(null)
  const [step, setStep] = useState<string>('type')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // project + steps
  const [projectId, setProjectId] = useState<number | null>(null)
  const [sector, setSector] = useState<'residential' | 'commercial'>('residential')
  const [space, setSpace] = useState('living_room')
  const [interiorExterior, setInteriorExterior] = useState<'interior' | 'exterior'>('interior')
  const [hasPhoto, setHasPhoto] = useState(true)
  const [ownership, setOwnership] = useState(false)

  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [spaceId, setSpaceId] = useState<number | null>(null)
  const [imgDims, setImgDims] = useState<{ w: number; h: number }>({ w: 1024, h: 768 })
  const [surfaces, setSurfaces] = useState<{ type: string; confirmedByUser: boolean; strokes: Stroke[] }[]>([])

  const [prefs, setPrefs] = useState<{ temperature: string; feeling: string; preferredFinish: string; highTraffic: boolean; washability: boolean; weather: boolean; moisture: boolean; budget: string }>({ temperature: 'neutral', feeling: '', preferredFinish: '', highTraffic: false, washability: false, weather: false, moisture: false, budget: '' })
  const [palettes, setPalettes] = useState<Palette[]>([])
  const [selectedPalette, setSelectedPalette] = useState<number | null>(null)

  const [variant, setVariant] = useState<{ status: 'idle' | 'loading' | 'done' | 'fallback'; url?: string }>({ status: 'idle' })
  const [rooms, setRooms] = useState({ length: 4, width: 3, height: 2.7, doors: 1, windows: 1 })
  const [calc, setCalc] = useState<{ litres: number | null } | null>(null)
  const [lead, setLead] = useState({ name: '', phone: '', email: '', location: '', branchId: '', budget: '', timeline: '', siteVisitPreference: '' })
  const [leadConsent, setLeadConsent] = useState(false)
  const [leadRef, setLeadRef] = useState<string | null>(null)

  const steps = useMemo(() => {
    const s = ['type']
    if (hasPhoto) s.push('upload', 'surfaces')
    s.push('interview', 'palettes')
    if (hasPhoto) s.push('visual', 'compare')
    s.push('plan', 'convert')
    return s
  }, [hasPhoto])
  const go = (next: string) => {
    setError(null)
    setStep(next)
  }
  const idx = steps.indexOf(step)
  const nextStep = () => go(steps[Math.min(steps.length - 1, idx + 1)])
  const prevStep = () => go(steps[Math.max(0, idx - 1)])

  // Resume
  useEffect(() => {
    const id = typeof window !== 'undefined' ? window.localStorage.getItem(LS_KEY) : null
    if (!id) return
    ;(async () => {
      const res = await loadProjectAction(Number(id))
      if (res.ok) {
        setProjectId(Number(id))
        
        if (res.palettes?.length) {
          setPalettes(res.palettes.map((p) => ({ id: p.id, key: 'safe', title: p.name, explanation: (p as { aiExplanation?: string }).aiExplanation ?? '', roles: ((p as { roles?: { role: string; shadeName: string; hexApprox: string; finish: string }[] }).roles ?? []).map((r) => ({ role: r.role, name: r.shadeName, hex: r.hexApprox, productName: null, finish: r.finish })) })))
          setHasPhoto(false)
          go('palettes')
        }
      } else {
        window.localStorage.removeItem(LS_KEY)
      }
    })()
  }, [])

  const ensureProject = async () => {
    if (projectId) return projectId
    const res = await createProjectAction({ name: `${space} design`, sector, location: undefined, language: locale })
    setProjectId(res.projectId)
    
    if (typeof window !== 'undefined') window.localStorage.setItem(LS_KEY, String(res.projectId))
    return res.projectId
  }

  const onPickFile = (f: File) => {
    setImageFile(f)
    const url = URL.createObjectURL(f)
    setImageUrl(url)
    const img = new Image()
    img.onload = () => setImgDims({ w: img.naturalWidth, h: img.naturalHeight })
    img.src = url
  }

  const doUpload = async () => {
    if (!imageFile || !ownership) {
      setError(!ownership ? 'ownership_required' : 'no_file')
      return
    }
    setBusy(true)
    try {
      const pid = await ensureProject()
      const fd = new FormData()
      fd.set('projectId', String(pid))
      fd.set('image', imageFile)
      fd.set('surfaceType', space)
      fd.set('interiorExterior', interiorExterior)
      fd.set('ownershipConfirmed', 'true')
      const res = await uploadSpaceAction(fd)
      if (!res.ok) {
        setError(res.error)
        return
      }
      setSpaceId(res.spaceId)
      setSurfaces(res.suggestions.map((s) => ({ type: s.type, confirmedByUser: false, strokes: [] })))
      nextStep()
    } finally {
      setBusy(false)
    }
  }

  const confirmSurface = async (i: number) => {
    const updated = surfaces.map((s, j) => (j === i ? { ...s, confirmedByUser: true } : s))
    setSurfaces(updated)
    if (spaceId) await saveSurfacesAction(spaceId, updated.map((s) => ({ type: s.type, mask: s.strokes, confirmedByUser: s.confirmedByUser })))
  }

  const toPalettes = async () => {
    setBusy(true)
    try {
      const pid = await ensureProject()
      await savePreferencesAction(pid, { temperature: prefs.temperature, preferredFinish: prefs.preferredFinish, mood: prefs.feeling, budgetRange: prefs.budget, durability: [prefs.washability && 'washable', prefs.weather && 'weather', prefs.moisture && 'moisture'].filter(Boolean).join(','), factors: { highTraffic: prefs.highTraffic } })
      const res = await makePalettesAction(pid, { temperature: prefs.temperature, interiorExterior, preferredFinish: prefs.preferredFinish })
      setPalettes(res.palettes.map((p) => ({ id: p.id, key: p.key, title: p.title, explanation: p.explanation, roles: p.roles.map((r) => ({ role: r.role, name: r.name, hex: r.hex, productName: r.productName, finish: r.finish })) })))
      nextStep()
    } finally {
      setBusy(false)
    }
  }

  const generatePreview = async () => {
    if (!spaceId || !selectedPalette) return
    setVariant({ status: 'loading' })
    const confirmed = surfaces.filter((s) => s.confirmedByUser).map((s) => ({ type: s.type, confirmedByUser: true }))
    const res = await makeVariantAction({ spaceId, paletteId: selectedPalette, surfaces: confirmed, disclaimerAccepted: true, sessionId: sessionIdRef.current || 'anon' })
    if (res.ok) setVariant({ status: 'done', url: res.imageDataUrl })
    else setVariant({ status: 'fallback' })
  }

  const runCalc = async () => {
    if (!projectId) return
    setBusy(true)
    try {
      const res = await convertPlanAction({ projectId, spaceId: spaceId ?? undefined, paletteId: selectedPalette ?? undefined, rooms: [{ ...rooms, includeCeiling: true }], coats: 2, wastePct: 10 })
      const comp = res.calc.components[0]
      setCalc({ litres: comp?.litres ?? null })
    } finally {
      setBusy(false)
    }
  }

  const submitLead = async () => {
    if (!projectId || !leadConsent) {
      setError('consent_required')
      return
    }
    setBusy(true)
    try {
      const res = await saveDesignLeadAction({ projectId, name: lead.name, phone: lead.phone, email: lead.email || undefined, location: lead.location || undefined, branchId: lead.branchId ? Number(lead.branchId) : undefined, budget: lead.budget || undefined, timeline: lead.timeline || undefined, siteVisitPreference: lead.siteVisitPreference || undefined, consent: leadConsent })
      if (res.ok) {
        setLeadRef(res.reference)
        if (typeof window !== 'undefined') window.localStorage.removeItem(LS_KEY)
      } else setError(res.error)
    } finally {
      setBusy(false)
    }
  }

  const deleteProject = async () => {
    if (!projectId) return
    await removeProjectAction(projectId)
    if (typeof window !== 'undefined') window.localStorage.removeItem(LS_KEY)
    window.location.reload()
  }

  const canRender = surfaces.some((s) => s.confirmedByUser)
  const field = 'w-full rounded-lg border border-line px-3 py-2 text-sm'

  return (
    <div>
      {/* Disclaimer — always visible, never hidden in T&Cs */}
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{t.disclaimer}</div>

      {/* Stepper */}
      {mode && (
        <ol className="mb-6 flex flex-wrap gap-2 text-xs">
          {steps.map((s, i) => (
            <li key={s} className={`rounded-full px-2.5 py-1 ${i === idx ? 'bg-brand-600 text-white' : i < idx ? 'bg-brand-100 text-brand-800' : 'bg-surface-2 text-muted'}`}>
              {(t.steps as Record<string, string>)[s] ?? s}
            </li>
          ))}
        </ol>
      )}

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-800">{error}</p>}

      {/* Mode selection */}
      {!mode && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(['recolour', 'style', 'wholeHome', 'exterior', 'noPhoto'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m)
                setHasPhoto(m !== 'style' && m !== 'noPhoto')
                if (m === 'exterior') setInteriorExterior('exterior')
                go('type')
              }}
              className="rounded-2xl border border-line bg-surface p-5 text-left hover:border-brand-300"
            >
              <h3 className="font-semibold">{t.modes[m].title}</h3>
              <p className="mt-1 text-sm text-muted">{t.modes[m].body}</p>
            </button>
          ))}
        </div>
      )}

      {/* STEP: project type */}
      {mode && step === 'type' && (
        <div className="max-w-lg space-y-4">
          <label className="block text-sm font-medium">{t.q.space}
            <select value={space} onChange={(e) => setSpace(e.target.value)} className={`mt-1 ${field}`}>
              {['living_room', 'bedroom', 'kitchen', 'bathroom', 'office', 'shop', 'restaurant', 'school_institutional', 'exterior_facade', 'roof', 'boundary_wall', 'gate_metal', 'wood_surface', 'multi_room_home', 'commercial_building'].map((v) => (
                <option key={v} value={v}>{v.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </label>
          <fieldset><legend className="text-sm font-medium">{t.q.sector}</legend>
            <div className="mt-1 flex gap-4 text-sm">
              {(['residential', 'commercial'] as const).map((v) => (
                <label key={v} className="flex items-center gap-1"><input type="radio" name="sector" checked={sector === v} onChange={() => setSector(v)} />{t.q[v]}</label>
              ))}
            </div>
          </fieldset>
          <fieldset><legend className="text-sm font-medium">{t.q.hasPhoto}</legend>
            <div className="mt-1 flex gap-4 text-sm">
              <label className="flex items-center gap-1"><input type="radio" name="hasphoto" checked={hasPhoto} onChange={() => setHasPhoto(true)} />{t.q.yes}</label>
              <label className="flex items-center gap-1"><input type="radio" name="hasphoto" checked={!hasPhoto} onChange={() => setHasPhoto(false)} />{t.q.no}</label>
            </div>
          </fieldset>
          <button type="button" onClick={nextStep} className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">{t.common.next}</button>
        </div>
      )}

      {/* STEP: upload */}
      {mode && step === 'upload' && (
        <div className="max-w-xl space-y-4">
          <div className="space-y-2 rounded-xl bg-surface-2 p-4 text-sm text-muted">
            <p>🔒 {t.notices.privacy}</p>
            <p>🖼️ {t.notices.aiVisual}</p>
          </div>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => e.target.files?.[0] && onPickFile(e.target.files[0])} className={field} />
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="preview" className="max-h-64 rounded-lg border border-line" />
          )}
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={ownership} onChange={(e) => setOwnership(e.target.checked)} className="mt-0.5" />{t.notices.ownership}</label>
          <div className="flex gap-2">
            <button type="button" onClick={prevStep} className="rounded-lg border border-line px-4 py-2 text-sm">{t.common.back}</button>
            <button type="button" onClick={doUpload} disabled={busy || !imageFile || !ownership} className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{busy ? t.upload.analysing : t.common.next}</button>
          </div>
        </div>
      )}

      {/* STEP: surfaces */}
      {mode && step === 'surfaces' && imageUrl && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">{t.surfaces.title}</h2>
          <div className="flex flex-wrap gap-2">
            {surfaces.map((s, i) => (
              <button key={i} type="button" onClick={() => confirmSurface(i)} className={`rounded-full px-3 py-1.5 text-sm ${s.confirmedByUser ? 'bg-brand-600 text-white' : 'border border-line hover:bg-brand-50'}`}>
                {s.type} {s.confirmedByUser ? `· ${t.surfaces.confirmed}` : `· ${t.surfaces.confirm}`}
              </button>
            ))}
          </div>
          <MaskEditor imageUrl={imageUrl} width={imgDims.w} height={imgDims.h} dict={dict} onChange={(strokes) => setSurfaces((prev) => prev.map((s, j) => (j === 0 ? { ...s, strokes } : s)))} />
          <div className="flex gap-2">
            <button type="button" onClick={prevStep} className="rounded-lg border border-line px-4 py-2 text-sm">{t.common.back}</button>
            <button type="button" onClick={nextStep} disabled={!canRender} className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{t.common.next}</button>
          </div>
        </div>
      )}

      {/* STEP: interview */}
      {mode && step === 'interview' && (
        <div className="max-w-lg space-y-4">
          <h2 className="text-lg font-bold">{t.interview.title}</h2>
          <label className="block text-sm font-medium">{t.interview.feeling}
            <select value={prefs.feeling} onChange={(e) => setPrefs((p) => ({ ...p, feeling: e.target.value }))} className={`mt-1 ${field}`}>
              <option value="">—</option>
              {t.interview.styles.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium">{t.interview.temperature}
            <select value={prefs.temperature} onChange={(e) => setPrefs((p) => ({ ...p, temperature: e.target.value }))} className={`mt-1 ${field}`}>
              <option value="warm">Warm</option><option value="cool">Cool</option><option value="neutral">Neutral</option>
            </select>
          </label>
          <label className="block text-sm font-medium">{t.interview.budget}<input value={prefs.budget} onChange={(e) => setPrefs((p) => ({ ...p, budget: e.target.value }))} className={`mt-1 ${field}`} /></label>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-1"><input type="checkbox" checked={prefs.highTraffic} onChange={(e) => setPrefs((p) => ({ ...p, highTraffic: e.target.checked }))} />{t.interview.highTraffic}</label>
            <label className="flex items-center gap-1"><input type="checkbox" checked={prefs.washability} onChange={(e) => setPrefs((p) => ({ ...p, washability: e.target.checked }))} />{t.interview.washability}</label>
            <label className="flex items-center gap-1"><input type="checkbox" checked={prefs.weather} onChange={(e) => setPrefs((p) => ({ ...p, weather: e.target.checked }))} />{t.interview.weather}</label>
            <label className="flex items-center gap-1"><input type="checkbox" checked={prefs.moisture} onChange={(e) => setPrefs((p) => ({ ...p, moisture: e.target.checked }))} />{t.interview.moisture}</label>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={prevStep} className="rounded-lg border border-line px-4 py-2 text-sm">{t.common.back}</button>
            <button type="button" onClick={toPalettes} disabled={busy} className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{busy ? t.common.saving : t.common.next}</button>
          </div>
        </div>
      )}

      {/* STEP: palettes */}
      {mode && step === 'palettes' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">{t.palettes.title}</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {palettes.map((p) => (
              <div key={p.id} className={`rounded-2xl border p-4 ${selectedPalette === p.id ? 'border-brand-600 ring-1 ring-brand-600' : 'border-line'}`}>
                <h3 className="font-semibold">{p.title}</h3>
                <div className="mt-2 flex gap-2">
                  {p.roles.map((r) => <span key={r.role} className="h-8 w-8 rounded-full border border-line" style={{ backgroundColor: r.hex }} title={`${r.role}: ${r.name}`} />)}
                </div>
                <ul className="mt-3 space-y-1 text-sm">
                  {p.roles.map((r) => (
                    <li key={r.role}><span className="text-muted">{(t.palettes as Record<string, string>)[r.role === 'ceiling_trim' ? 'trim' : r.role] ?? r.role}:</span> {r.name}{r.productName ? ` · ${t.palettes.suitable}: ${r.productName}` : ''}</li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-muted">{p.explanation}</p>
                <p className="mt-1 text-xs text-amber-700">{t.palettes.sample}</p>
                <button type="button" onClick={() => setSelectedPalette(p.id)} className={`mt-3 rounded-lg px-4 py-2 text-sm font-semibold ${selectedPalette === p.id ? 'bg-brand-600 text-white' : 'border border-brand-600 text-brand-700'}`}>{selectedPalette === p.id ? t.palettes.chosen : t.palettes.choose}</button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={prevStep} className="rounded-lg border border-line px-4 py-2 text-sm">{t.common.back}</button>
            <button type="button" onClick={nextStep} disabled={!selectedPalette} className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{t.common.next}</button>
          </div>
        </div>
      )}

      {/* STEP: visual */}
      {mode && step === 'visual' && (
        <div className="max-w-xl space-y-4">
          <h2 className="text-lg font-bold">{t.visual.generate}</h2>
          {variant.status === 'idle' && <button type="button" onClick={generatePreview} className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white">{t.visual.generate}</button>}
          {variant.status === 'loading' && <p className="text-sm text-muted">{t.visual.generating}</p>}
          {variant.status === 'fallback' && <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">{t.visual.fallback}</p>}
          {variant.status === 'done' && variant.url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={variant.url} alt="preview" className="rounded-lg border border-line" />
          )}
          <div className="flex gap-2">
            <button type="button" onClick={prevStep} className="rounded-lg border border-line px-4 py-2 text-sm">{t.common.back}</button>
            <button type="button" onClick={nextStep} className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white">{t.common.next}</button>
          </div>
        </div>
      )}

      {/* STEP: compare */}
      {mode && step === 'compare' && imageUrl && (
        <div className="max-w-xl space-y-4">
          <h2 className="text-lg font-bold">{t.compare.title}</h2>
          <CompareSlider originalUrl={imageUrl} designUrl={variant.url ?? imageUrl} originalLabel={t.compare.original} designLabel={t.compare.design} />
          <div className="flex gap-2">
            <button type="button" onClick={prevStep} className="rounded-lg border border-line px-4 py-2 text-sm">{t.common.back}</button>
            <button type="button" onClick={nextStep} className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white">{t.common.next}</button>
          </div>
        </div>
      )}

      {/* STEP: plan */}
      {mode && step === 'plan' && (
        <div className="max-w-lg space-y-4">
          <h2 className="text-lg font-bold">{t.plan.title}</h2>
          <p className="text-sm text-muted">{t.plan.measurements} ({t.plan.note})</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(['length', 'width', 'height', 'doors', 'windows'] as const).map((k) => (
              <label key={k} className="text-sm">{k}
                <input type="number" step="0.1" value={rooms[k]} onChange={(e) => setRooms((r) => ({ ...r, [k]: Number(e.target.value) }))} className={`mt-1 ${field}`} />
              </label>
            ))}
          </div>
          <button type="button" onClick={runCalc} disabled={busy} className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{t.plan.calculate}</button>
          {calc && <p className="rounded-lg bg-surface-2 p-3 text-sm">{t.plan.litres}: <strong>{calc.litres == null ? '—' : `${calc.litres} L`}</strong> <span className="text-muted">({t.plan.note})</span></p>}
          <div className="flex gap-2">
            <button type="button" onClick={prevStep} className="rounded-lg border border-line px-4 py-2 text-sm">{t.common.back}</button>
            <button type="button" onClick={nextStep} className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white">{t.common.next}</button>
          </div>
        </div>
      )}

      {/* STEP: convert + lead */}
      {mode && step === 'convert' && (
        <div className="max-w-lg space-y-4">
          <h2 className="text-lg font-bold">{t.convert.title}</h2>
          {leadRef ? (
            <div className="rounded-xl bg-green-50 p-4 text-sm text-green-800">
              <p>{t.lead.success}</p>
              <p className="mt-1">{t.lead.ref}: <strong>{leadRef}</strong></p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={`${SITE.whatsappHref}?text=${encodeURIComponent(`Hello Hilty, my design reference is ${leadRef}.`)}`} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white">{t.convert.whatsapp}</a>
                <button type="button" onClick={deleteProject} className="rounded-lg border border-line px-4 py-2 text-sm text-red-600">{t.common.deleteProject}</button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input placeholder={dict.forms.name} value={lead.name} onChange={(e) => setLead((l) => ({ ...l, name: e.target.value }))} className={field} />
                <input placeholder={dict.forms.phone} value={lead.phone} onChange={(e) => setLead((l) => ({ ...l, phone: e.target.value }))} className={field} />
                <input placeholder={dict.forms.email} value={lead.email} onChange={(e) => setLead((l) => ({ ...l, email: e.target.value }))} className={field} />
                <input placeholder={t.convert.title} value={lead.location} onChange={(e) => setLead((l) => ({ ...l, location: e.target.value }))} className={field} />
                <select value={lead.branchId} onChange={(e) => setLead((l) => ({ ...l, branchId: e.target.value }))} className={field}>
                  <option value="">{dict.calc.branch}</option>
                  {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <input placeholder={t.lead.timeline} value={lead.timeline} onChange={(e) => setLead((l) => ({ ...l, timeline: e.target.value }))} className={field} />
              </div>
              <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={leadConsent} onChange={(e) => setLeadConsent(e.target.checked)} className="mt-0.5" />{dict.forms.consent}</label>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={submitLead} disabled={busy} className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{t.lead.submit}</button>
                <button type="button" onClick={deleteProject} className="rounded-lg border border-line px-4 py-2 text-sm text-red-600">{t.common.deleteProject}</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
