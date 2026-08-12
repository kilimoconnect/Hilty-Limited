import type { CollectionBeforeChangeHook, Field } from 'payload'

/** A human-friendly reference like "QUO-20260812-4821", generated on create. */
export const referenceField: Field = {
  name: 'reference',
  type: 'text',
  index: true,
  admin: { readOnly: true, position: 'sidebar' },
}

export const generateReference =
  (prefix: string): CollectionBeforeChangeHook =>
  ({ operation, data }) => {
    if (operation === 'create' && !data.reference) {
      const d = new Date()
      const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(
        d.getDate(),
      ).padStart(2, '0')}`
      const rand = Math.floor(1000 + Math.random() * 9000)
      data.reference = `${prefix}-${stamp}-${rand}`
    }
    return data
  }
