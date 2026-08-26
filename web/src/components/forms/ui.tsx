'use client'

import type { ReactNode } from 'react'
import { useFormStatus } from 'react-dom'
import { CheckIcon, InfoIcon } from '../ui/icons'

export function Field({
  label,
  htmlFor,
  required,
  children,
  hint,
}: {
  label: string
  htmlFor: string
  required?: boolean
  children: ReactNode
  hint?: string
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block font-display text-[0.8125rem] font-semibold text-ink-soft">
        {label} {required && <span className="text-accent-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[0.8125rem] text-muted">{hint}</p>}
    </div>
  )
}

const inputCls =
  'w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-[0.9375rem] outline-none transition-colors placeholder:text-muted/70 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10'

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputCls} />
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} rows={4} className={inputCls} />
}

export function SelectInput({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={inputCls}>
      {children}
    </select>
  )
}

export function Consent({ label }: { label: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-md bg-surface-2 p-4 text-[0.9375rem] leading-relaxed">
      <input
        type="checkbox"
        name="consent"
        required
        className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-brand-600)]"
      />
      <span className="text-ink-soft">{label}</span>
    </label>
  )
}

export function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-accent-500 px-6 font-display text-[0.9375rem] font-semibold text-white shadow-soft transition-[background-color,box-shadow,transform] duration-200 hover:bg-accent-600 hover:shadow-lift active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55"
    >
      {pending ? pendingLabel : label}
    </button>
  )
}

export function FormMessage({ ok, error, success }: { ok?: boolean; error?: string; success: string }) {
  if (ok)
    return (
      <p className="flex items-start gap-3 rounded-md border border-success/20 bg-success-bg px-4 py-3.5 text-[0.9375rem] text-success">
        <CheckIcon width={18} height={18} className="mt-0.5 shrink-0" />
        {success}
      </p>
    )
  if (error)
    return (
      <p className="flex items-start gap-3 rounded-md border border-danger/20 bg-danger-bg px-4 py-3.5 text-[0.9375rem] text-danger">
        <InfoIcon width={18} height={18} className="mt-0.5 shrink-0" />
        {error}
      </p>
    )
  return null
}
