'use client'

import type { ReactNode } from 'react'
import { useFormStatus } from 'react-dom'

export function Field({ label, htmlFor, required, children, hint }: { label: string; htmlFor: string; required?: boolean; children: ReactNode; hint?: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  )
}

const inputCls = 'w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand-400'

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
    <label className="flex items-start gap-2 text-sm">
      <input type="checkbox" name="consent" required className="mt-0.5" />
      <span>{label}</span>
    </label>
  )
}

export function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  )
}

export function FormMessage({ ok, error, success }: { ok?: boolean; error?: string; success: string }) {
  if (ok) return <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">{success}</p>
  if (error) return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
  return null
}
