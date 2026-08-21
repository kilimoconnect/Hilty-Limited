import type { CollectionConfig } from 'payload'
import { canHandleLeads, isAdminOrManager, isStaff, publicCreate } from '../access/roles'
import { auditFields, setResponsibleStaff } from '../fields/shared'

/** A space/room within a design project, with its original + safely-processed image. */
export const DesignSpaces: CollectionConfig = {
  slug: 'design-spaces',
  labels: { singular: 'Design space', plural: 'Design spaces' },
  admin: { useAsTitle: 'name', group: 'Design Studio', defaultColumns: ['name', 'project', 'surfaceType', 'privacyStatus'] },
  access: { read: isStaff, create: publicCreate, update: canHandleLeads, delete: isAdminOrManager },
  hooks: { beforeChange: [setResponsibleStaff] },
  fields: [
    { name: 'project', type: 'relationship', relationTo: 'design-projects', required: true },
    { name: 'name', type: 'text', required: true },
    { name: 'surfaceType', type: 'text', admin: { description: 'Room / surface type, e.g. living_room, exterior_facade, roof.' } },
    { name: 'interiorExterior', type: 'select', options: [{ label: 'Interior', value: 'interior' }, { label: 'Exterior', value: 'exterior' }] },
    { name: 'originalImage', type: 'upload', relationTo: 'documents', admin: { description: 'Original upload — stored PRIVATELY (retained for comparison).' } },
    { name: 'processedImage', type: 'upload', relationTo: 'documents', admin: { description: 'Safely re-encoded image (EXIF/location stripped).' } },
    { name: 'imageWidth', type: 'number' },
    { name: 'imageHeight', type: 'number' },
    {
      name: 'measurements',
      type: 'group',
      admin: { description: 'Optional actual measurements (metres).' },
      fields: [
        { name: 'length', type: 'number' },
        { name: 'width', type: 'number' },
        { name: 'height', type: 'number' },
      ],
    },
    { name: 'surfaceCondition', type: 'select', options: [{ label: 'Good', value: 'good' }, { label: 'Fair', value: 'fair' }, { label: 'Poor', value: 'poor' }] },
    { name: 'lighting', type: 'text', admin: { description: 'Lighting description (e.g. bright daylight, warm indoor).' } },
    { name: 'ownershipConfirmed', type: 'checkbox', defaultValue: false, admin: { description: 'Customer confirmed they own / may use this image.' } },
    {
      name: 'privacyStatus',
      type: 'select',
      defaultValue: 'private',
      admin: { position: 'sidebar' },
      options: [{ label: 'Private', value: 'private' }, { label: 'Deleted', value: 'deleted' }],
    },
    ...auditFields,
  ],
}
