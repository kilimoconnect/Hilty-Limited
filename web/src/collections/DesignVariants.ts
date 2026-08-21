import type { CollectionConfig } from 'payload'
import { canHandleLeads, isAdminOrManager, isStaff, publicCreate } from '../access/roles'
import { auditFields, setResponsibleStaff } from '../fields/shared'

/** A generated visual variant (indicative visualisation — watermarked, never an exact colour). */
export const DesignVariants: CollectionConfig = {
  slug: 'design-variants',
  labels: { singular: 'Design variant', plural: 'Design variants' },
  admin: { useAsTitle: 'id', group: 'Design Studio', defaultColumns: ['space', 'palette', 'provider', 'status', 'selection'] },
  access: { read: isStaff, create: publicCreate, update: canHandleLeads, delete: isAdminOrManager },
  hooks: { beforeChange: [setResponsibleStaff] },
  fields: [
    { name: 'space', type: 'relationship', relationTo: 'design-spaces', required: true },
    { name: 'palette', type: 'relationship', relationTo: 'design-palettes' },
    { name: 'image', type: 'upload', relationTo: 'documents', admin: { description: 'Generated image (watermarked "AI visualisation"; stored privately).' } },
    { name: 'provider', type: 'select', options: [{ label: 'OpenAI', value: 'openai' }, { label: 'Gemini', value: 'gemini' }] },
    { name: 'model', type: 'text', admin: { description: 'Configured image model used (not hard-coded).' } },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Generating', value: 'generating' },
        { label: 'Succeeded', value: 'succeeded' },
        { label: 'Failed', value: 'failed' },
      ],
    },
    { name: 'promptVersion', type: 'text' },
    { name: 'selection', type: 'select', defaultValue: 'none', options: [{ label: 'None', value: 'none' }, { label: 'Selected', value: 'selected' }, { label: 'Rejected', value: 'rejected' }] },
    { name: 'disclaimerAccepted', type: 'checkbox', defaultValue: false, admin: { description: 'Customer accepted the "indicative visualisation" disclaimer.' } },
    ...auditFields,
  ],
}
