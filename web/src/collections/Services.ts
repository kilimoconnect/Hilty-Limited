import type { CollectionConfig } from 'payload'
import { canEditContent, isAdminOrManager, publicReadActiveOnly } from '../access/roles'
import { auditFields, setResponsibleStaff, verificationField } from '../fields/shared'
import { slugField } from '../fields/slug'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: { useAsTitle: 'name', group: 'Company', defaultColumns: ['name', 'active', 'displayOrder'] },
  access: {
    read: publicReadActiveOnly('active'),
    create: canEditContent,
    update: canEditContent,
    delete: isAdminOrManager,
  },
  hooks: { beforeChange: [setResponsibleStaff] },
  defaultSort: 'displayOrder',
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField('name'),
    { name: 'summary', type: 'textarea' },
    { name: 'description', type: 'richText' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'sectors',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Residential', value: 'residential' },
        { label: 'Commercial', value: 'commercial' },
      ],
    },
    { name: 'features', type: 'array', fields: [{ name: 'feature', type: 'text' }] },
    {
      name: 'warranty',
      type: 'group',
      admin: { description: 'Warranty / plan claims. Keep UNVERIFIED until officially confirmed.' },
      fields: [
        { name: 'hasWarranty', type: 'checkbox', defaultValue: false },
        { name: 'planName', type: 'text', admin: { placeholder: 'e.g. Platinum plan' } },
        { name: 'terms', type: 'textarea' },
      ],
    },
    { name: 'displayOrder', type: 'number', defaultValue: 0 },
    { name: 'active', type: 'checkbox', defaultValue: true },
    verificationField,
    ...auditFields,
  ],
}
