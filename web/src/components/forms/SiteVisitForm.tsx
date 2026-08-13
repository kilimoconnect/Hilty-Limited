'use client'

import { useActionState } from 'react'
import { siteVisitAction, type FormState } from '../../app/(frontend)/actions'
import type { Dictionary } from '../../i18n/dictionaries'
import { Consent, Field, FormMessage, SubmitButton, TextArea, TextInput } from './ui'

export function SiteVisitForm({ t, serviceContext }: { t: Dictionary; serviceContext?: string }) {
  const [state, action] = useActionState<FormState, FormData>(siteVisitAction, {})
  const f = t.forms
  const success = `${f.successGeneric}${state.reference ? ` (${f.successRef} ${state.reference})` : ''}`

  return (
    <form action={action} className="space-y-4">
      {serviceContext && <input type="hidden" name="serviceContext" value={serviceContext} />}
      <FormMessage ok={state.ok} error={state.error} success={success} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={f.name} htmlFor="sv-name" required>
          <TextInput id="sv-name" name="name" required />
        </Field>
        <Field label={f.phone} htmlFor="sv-phone" required>
          <TextInput id="sv-phone" name="phone" type="tel" required />
        </Field>
        <Field label={f.email} htmlFor="sv-email">
          <TextInput id="sv-email" name="email" type="email" />
        </Field>
        <Field label={f.location} htmlFor="sv-location">
          <TextInput id="sv-location" name="location" />
        </Field>
        <Field label={f.preferredDate} htmlFor="sv-date">
          <TextInput id="sv-date" name="preferredDate" type="date" />
        </Field>
        <Field label={f.propertyType} htmlFor="sv-prop">
          <TextInput id="sv-prop" name="propertyType" />
        </Field>
      </div>
      <Field label={f.notes} htmlFor="sv-notes">
        <TextArea id="sv-notes" name="notes" />
      </Field>
      <Consent label={f.consent} />
      <p className="text-xs text-muted">{f.requiredNote}</p>
      <SubmitButton label={t.pages.services.requestVisit} pendingLabel={f.submitting} />
    </form>
  )
}
