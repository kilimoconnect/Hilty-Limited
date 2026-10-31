'use client'

import { useActionState } from 'react'
import { quotationAction, type FormState } from '../../app/(frontend)/actions'
import type { Dictionary } from '../../i18n/dictionaries'
import { Consent, Field, FormMessage, SelectInput, SubmitButton, TextArea, TextInput } from './ui'

type Branch = { id: number; name: string }

export function QuotationForm({
  t,
  branches = [],
  defaultProductSlug,
}: {
  t: Dictionary
  branches?: Branch[]
  defaultProductSlug?: string
}) {
  const [state, action] = useActionState<FormState, FormData>(quotationAction, {})
  const f = t.forms
  const success = `${f.successGeneric}${state.reference ? ` (${f.successRef} ${state.reference})` : ''}`

  return (
    <form action={action} className="space-y-4">
      {/* Honeypot (hidden from users, catches bots) */}
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {defaultProductSlug && <input type="hidden" name="productSlug" value={defaultProductSlug} />}

      <FormMessage ok={state.ok} error={state.error} success={success} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={f.name} htmlFor="q-name" required>
          <TextInput id="q-name" name="customerName" required />
        </Field>
        <Field label={f.phone} htmlFor="q-phone" required>
          <TextInput id="q-phone" name="phone" type="tel" required />
        </Field>
        <Field label={f.email} htmlFor="q-email">
          <TextInput id="q-email" name="email" type="email" />
        </Field>
        <Field label={f.location} htmlFor="q-location">
          <TextInput id="q-location" name="location" />
        </Field>
        <Field label={f.projectType} htmlFor="q-ptype" hint={f.projectTypeHint}>
          <TextInput id="q-ptype" name="projectType" />
        </Field>
        <Field label={f.interiorExterior} htmlFor="q-ie">
          <SelectInput id="q-ie" name="interiorExterior" defaultValue="">
            <option value="">{f.either}</option>
            <option value="interior">{t.calc.interior}</option>
            <option value="exterior">{t.calc.exterior}</option>
          </SelectInput>
        </Field>
        <Field label={f.estimatedArea} htmlFor="q-area">
          <TextInput id="q-area" name="estimatedArea" type="number" min={0} />
        </Field>
        <Field label={f.budget} htmlFor="q-budget">
          <TextInput id="q-budget" name="budget" />
        </Field>
        {branches.length > 0 && (
          <Field label={t.calc.branch} htmlFor="q-branch">
            <SelectInput id="q-branch" name="branchId" defaultValue="">
              <option value="">{t.catalogue.any}</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </SelectInput>
          </Field>
        )}
      </div>

      <Field label={f.projectDescription} htmlFor="q-desc" required>
        <TextArea id="q-desc" name="description" rows={5} required />
      </Field>

      <Field label={f.documents} htmlFor="q-docs" hint={f.documentsHint}>
        <input
          id="q-docs"
          name="documents"
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.xlsx,.xls,.csv,.doc,.docx"
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-brand-50 file:px-3 file:py-1 file:text-brand-700"
        />
      </Field>

      <Consent label={f.consent} />
      <p className="text-xs text-muted">{f.requiredNote}</p>
      <SubmitButton label={f.quoteSubmit} pendingLabel={f.submitting} />
    </form>
  )
}
