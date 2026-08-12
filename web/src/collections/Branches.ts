import type { CollectionConfig } from 'payload'
import { canEditContent, isAdminOrManager, publicReadActiveOnly } from '../access/roles'
import { auditFields, setResponsibleStaff, verificationField } from '../fields/shared'
import { slugField } from '../fields/slug'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const Branches: CollectionConfig = {
  slug: 'branches',
  admin: {
    useAsTitle: 'name',
    group: 'Company',
    defaultColumns: ['name', 'region', 'phone', 'active'],
  },
  access: {
    read: publicReadActiveOnly('active'),
    create: canEditContent,
    update: canEditContent,
    delete: isAdminOrManager,
  },
  hooks: { beforeChange: [setResponsibleStaff] },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField('name'),
    { name: 'region', type: 'text' },
    { name: 'district', type: 'text' },
    { name: 'fullAddress', type: 'textarea' },
    {
      name: 'coordinates',
      type: 'group',
      fields: [
        { name: 'lat', type: 'number' },
        { name: 'lng', type: 'number' },
      ],
    },
    { name: 'mapLink', type: 'text', admin: { description: 'Google Maps link / pin.' } },
    { name: 'phone', type: 'text' },
    { name: 'whatsapp', type: 'text' },
    { name: 'email', type: 'email' },
    {
      name: 'operatingHours',
      type: 'array',
      fields: [
        { name: 'day', type: 'select', options: DAYS.map((d) => ({ label: d, value: d.toLowerCase() })) },
        { name: 'open', type: 'text', admin: { placeholder: '08:30' } },
        { name: 'close', type: 'text', admin: { placeholder: '18:00' } },
        { name: 'closed', type: 'checkbox', defaultValue: false },
      ],
    },
    { name: 'servicesAvailable', type: 'relationship', relationTo: 'services', hasMany: true },
    { name: 'active', type: 'checkbox', defaultValue: true },
    verificationField,
    ...auditFields,
  ],
}
