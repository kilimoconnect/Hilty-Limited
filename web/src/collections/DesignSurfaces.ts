import type { CollectionConfig } from 'payload'
import { canHandleLeads, isAdminOrManager, isStaff, publicCreate } from '../access/roles'
import { auditFields, setResponsibleStaff } from '../fields/shared'

/** A confirmed/editable paintable surface within a space. Masks are versioned and user-confirmed. */
export const DesignSurfaces: CollectionConfig = {
  slug: 'design-surfaces',
  labels: { singular: 'Design surface', plural: 'Design surfaces' },
  admin: { useAsTitle: 'id', group: 'Design Studio', defaultColumns: ['space', 'type', 'maskVersion', 'confirmedByUser'] },
  access: { read: isStaff, create: publicCreate, update: canHandleLeads, delete: isAdminOrManager },
  hooks: { beforeChange: [setResponsibleStaff] },
  fields: [
    { name: 'space', type: 'relationship', relationTo: 'design-spaces', required: true },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Wall', value: 'wall' },
        { label: 'Ceiling', value: 'ceiling' },
        { label: 'Roof', value: 'roof' },
        { label: 'Gate', value: 'gate' },
        { label: 'Wood', value: 'wood' },
        { label: 'Metal', value: 'metal' },
        { label: 'Other', value: 'other' },
      ],
    },
    { name: 'mask', type: 'json', admin: { description: 'Editable mask data (polygons / RLE). Versioned.' } },
    { name: 'maskImage', type: 'upload', relationTo: 'documents', admin: { description: 'Optional raster mask (private).' } },
    { name: 'maskVersion', type: 'number', defaultValue: 1 },
    { name: 'confirmedByUser', type: 'checkbox', defaultValue: false, admin: { description: 'No rendering until the user confirms the intended surface.' } },
    { name: 'areaM2', type: 'number', admin: { description: 'Surface area where manually supplied (m²).' } },
    { name: 'conditionNotes', type: 'textarea' },
    ...auditFields,
  ],
}
