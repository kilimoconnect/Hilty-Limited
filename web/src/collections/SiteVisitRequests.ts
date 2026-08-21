import type { CollectionConfig } from 'payload'
import { canHandleLeads, isAdminOrManager, isStaff, publicCreate } from '../access/roles'
import { auditFields, consentField, retentionField, setResponsibleStaff } from '../fields/shared'
import { generateReference, referenceField } from '../fields/reference'

export const SiteVisitRequests: CollectionConfig = {
  slug: 'site-visit-requests',
  labels: { singular: 'Site-visit request', plural: 'Site-visit requests' },
  admin: { useAsTitle: 'reference', group: 'Sales pipeline', defaultColumns: ['reference', 'name', 'status', 'scheduledFor'] },
  access: {
    read: isStaff,
    create: publicCreate,
    update: canHandleLeads,
    delete: isAdminOrManager,
  },
  hooks: { beforeChange: [generateReference('VIS'), setResponsibleStaff] },
  fields: [
    referenceField,
    { name: 'name', type: 'text', required: true },
    { name: 'phone', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'location', type: 'text' },
    {
      name: 'coordinates',
      type: 'group',
      fields: [
        { name: 'lat', type: 'number' },
        { name: 'lng', type: 'number' },
      ],
    },
    { name: 'preferredDate', type: 'date' },
    { name: 'preferredTime', type: 'text' },
    { name: 'propertyType', type: 'text' },
    { name: 'notes', type: 'textarea' },
    { name: 'branch', type: 'relationship', relationTo: 'branches', admin: { position: 'sidebar' } },
    { name: 'assignedTo', type: 'relationship', relationTo: 'users', admin: { position: 'sidebar' } },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'requested',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Requested', value: 'requested' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    { name: 'scheduledFor', type: 'date', admin: { position: 'sidebar' } },
    // On-site capture (Operations Lite)
    {
      name: 'measurements',
      type: 'array',
      admin: { description: 'Recorded on site (metres). Feeds the deterministic calculator.' },
      fields: [
        { name: 'roomOrArea', type: 'text' },
        { name: 'length', type: 'number' },
        { name: 'width', type: 'number' },
        { name: 'height', type: 'number' },
        { name: 'notes', type: 'text' },
      ],
    },
    { name: 'siteImages', type: 'array', admin: { description: 'Site photos (private).' }, fields: [{ name: 'image', type: 'upload', relationTo: 'documents' }] },
    {
      name: 'followUpActions',
      type: 'array',
      fields: [
        { name: 'action', type: 'text' },
        { name: 'dueDate', type: 'date' },
        { name: 'done', type: 'checkbox', defaultValue: false },
      ],
    },
    consentField,
    retentionField,
    ...auditFields,
  ],
}
