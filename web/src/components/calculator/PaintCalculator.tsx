'use client'

import { useActionState, useMemo, useState } from 'react'
import { quotationAction, type FormState } from '../../app/(frontend)/actions'
import type { Dictionary } from '../../i18n/dictionaries'
import type { CalcProduct } from '../../lib/payload'
import { calculate, DEFAULT_WASTE_PCT, type ComponentInput, type RoomInput } from '../../lib/calc'
import { Consent, Field, FormMessage, SubmitButton, TextInput } from '../forms/ui'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { InfoIcon, PaletteIcon, WhatsAppIcon } from '../ui/icons'

const selectCls =
  'w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-[0.9375rem] outline-none transition-colors focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10'
const checkboxCls = 'h-4 w-4 shrink-0 accent-[var(--color-brand-600)]'

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
      <div className="mx-auto max-w-2xl rounded-lg border border-line bg-surface p-8 shadow-soft print:border-0 print:shadow-none">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-success-bg text-success">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <h2 className="mt-6 text-h2">{c.successTitle}</h2>
        <p className="mt-3 text-lead text-muted">{c.successBody}</p>

        <p className="mt-6 rounded-md bg-surface-2 px-4 py-3 text-[0.9375rem]">
          {c.yourRef}: <strong className="tabular font-display font-bold">{state.reference}</strong>
        </p>

        <div className="mt-6 rounded-md border border-line">
          <p className="tabular border-b border-line px-5 py-3.5 font-display font-semibold">
            {c.results} — {fmt(totalArea)} {c.m2}
          </p>
          <ul className="divide-y divide-line text-[0.9375rem]">
            {result.components.map((x) => (
              <li key={x.key} className="flex items-center justify-between gap-4 px-5 py-3">
                <span>{x.label}</span>
                <span className="tabular font-semibold">
                  {x.litres == null ? c.coverageNotVerified : `${fmt(x.litres)} ${c.litres}`}
                </span>
              </li>
            ))}
          </ul>
          <p className="border-t border-line px-5 py-3 text-[0.8125rem] leading-relaxed text-muted">{c.estimateNote}</p>
        </div>

        <div className="mt-7 flex flex-wrap gap-3 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-11 items-center justify-center rounded-md border border-line-strong bg-surface px-5 font-display text-[0.9375rem] font-semibold transition-colors hover:border-brand-600 hover:text-brand-700"
          >
            {c.print}
          </button>
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(waText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-whatsapp px-5 font-display text-[0.9375rem] font-semibold text-white transition-colors hover:bg-whatsapp-dark"
          >
            <WhatsAppIcon width={17} height={17} />
            {c.whatsapp}
          </a>
          <Button href="/design-studio" variant="outline">
            <PaletteIcon width={17} height={17} className="text-accent-500" /> {t.studio.cta}
          </Button>
          <Button href="/paint-calculator" variant="ghost">
            {c.newCalc}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form action={action} className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_23rem] lg:gap-14">
      {/* Left: inputs */}
      <div className="space-y-12">
        {/* Project */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={c.projectType} htmlFor="cx-ptype">
            <TextInput id="cx-ptype" name="projectType" value={projectType} onChange={(e) => setProjectType(e.target.value)} />
          </Field>
          <Field label={c.interiorExterior} htmlFor="cx-ie">
            <select id="cx-ie" name="interiorExterior" value={interiorExterior} onChange={(e) => setInteriorExterior(e.target.value as 'interior' | 'exterior')} className={selectCls}>
              <option value="interior">{c.interior}</option>
              <option value="exterior">{c.exterior}</option>
            </select>
          </Field>
        </div>

        {/* Rooms */}
        <div>
          <h2 className="border-b border-line pb-3 font-display text-h3 font-semibold">{c.rooms}</h2>
          <div className="mt-3 space-y-4">
            {rooms.map((r, i) => (
              <fieldset key={i} className="rounded-lg border border-line bg-surface-2 p-5">
                <legend className="rounded-sm bg-surface px-2.5 py-1 font-display text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-muted ring-1 ring-inset ring-line">
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
                  <label className="flex cursor-pointer items-center gap-2.5 self-end pb-2.5 text-[0.9375rem]">
                    <input type="checkbox" checked={r.includeCeiling} onChange={(e) => updateRoom(i, { includeCeiling: e.target.checked })} className={checkboxCls} />
                    {c.includeCeiling}
                  </label>
                </div>
                {rooms.length > 1 && (
                  <button type="button" onClick={() => setRooms((rs) => rs.filter((_, j) => j !== i))} className="link-quiet mt-4 font-display text-[0.8125rem] font-semibold text-danger">
                    {c.remove}
                  </button>
                )}
              </fieldset>
            ))}
          </div>
          <button type="button" onClick={() => setRooms((rs) => [...rs, emptyRoom()])} className="mt-4 inline-flex h-10 items-center gap-2 rounded-md border border-dashed border-line-strong px-4 font-display text-sm font-semibold transition-colors hover:border-brand-600 hover:text-brand-700">
            + {c.addRoom}
          </button>
        </div>

        {/* System */}
        <div>
          <h2 className="border-b border-line pb-3 font-display text-h3 font-semibold">{c.system}</h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={c.topcoat} htmlFor="cx-tc">
              <select id="cx-tc" value={topcoatId} onChange={(e) => setTopcoatId(e.target.value ? Number(e.target.value) : '')} className={selectCls}>
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
          <label className="mt-5 flex cursor-pointer items-center gap-2.5 text-[0.9375rem]">
            <input type="checkbox" checked={includePrimer} onChange={(e) => setIncludePrimer(e.target.checked)} className={checkboxCls} />
            {c.includePrimer}
          </label>
          {includePrimer && (
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={c.primer} htmlFor="cx-pr">
                <select id="cx-pr" value={primerId} onChange={(e) => setPrimerId(e.target.value ? Number(e.target.value) : '')} className={selectCls}>
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
              <select id="cx-branch" value={branchId} onChange={(e) => setBranchId(e.target.value ? Number(e.target.value) : '')} className={selectCls}>
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
          <h2 className="border-b border-line pb-3 font-display text-h3 font-semibold">{c.yourDetails}</h2>
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
              <input id="cx-docs" name="documents" type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.xlsx,.xls,.csv,.doc,.docx" className="w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-[0.9375rem] file:mr-3 file:rounded-sm file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:font-display file:text-[0.8125rem] file:font-semibold file:text-brand-700" />
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
      <aside className="lg:sticky lg:top-32 lg:self-start">
        <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-line bg-surface-2 px-5 py-4">
            <h2 className="font-display text-h3 font-semibold">{c.results}</h2>
            <Badge tone="warning" className="max-w-full leading-snug">{c.estimateBadge}</Badge>
          </div>

          <div className="p-5">
            {result.issues.length > 0 ? (
              <div className="rounded-md border border-danger/20 bg-danger-bg p-4 text-[0.9375rem] text-danger">
                <p className="font-display font-semibold">{c.issues}</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {result.issues.slice(0, 5).map((iss, k) => (
                    <li key={k}>{iss.room != null ? `${c.room} ${iss.room + 1}: ` : ''}{iss.message}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <>
                <dl className="divide-y divide-line border-y border-line text-[0.9375rem]">
                  <div className="flex justify-between py-2.5">
                    <dt className="text-muted">{c.wallArea}</dt>
                    <dd className="tabular font-medium">{fmt(result.totals.wallArea)} {c.m2}</dd>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <dt className="text-muted">{c.ceilingArea}</dt>
                    <dd className="tabular font-medium">{fmt(result.totals.ceilingArea)} {c.m2}</dd>
                  </div>
                  <div className="flex items-baseline justify-between py-3">
                    <dt className="font-display font-semibold">{c.totalArea}</dt>
                    <dd className="tabular font-display text-xl font-bold text-accent-500">
                      {fmt(result.totals.wallArea + result.totals.ceilingArea)} <span className="text-base">{c.m2}</span>
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 space-y-3">
                  {result.components.length === 0 && <p className="text-[0.9375rem] text-muted">{c.selectTopcoat}</p>}
                  {result.components.map((x) => (
                    <div key={x.key} className="rounded-md bg-surface-2 p-4">
                      <p className="font-display text-[0.9375rem] font-semibold">
                        {x.label}
                        {x.productName ? <span className="font-normal text-muted"> — {x.productName}</span> : ''}
                      </p>
                      {x.coverageMissing ? (
                        <p className="mt-1.5 text-[0.8125rem] text-warning">{c.coverageNotVerified}</p>
                      ) : x.tooLarge ? (
                        <p className="mt-1.5 text-[0.8125rem] text-warning">{c.tooLarge}</p>
                      ) : (
                        <>
                          <p className="tabular mt-2 text-[0.9375rem]">
                            {c.litresNeeded}: <strong className="font-display font-bold">{fmt(x.litres ?? 0)} {c.litres}</strong>{' '}
                            <span className="text-muted">({x.coats} × {fmt(x.area)} {c.m2})</span>
                          </p>
                          {x.packs && x.packs.length > 0 && (
                            <p className="tabular mt-1.5 text-[0.8125rem] text-muted">
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
          </div>

          <p className="flex items-start gap-2.5 border-t border-line bg-surface-2 px-5 py-4 text-[0.8125rem] leading-relaxed text-muted">
            <InfoIcon width={15} height={15} className="mt-0.5 shrink-0 text-brand-400" />
            {c.estimateNote}
          </p>
        </div>
      </aside>
    </form>
  )
}
