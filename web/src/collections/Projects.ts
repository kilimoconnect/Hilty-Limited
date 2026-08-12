import type { CollectionConfig } from 'payload'
import { canEditContent, isAdminOrManager, publicReadActiveOnly } from '../access/roles'
import { auditFields, consentField, setResponsibleStaff, verificationField } from '../fields/shared'
import { slugField } from '../fields/slug'

/** Completed projects / portfolio. Never seeded — only real, permissioned projects. */
export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: { useAsTitle: 'title', group: 'Company', defaultColumns: ['title', 'location', 'active', 'featured'] },
  access: {
    read: publicReadActiveOnly('active'),
    create: canEditContent,
    update: canEditContent,
    delete: isAdminOrManager,
  },
  hooks: { beforeChange: [setResponsibleStaff] },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    { name: 'description', type: 'richText' },
    { name: 'location', type: 'text' },
    {
      name: 'sector',
      type: 'select',
      options: [
        { label: 'Residential', value: 'residential' },
        { label: 'Commercial', value: 'commercial' },
      ],
    },
    { name: 'servicesUsed', type: 'relationship', relationTo: 'services', hasMany: true },
    { name: 'productsUsed', type: 'relationship', relationTo: 'products', hasMany: true },
    { name: 'images', type: 'array', fields: [{ name: 'image', type: 'upload', relationTo: 'media' }] },
    { name: 'completionDate', type: 'date' },
    {
      name: 'client',
      type: 'group',
      fields: [
        { name: 'name', type: 'text' },
        { name: 'testimonial', type: 'textarea' },
        consentField,
      ],
    },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'active', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    verificationField,
    ...auditFields,
  ],
}
