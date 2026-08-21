import type { CollectionConfig } from 'payload'
import {
  canHandleLeads,
  fieldAdminOrManager,
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
  admin: { useAsTitle: 'reference', group: 'Sales pipeline', defaultColumns: ['reference', 'customerName', 'status', 'approvalStatus', 'assignedTo'] },
  versions: true, // version history
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
    { name: 'interiorExterior', type: 'select', options: [{ label: 'Interior', value: 'interior' }, { label: 'Exterior', value: 'exterior' }] },
    { name: 'area', type: 'number', admin: { description: 'Approximate area in square metres (m²).' } },
    { name: 'budget', type: 'text', admin: { description: 'Optional budget range provided by the customer.' } },
    {
      name: 'calculation',
      type: 'json',
      admin: { description: 'Complete deterministic paint-calculator result saved with this request (estimate — requires site verification).' },
    },
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
    // Quotation build-out (internal / Operations Lite). Prices are only real when verified.
    {
      name: 'lineItems',
      type: 'array',
      admin: { description: 'Products & quantities. Unit price only if verified — never invent figures.' },
      fields: [
        { name: 'product', type: 'relationship', relationTo: 'products' },
        { name: 'description', type: 'text' },
        { name: 'quantity', type: 'number' },
        { name: 'unit', type: 'text', admin: { placeholder: 'e.g. L, pcs' } },
        { name: 'unitPrice', type: 'number', access: { read: fieldStaffOnlyRead }, admin: { description: 'Leave blank unless a verified price exists.' } },
      ],
    },
    { name: 'discountPct', type: 'number', access: { read: fieldStaffOnlyRead }, admin: { position: 'sidebar', description: 'Discount %. Requires approval per policy.' } },
    { name: 'taxRatePct', type: 'number', access: { read: fieldStaffOnlyRead }, admin: { position: 'sidebar', description: 'Tax rate % (configure per current law; not invented).' } },
    { name: 'quotedAmount', type: 'number', access: { read: fieldStaffOnlyRead }, admin: { position: 'sidebar', description: 'Only when built from verified prices.' } },
    {
      name: 'approvalStatus',
      type: 'select',
      defaultValue: 'draft',
      access: { update: fieldAdminOrManager },
      admin: { position: 'sidebar' },
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Pending approval', value: 'pending_approval' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
    { name: 'approvedBy', type: 'relationship', relationTo: 'users', access: { update: fieldAdminOrManager }, admin: { position: 'sidebar' } },
    { name: 'quoteFile', type: 'upload', relationTo: 'documents' },
    { name: 'assignedTo', type: 'relationship', relationTo: 'users', admin: { position: 'sidebar' } },
    consentField,
    retentionField,
    ...auditFields,
  ],
}
