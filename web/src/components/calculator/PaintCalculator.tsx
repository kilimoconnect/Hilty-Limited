'use client'

import { useActionState, useMemo, useState } from 'react'
import { quotationAction, type FormState } from '../../app/(frontend)/actions'
import type { Dictionary } from '../../i18n/dictionaries'
import type { CalcProduct } from '../../lib/payload'
import { calculate, DEFAULT_WASTE_PCT, type ComponentInput, type RoomInput } from '../../lib/calc'
import { Consent, Field, FormMessage, SubmitButton, TextInput } from '../forms/ui'
import { Button } from '../ui/Button'

type Branch = { id: number; name: string }
const emptyRoom = (): RoomInput => ({ length: 4, width: 3, height: 2.7, doors: 1, windows: 1, includeCeiling: true })
const fmt = (n: number) => (Math.round(n * 100) / 100).toLocaleString()

export function PaintCalculator({ t, products, branches, whatsapp }: { t: Dictionary; products: CalcProduct[]; branches: Branch[]; whatsapp: string }) {
  const c = t.calc
  const [state, action] = useActionState<FormState, FormData>(quotationAction, {})

  const [projectType, setProjectType] = useState('')
  const [interiorExterior, setInteriorExterior] = useState<'interior' | 'exterior'>('interior')
  const [rooms, setRooms] = useState<RoomInput[]>([emptyRoom()])
  const [topcoatId, setTopcoatId] = useState<number | ''>(products[0]?.id ?? '')
  const [topcoatCoats, setTopcoatCoats] = useState(2)
  const [includePrimer, setIncludePrimer] = useState(false)
  const [primerId, setPrimerId] = useState<number | ''>('')
  const [primerCoats, setPrimerCoats] = useState(1)
  const [wastePct, setWastePct] = useState(DEFAULT_WASTE_PCT)
  const [branchId, setBranchId] = useState<number | ''>('')
  const [budget, setBudget] = useState('')

  const productById = (id: number | '') => (id === '' ? undefined : products.find((p) => p.id === id))

  const result = useMemo(() => {
    const comps: ComponentInput[] = []
    const tc = productById(topcoatId)
    if (tc) comps.push({ key: 'topcoat', label: c.topcoat, coats: topcoatCoats, coverage: tc.coverage, productId: tc.id, productName: tc.name, packSizes: tc.packSizes, appliesTo: 'both' })
    if (includePrimer) {
      const pr = productById(primerId)
      if (pr) comps.push({ key: 'primer', label: c.primer, coats: primerCoats, coverage: pr.coverage, productId: pr.id, productName: pr.name, packSizes: pr.packSizes, appliesTo: 'both' })
    }
    return calculate(rooms, comps, { wastePct })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms, topcoatId, topcoatCoats, includePrimer, primerId, primerCoats, wastePct])

  const updateRoom = (i: number, patch: Partial<RoomInput>) => setRooms((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)))
  const numInput = (v: string) => (v === '' ? 0 : Number(v))

  if (state.ok) {
    const totalArea = result.totals.wallArea + result.totals.ceilingArea
    const lines = result.components.map((x) => `${x.label}: ${x.litres == null ? '—' : x.litres + ' L'}`).join(', ')
    const waText = `Hello Hilty, my quotation reference is ${state.reference}. Project: ${projectType || '-'}, area ~${fmt(totalArea)} m². ${lines}`
    return (
      <div className="rounded-2xl border border-line bg-surface p-6 print:border-0">
        <h2 className="text-xl font-bold text-green-800">{c.successTitle}</h2>
        <p className="mt-1 text-muted">{c.successBody}</p>
        <p className="mt-4 text-sm">
          {c.yourRef}: <strong>{state.reference}</strong>
        </p>
        <div className="mt-4 rounded-lg bg-surface-2 p-4 text-sm">
          <p className="font-semibold">{c.results} — {fmt(totalArea)} {c.m2}</p>
          <ul className="mt-2 space-y-1">
            {result.components.map((x) => (
              <li key={x.key}>
                {x.label}: {x.litres == null ? c.coverageNotVerified : `${fmt(x.litres)} ${c.litres}`}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">{c.estimateNote}</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-3 print:hidden">
          <button type="button" onClick={() => window.print()} className="rounded-lg border border-brand-600 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">
            {c.print}
          </button>
          <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(waText)}`} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:brightness-95">
            {c.whatsapp}
          </a>
          <Button href="/design-studio" variant="outline">
            🎨 {t.studio.cta}
          </Button>
          <Button href="/paint-calculator" variant="ghost">
            {c.newCalc}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form action={action} className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
      {/* Left: inputs */}
      <div className="space-y-8">
        {/* Project */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={c.projectType} htmlFor="cx-ptype">
            <TextInput id="cx-ptype" name="projectType" value={projectType} onChange={(e) => setProjectType(e.target.value)} />
          </Field>
          <Field label={c.interiorExterior} htmlFor="cx-ie">
            <select id="cx-ie" name="interiorExterior" value={interiorExterior} onChange={(e) => setInteriorExterior(e.target.value as 'interior' | 'exterior')} className="w-full rounded-lg border border-line px-3 py-2 text-sm">
              <option value="interior">{c.interior}</option>
              <option value="exterior">{c.exterior}</option>
            </select>
          </Field>
        </div>

        {/* Rooms */}
        <div>
          <h2 className="text-lg font-bold">{c.rooms}</h2>
          <div className="mt-3 space-y-4">
            {rooms.map((r, i) => (
              <fieldset key={i} className="rounded-xl border border-line p-4">
                <legend className="px-1 text-sm font-medium">
                  {c.room} {i + 1}
                </legend>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <Field label={c.length} htmlFor={`l-${i}`}>
                    <TextInput id={`l-${i}`} type="number" step="0.1" min={0} value={r.length} onChange={(e) => updateRoom(i, { length: numInput(e.target.value) })} />
                  </Field>
                  <Field label={c.width} htmlFor={`w-${i}`}>
                    <TextInput id={`w-${i}`} type="number" step="0.1" min={0} value={r.width} onChange={(e) => updateRoom(i, { width: numInput(e.target.value) })} />
                  </Field>
                  <Field label={c.height} htmlFor={`h-${i}`}>
                    <TextInput id={`h-${i}`} type="number" step="0.1" min={0} value={r.height} onChange={(e) => updateRoom(i, { height: numInput(e.target.value) })} />
                  </Field>
                  <Field label={c.doors} htmlFor={`d-${i}`}>
                    <TextInput id={`d-${i}`} type="number" step="1" min={0} value={r.doors} onChange={(e) => updateRoom(i, { doors: numInput(e.target.value) })} />
                  </Field>
                  <Field label={c.windows} htmlFor={`wd-${i}`}>
                    <TextInput id={`wd-${i}`} type="number" step="1" min={0} value={r.windows} onChange={(e) => updateRoom(i, { windows: numInput(e.target.value) })} />
                  </Field>
                  <label className="flex items-center gap-2 self-end pb-2 text-sm">
                    <input type="checkbox" checked={r.includeCeiling} onChange={(e) => updateRoom(i, { includeCeiling: e.target.checked })} />
                    {c.includeCeiling}
                  </label>
                </div>
                {rooms.length > 1 && (
                  <button type="button" onClick={() => setRooms((rs) => rs.filter((_, j) => j !== i))} className="mt-3 text-xs font-medium text-red-600 hover:underline">
                    {c.remove}
                  </button>
                )}
              </fieldset>
            ))}
          </div>
          <button type="button" onClick={() => setRooms((rs) => [...rs, emptyRoom()])} className="mt-3 rounded-lg border border-brand-600 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">
            + {c.addRoom}
          </button>
        </div>

        {/* System */}
        <div>
          <h2 className="text-lg font-bold">{c.system}</h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={c.topcoat} htmlFor="cx-tc">
              <select id="cx-tc" value={topcoatId} onChange={(e) => setTopcoatId(e.target.value ? Number(e.target.value) : '')} className="w-full rounded-lg border border-line px-3 py-2 text-sm">
                <option value="">{c.chooseProduct}</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.coverageVerified ? '' : ' — coverage TBC'}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={c.coats} htmlFor="cx-tcc">
              <TextInput id="cx-tcc" type="number" min={1} max={6} value={topcoatCoats} onChange={(e) => setTopcoatCoats(numInput(e.target.value))} />
            </Field>
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={includePrimer} onChange={(e) => setIncludePrimer(e.target.checked)} />
            {c.includePrimer}
          </label>
          {includePrimer && (
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={c.primer} htmlFor="cx-pr">
                <select id="cx-pr" value={primerId} onChange={(e) => setPrimerId(e.target.value ? Number(e.target.value) : '')} className="w-full rounded-lg border border-line px-3 py-2 text-sm">
                  <option value="">{c.chooseProduct}</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                      {p.coverageVerified ? '' : ' — coverage TBC'}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={c.coats} htmlFor="cx-prc">
                <TextInput id="cx-prc" type="number" min={1} max={6} value={primerCoats} onChange={(e) => setPrimerCoats(numInput(e.target.value))} />
              </Field>
            </div>
          )}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label={c.waste} htmlFor="cx-waste">
              <TextInput id="cx-waste" type="number" min={0} max={50} value={wastePct} onChange={(e) => setWastePct(numInput(e.target.value))} />
            </Field>
            <Field label={c.branch} htmlFor="cx-branch">
              <select id="cx-branch" value={branchId} onChange={(e) => setBranchId(e.target.value ? Number(e.target.value) : '')} className="w-full rounded-lg border border-line px-3 py-2 text-sm">
                <option value="">{c.none}</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={c.budget} htmlFor="cx-budget">
              <TextInput id="cx-budget" value={budget} onChange={(e) => setBudget(e.target.value)} />
            </Field>
          </div>
        </div>

        {/* Your details */}
        <div>
          <h2 className="text-lg font-bold">{c.yourDetails}</h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t.forms.name} htmlFor="cx-name" required>
              <TextInput id="cx-name" name="customerName" required />
            </Field>
            <Field label={t.forms.phone} htmlFor="cx-phone" required>
              <TextInput id="cx-phone" name="phone" type="tel" required />
            </Field>
            <Field label={t.forms.email} htmlFor="cx-email">
              <TextInput id="cx-email" name="email" type="email" />
            </Field>
            <Field label={c.location} htmlFor="cx-loc">
              <TextInput id="cx-loc" name="location" />
            </Field>
          </div>
          <div className="mt-4">
            <Field label={c.documents} htmlFor="cx-docs" hint={c.documentsHint}>
              <input id="cx-docs" name="documents" type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.xlsx,.xls,.csv,.doc,.docx" className="w-full rounded-lg border border-line px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-brand-50 file:px-3 file:py-1 file:text-brand-700" />
            </Field>
          </div>
          <div className="mt-4">
            <Consent label={t.forms.consent} />
          </div>
          {/* Honeypot (spam) */}
          <div aria-hidden className="hidden">
            <label>
              Website <input type="text" name="company_website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
        </div>

        {/* Hidden fields carrying calculator state into the submission */}
        <input type="hidden" name="rooms" value={JSON.stringify(rooms)} />
        <input type="hidden" name="topcoatProductId" value={topcoatId} />
        <input type="hidden" name="topcoatCoats" value={topcoatCoats} />
        <input type="hidden" name="includePrimer" value={includePrimer ? 'true' : ''} />
        <input type="hidden" name="primerProductId" value={primerId} />
        <input type="hidden" name="primerCoats" value={primerCoats} />
        <input type="hidden" name="wastePct" value={wastePct} />
        <input type="hidden" name="branchId" value={branchId} />
        <input type="hidden" name="budget" value={budget} />

        <div>
          <FormMessage error={state.error} success="" />
          <div className="mt-3">
            <SubmitButton label={c.submit} pendingLabel={c.submitting} />
          </div>
        </div>
      </div>

      {/* Right: live estimate */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{c.results}</h2>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">{c.estimateBadge}</span>
          </div>

          {result.issues.length > 0 ? (
            <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">
              <p className="font-medium">{c.issues}</p>
              <ul className="mt-1 list-disc pl-5">
                {result.issues.slice(0, 5).map((iss, k) => (
                  <li key={k}>{iss.room != null ? `${c.room} ${iss.room + 1}: ` : ''}{iss.message}</li>
                ))}
              </ul>
            </div>
          ) : (
            <>
              <dl className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">{c.wallArea}</dt>
                  <dd>{fmt(result.totals.wallArea)} {c.m2}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">{c.ceilingArea}</dt>
                  <dd>{fmt(result.totals.ceilingArea)} {c.m2}</dd>
                </div>
                <div className="flex justify-between border-t border-line pt-1 font-semibold">
                  <dt>{c.totalArea}</dt>
                  <dd>{fmt(result.totals.wallArea + result.totals.ceilingArea)} {c.m2}</dd>
                </div>
              </dl>

              <div className="mt-4 space-y-3">
                {result.components.length === 0 && <p className="text-sm text-muted">{c.selectTopcoat}</p>}
                {result.components.map((x) => (
                  <div key={x.key} className="rounded-lg border border-line p-3">
                    <p className="text-sm font-semibold">{x.label}{x.productName ? ` — ${x.productName}` : ''}</p>
                    {x.coverageMissing ? (
                      <p className="mt-1 text-xs text-amber-700">{c.coverageNotVerified}</p>
                    ) : x.tooLarge ? (
                      <p className="mt-1 text-xs text-amber-700">{c.tooLarge}</p>
                    ) : (
                      <>
                        <p className="mt-1 text-sm">
                          {c.litresNeeded}: <strong>{fmt(x.litres ?? 0)} {c.litres}</strong> <span className="text-muted">({x.coats} × {fmt(x.area)} {c.m2})</span>
                        </p>
                        {x.packs && x.packs.length > 0 && (
                          <p className="mt-1 text-xs text-muted">
                            {c.packs}: {x.packs.map((p) => `${p.qty} × ${p.size} ${c.litres}`).join(', ')}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          <p className="mt-4 text-xs text-muted">{c.estimateNote}</p>
        </div>
      </aside>
    </form>
  )
}
