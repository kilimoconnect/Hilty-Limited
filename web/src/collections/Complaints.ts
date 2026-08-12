import type { CollectionConfig } from 'payload'
import { canHandleLeads, isAdminOrManager, isStaff, publicCreate } from '../access/roles'
import { auditFields, consentField, retentionField, setResponsibleStaff } from '../fields/shared'
import { generateReference, referenceField } from '../fields/reference'

/** Complaints and product batch reports. */
export const Complaints: CollectionConfig = {
  slug: 'complaints',
  labels: { singular: 'Complaint / batch report', plural: 'Complaints & batch reports' },
  admin: { useAsTitle: 'reference', group: 'Support', defaultColumns: ['reference', 'type', 'status', 'severity'] },
  access: {
    read: isStaff,
    create: publicCreate,
    update: canHandleLeads,
    delete: isAdminOrManager,
  },
  hooks: { beforeChange: [generateReference('CMP'), setResponsibleStaff] },
  fields: [
    referenceField,
    {
      name: 'type',
      type: 'select',
      defaultValue: 'complaint',
      options: [
        { label: 'Complaint', value: 'complaint' },
        { label: 'Product batch report', value: 'product_batch_report' },
        { label: 'Warranty claim', value: 'warranty_claim' },
      ],
    },
    { name: 'customerName', type: 'text', required: true },
    { name: 'phone', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'branch', type: 'relationship', relationTo: 'branches' },
    { name: 'product', type: 'relationship', relationTo: 'products' },
    { name: 'batchNumber', type: 'text' },
    { name: 'purchaseDate', type: 'date' },
    { name: 'description', type: 'richText' },
    {
      name: 'severity',
      type: 'select',
      defaultValue: 'medium',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'open',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Open', value: 'open' },
        { label: 'Investigating', value: 'investigating' },
        { label: 'Resolved', value: 'resolved' },
        { label: 'Closed', value: 'closed' },
      ],
    },
    { name: 'resolutionNotes', type: 'textarea' },
    { name: 'assignedTo', type: 'relationship', relationTo: 'users', admin: { position: 'sidebar' } },
    consentField,
    retentionField,
    ...auditFields,
  ],
}
