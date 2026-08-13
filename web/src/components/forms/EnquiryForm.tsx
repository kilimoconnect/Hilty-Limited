'use client'

import { useActionState } from 'react'
import { enquiryAction, type FormState } from '../../app/(frontend)/actions'
import type { Dictionary } from '../../i18n/dictionaries'
import { Consent, Field, FormMessage, SelectInput, SubmitButton, TextArea, TextInput } from './ui'

export function EnquiryForm({ t, defaultType = 'project_pricing' }: { t: Dictionary; defaultType?: string }) {
  const [state, action] = useActionState<FormState, FormData>(enquiryAction, {})
  const f = t.forms
  const success = `${f.successGeneric}${state.reference ? ` (${f.successRef} ${state.reference})` : ''}`

  return (
    <form action={action} className="space-y-4">
      <FormMessage ok={state.ok} error={state.error} success={success} />
      <Field label={f.enquiryType} htmlFor="e-type" required>
        <SelectInput id="e-type" name="type" defaultValue={defaultType}>
          <option value="contractor_account">Contractor account application</option>
          <option value="developer">Developer enquiry</option>
          <option value="project_pricing">Project-pricing enquiry</option>
          <option value="bulk_supply">Bulk-supply enquiry</option>
          <option value="general">General</option>
        </SelectInput>
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={f.name} htmlFor="e-name" required>
          <TextInput id="e-name" name="name" required />
        </Field>
        <Field label={f.company} htmlFor="e-company">
          <TextInput id="e-company" name="company" />
        </Field>
        <Field label={f.phone} htmlFor="e-phone" required>
          <TextInput id="e-phone" name="phone" type="tel" required />
        </Field>
        <Field label={f.email} htmlFor="e-email">
          <TextInput id="e-email" name="email" type="email" />
        </Field>
        <Field label={f.role} htmlFor="e-role">
          <TextInput id="e-role" name="role" />
        </Field>
        <Field label={f.registrationNumber} htmlFor="e-reg">
          <TextInput id="e-reg" name="registrationNumber" />
        </Field>
        <Field label={f.estimatedArea} htmlFor="e-area">
          <TextInput id="e-area" name="estimatedArea" type="number" min={0} />
        </Field>
      </div>
      <Field label={f.projectDescription} htmlFor="e-desc">
        <TextArea id="e-desc" name="projectDescription" />
      </Field>
      <Field label={f.quantities} htmlFor="e-qty">
        <TextArea id="e-qty" name="quantities" rows={3} />
      </Field>
      <Field label={f.documents} htmlFor="e-docs" hint={f.documentsHint}>
        <input
          id="e-docs"
          name="documents"
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.xlsx,.xls,.csv,.doc,.docx"
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-brand-50 file:px-3 file:py-1 file:text-brand-700"
        />
      </Field>
      <Consent label={f.consent} />
      <p className="text-xs text-muted">{f.requiredNote}</p>
      <SubmitButton label={t.pages.pro.apply} pendingLabel={f.submitting} />
    </form>
  )
}
