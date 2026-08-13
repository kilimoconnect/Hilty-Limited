import type { CollectionConfig } from 'payload'
import { canHandleLeads, isAdminOrManager, isStaff, publicCreate } from '../access/roles'
import { auditFields, consentField, retentionField, setResponsibleStaff } from '../fields/shared'
import { generateReference, referenceField } from '../fields/reference'

/**
 * Professional-customer enquiries: contractor account applications, developer enquiries,
 * project-pricing enquiries and bulk-supply enquiries. Supports private BOQ/document uploads.
 */
export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  labels: { singular: 'Enquiry', plural: 'Professional enquiries' },
  admin: {
    useAsTitle: 'reference',
    group: 'Sales pipeline',
    defaultColumns: ['reference', 'type', 'company', 'status', 'assignedTo'],
  },
  access: {
    read: isStaff,
    create: publicCreate,
    update: canHandleLeads,
    delete: isAdminOrManager,
  },
  hooks: { beforeChange: [generateReference('ENQ'), setResponsibleStaff] },
  fields: [
    referenceField,
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'project_pricing',
      options: [
        { label: 'Contractor account application', value: 'contractor_account' },
        { label: 'Developer enquiry', value: 'developer' },
        { label: 'Project-pricing enquiry', value: 'project_pricing' },
        { label: 'Bulk-supply enquiry', value: 'bulk_supply' },
        { label: 'General', value: 'general' },
      ],
    },
    { name: 'name', type: 'text', required: true, admin: { description: 'Contact person.' } },
    { name: 'company', type: 'text' },
    { name: 'role', type: 'text' },
    { name: 'phone', type: 'text', required: true },
    { name: 'email', type: 'email' },
    { name: 'registrationNumber', type: 'text', admin: { description: 'Company registration / TIN (optional).' } },
    { name: 'projectDescription', type: 'textarea' },
    { name: 'estimatedArea', type: 'number', admin: { description: 'Approximate area in m² (optional).' } },
    { name: 'productsInterested', type: 'relationship', relationTo: 'products', hasMany: true },
    { name: 'quantities', type: 'textarea', admin: { description: 'Products / quantities for bulk supply.' } },
    {
      name: 'documents',
      type: 'array',
      admin: { description: 'Uploaded BOQ / project documents (stored privately).' },
      fields: [{ name: 'file', type: 'upload', relationTo: 'documents' }],
    },
    { name: 'preferredBranch', type: 'relationship', relationTo: 'branches' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      admin: { position: 'sidebar' },
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Qualified', value: 'qualified' },
        { label: 'Converted', value: 'converted' },
        { label: 'Closed', value: 'closed' },
      ],
    },
    { name: 'assignedTo', type: 'relationship', relationTo: 'users', admin: { position: 'sidebar' } },
    consentField,
    retentionField,
    ...auditFields,
  ],
}
