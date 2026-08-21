import type { CollectionConfig } from 'payload'
import { canHandleLeads, isAdminOrManager, isStaff } from '../access/roles'
import { auditFields, setResponsibleStaff } from '../fields/shared'

/**
 * MANUAL branch stock status (not a live inventory feed). Figures are never invented; staff set an
 * indicative status. A future integration point can replace this with a real inventory system.
 */
export const BranchStock: CollectionConfig = {
  slug: 'branch-stock',
  labels: { singular: 'Branch stock status', plural: 'Branch stock' },
  admin: { useAsTitle: 'id', group: 'Operations', defaultColumns: ['branch', 'product', 'status', 'updatedAt'] },
  access: { read: isStaff, create: canHandleLeads, update: canHandleLeads, delete: isAdminOrManager },
  hooks: { beforeChange: [setResponsibleStaff] },
  fields: [
    { name: 'branch', type: 'relationship', relationTo: 'branches', required: true },
    { name: 'product', type: 'relationship', relationTo: 'products', required: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'contact_branch',
      options: [
        { label: 'In stock', value: 'in_stock' },
        { label: 'Low', value: 'low' },
        { label: 'Out of stock', value: 'out_of_stock' },
        { label: 'Contact branch for availability', value: 'contact_branch' },
      ],
    },
    { name: 'note', type: 'text' },
    ...auditFields,
  ],
}
