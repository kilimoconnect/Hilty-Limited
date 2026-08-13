'use client'

import { useActionState } from 'react'
import { painterAction, type FormState } from '../../app/(frontend)/actions'
import type { Dictionary } from '../../i18n/dictionaries'
import { Consent, Field, FormMessage, SelectInput, SubmitButton, TextInput } from './ui'

export function PainterForm({ t }: { t: Dictionary }) {
  const [state, action] = useActionState<FormState, FormData>(painterAction, {})
  const f = t.forms
  const success = `${f.successGeneric}`

  return (
    <form action={action} className="space-y-4">
      <FormMessage ok={state.ok} error={state.error} success={success} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={f.name} htmlFor="p-name" required>
          <TextInput id="p-name" name="fullName" required />
        </Field>
        <Field label={f.painterType} htmlFor="p-type">
          <SelectInput id="p-type" name="type" defaultValue="painter">
            <option value="painter">{f.typePainter}</option>
            <option value="contractor">{f.typeContractor}</option>
            <option value="company">{f.typeCompany}</option>
          </SelectInput>
        </Field>
        <Field label={f.phone} htmlFor="p-phone" required>
          <TextInput id="p-phone" name="phone" type="tel" required />
        </Field>
        <Field label={f.whatsapp} htmlFor="p-wa">
          <TextInput id="p-wa" name="whatsapp" type="tel" />
        </Field>
        <Field label={f.email} htmlFor="p-email">
          <TextInput id="p-email" name="email" type="email" />
        </Field>
        <Field label={f.region} htmlFor="p-region">
          <TextInput id="p-region" name="region" />
        </Field>
        <Field label={f.districts} htmlFor="p-districts" hint={f.districtsHint}>
          <TextInput id="p-districts" name="districts" />
        </Field>
        <Field label={f.skills} htmlFor="p-skills" hint={f.skillsHint}>
          <TextInput id="p-skills" name="skills" />
        </Field>
        <Field label={f.yearsExperience} htmlFor="p-years">
          <TextInput id="p-years" name="yearsExperience" type="number" min={0} />
        </Field>
      </div>
      <Consent label={f.consent} />
      <p className="text-xs text-muted">{f.requiredNote}</p>
      <SubmitButton label={t.pages.pro.register} pendingLabel={f.submitting} />
    </form>
  )
}
