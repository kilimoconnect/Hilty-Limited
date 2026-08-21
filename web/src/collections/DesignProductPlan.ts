import type { CollectionConfig } from 'payload'
import { canHandleLeads, isAdminOrManager, isStaff, publicCreate } from '../access/roles'
import { auditFields, setResponsibleStaff } from '../fields/shared'

/** Maps a confirmed surface + selected shade to verified products and a deterministic calc/quote. */
export const DesignProductPlan: CollectionConfig = {
  slug: 'design-product-plan',
  labels: { singular: 'Design product plan', plural: 'Design product plans' },
  admin: { useAsTitle: 'id', group: 'Design Studio', defaultColumns: ['project', 'surface', 'product', 'coats'] },
  access: { read: isStaff, create: publicCreate, update: canHandleLeads, delete: isAdminOrManager },
  hooks: { beforeChange: [setResponsibleStaff] },
  fields: [
    { name: 'project', type: 'relationship', relationTo: 'design-projects', required: true },
    { name: 'surface', type: 'relationship', relationTo: 'design-surfaces' },
    { name: 'shade', type: 'text', admin: { description: 'Selected shade (approximate on screen).' } },
    { name: 'product', type: 'relationship', relationTo: 'products' },
    { name: 'primer', type: 'relationship', relationTo: 'products' },
    { name: 'topcoat', type: 'relationship', relationTo: 'products' },
    { name: 'finish', type: 'text' },
    { name: 'verifiedCoverage', type: 'number', admin: { description: 'Verified coverage (m²/L) copied from the product at plan time.' } },
    { name: 'coats', type: 'number', defaultValue: 2 },
    { name: 'calculatorReference', type: 'text', admin: { description: 'Reference of the deterministic calculation used.' } },
    { name: 'quotationReference', type: 'text', admin: { description: 'Quotation reference once converted.' } },
    ...auditFields,
  ],
}
