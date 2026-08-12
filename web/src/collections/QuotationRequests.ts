import type { CollectionConfig } from 'payload'
import {
  canHandleLeads,
  fieldStaffOnlyRead,
  isAdminOrManager,
  isStaff,
  publicCreate,
} from '../access/roles'
import { auditFields, consentField, retentionField, setResponsibleStaff } from '../fields/shared'
import { generateReference, referenceField } from '../fields/reference'

export const QuotationRequests: CollectionConfig = {
  slug: 'quotation-requests',
  labels: { singular: 'Quotation request', plural: 'Quotation requests' },
  admin: { useAsTitle: 'reference', group: 'Sales pipeline', defaultColumns: ['reference', 'customerName', 'status', 'assignedTo'] },
  access: {
    read: isStaff,
    create: publicCreate,
    update: canHandleLeads,
    delete: isAdminOrManager,
  },
  hooks: { beforeChange: [generateReference('QUO'), setResponsibleStaff] },
  fields: [
    referenceField,
    { name: 'customerName', type: 'text', required: true },
    { name: 'phone', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'projectType', type: 'text' },
    {
      name: 'sector',
      type: 'select',
      options: [
        { label: 'Residential', value: 'residential' },
        { label: 'Commercial', value: 'commercial' },
      ],
    },
    { name: 'description', type: 'textarea' },
    { name: 'area', type: 'number', admin: { description: 'Approximate area in square metres (m²).' } },
    { name: 'surfaces', type: 'array', fields: [{ name: 'surface', type: 'text' }] },
    {
      name: 'boqFiles',
      type: 'array',
      admin: { description: 'Uploaded BOQ / project documents (stored privately).' },
      fields: [{ name: 'file', type: 'upload', relationTo: 'documents' }],
    },
    { name: 'productsInterested', type: 'relationship', relationTo: 'products', hasMany: true },
    { name: 'preferredBranch', type: 'relationship', relationTo: 'branches' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'received',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Received', value: 'received' },
        { label: 'In review', value: 'in_review' },
        { label: 'Quoted', value: 'quoted' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Declined', value: 'declined' },
        { label: 'Expired', value: 'expired' },
      ],
    },
    { name: 'quotedAmount', type: 'number', access: { read: fieldStaffOnlyRead }, admin: { position: 'sidebar' } },
    { name: 'quoteFile', type: 'upload', relationTo: 'documents' },
    { name: 'assignedTo', type: 'relationship', relationTo: 'users', admin: { position: 'sidebar' } },
    consentField,
    retentionField,
    ...auditFields,
  ],
}
