import type { CollectionConfig } from 'payload'
import { canHandleLeads, isAdminOrManager, isStaff } from '../access/roles'
import { auditFields, setResponsibleStaff } from '../fields/shared'
import { generateReference, referenceField } from '../fields/reference'

/** Manual product reservations at a branch (human-confirmed; not an automated inventory hold). */
export const Reservations: CollectionConfig = {
  slug: 'reservations',
  labels: { singular: 'Reservation', plural: 'Reservations' },
  admin: { useAsTitle: 'reference', group: 'Operations', defaultColumns: ['reference', 'branch', 'product', 'status'] },
  access: { read: isStaff, create: canHandleLeads, update: canHandleLeads, delete: isAdminOrManager },
  hooks: { beforeChange: [generateReference('RES'), setResponsibleStaff] },
  fields: [
    referenceField,
    { name: 'branch', type: 'relationship', relationTo: 'branches', required: true },
    { name: 'product', type: 'relationship', relationTo: 'products', required: true },
    { name: 'quantity', type: 'number' },
    { name: 'unit', type: 'text', admin: { placeholder: 'e.g. L, pcs' } },
    { name: 'customerName', type: 'text' },
    { name: 'phone', type: 'text' },
    { name: 'leadRef', type: 'text' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'requested',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Requested', value: 'requested' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Collected', value: 'collected' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Expired', value: 'expired' },
      ],
    },
    { name: 'expiresAt', type: 'date', admin: { position: 'sidebar' } },
    ...auditFields,
  ],
}
