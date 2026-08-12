import type { Field } from 'payload'

export const slugify = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/** Reusable, auto-generated URL slug derived from `from` (default "name"). */
export const slugField = (from = 'name'): Field => ({
  name: 'slug',
  type: 'text',
  index: true,
  unique: true,
  admin: {
    position: 'sidebar',
    description: 'URL-friendly identifier. Auto-generated from the name if left blank.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === 'string' && value.length > 0) return slugify(value)
        const source = (data as Record<string, unknown> | undefined)?.[from]
        return typeof source === 'string' ? slugify(source) : value
      },
    ],
  },
})
