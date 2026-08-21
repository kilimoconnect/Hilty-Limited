import type { CollectionConfig } from 'payload'
import { canHandleLeads, isAdminOrManager, isStaff, publicCreate } from '../access/roles'
import { auditFields, setResponsibleStaff, verificationField } from '../fields/shared'

/** A colour palette option. Shades map to VERIFIED products; colours are approximate on screen. */
export const DesignPalettes: CollectionConfig = {
  slug: 'design-palettes',
  labels: { singular: 'Design palette', plural: 'Design palettes' },
  admin: { useAsTitle: 'name', group: 'Design Studio', defaultColumns: ['name', 'project', 'status'] },
  access: { read: isStaff, create: publicCreate, update: canHandleLeads, delete: isAdminOrManager },
  hooks: { beforeChange: [setResponsibleStaff] },
  fields: [
    { name: 'project', type: 'relationship', relationTo: 'design-projects' },
    { name: 'name', type: 'text', required: true },
    {
      name: 'roles',
      type: 'array',
      labels: { singular: 'Colour role', plural: 'Colour roles' },
      admin: { description: 'e.g. main wall, accent, trim, ceiling.' },
      fields: [
        { name: 'role', type: 'text' },
        { name: 'shadeName', type: 'text', admin: { description: 'Shade label (approximate on screen).' } },
        { name: 'hexApprox', type: 'text', admin: { description: 'Approximate hex — NOT an exact colour promise.' } },
        { name: 'product', type: 'relationship', relationTo: 'products', admin: { description: 'Verified product this shade maps to.' } },
        { name: 'finish', type: 'text' },
      ],
    },
    { name: 'confidence', type: 'number', admin: { description: 'Model confidence 0–1 (informational).' } },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'proposed',
      options: [{ label: 'Proposed', value: 'proposed' }, { label: 'Selected', value: 'selected' }, { label: 'Rejected', value: 'rejected' }],
    },
    { name: 'aiExplanation', type: 'textarea', admin: { description: 'Why this palette was suggested (customer-facing rationale).' } },
    verificationField, // admin verification status
    ...auditFields,
  ],
}
