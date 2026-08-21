import type { CollectionConfig } from 'payload'
import { canHandleLeads, isAdminOrManager, isStaff, publicCreate } from '../access/roles'
import { auditFields, consentField, retentionField, setResponsibleStaff } from '../fields/shared'

export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: { useAsTitle: 'name', group: 'Sales pipeline', defaultColumns: ['name', 'source', 'status', 'assignedTo'] },
  access: {
    read: isStaff,
    create: publicCreate,
    update: canHandleLeads,
    delete: isAdminOrManager,
  },
  hooks: { beforeChange: [setResponsibleStaff] },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'phone', type: 'text' },
    { name: 'email', type: 'email' },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'website_form',
      options: [
        { label: 'Website form', value: 'website_form' },
        { label: 'WhatsApp', value: 'whatsapp' },
        { label: 'AI advisor', value: 'ai_advisor' },
        { label: 'Site visit', value: 'site_visit' },
        { label: 'Quotation', value: 'quotation' },
        { label: 'AI Design Studio', value: 'design_studio' },
        { label: 'Import', value: 'import' },
        { label: 'Other', value: 'other' },
      ],
    },
    { name: 'interest', type: 'text' },
    { name: 'message', type: 'textarea' },
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
        { label: 'Lost', value: 'lost' },
      ],
    },
    { name: 'assignedTo', type: 'relationship', relationTo: 'users', admin: { position: 'sidebar' } },
    { name: 'branch', type: 'relationship', relationTo: 'branches', admin: { position: 'sidebar' } },
    consentField,
    retentionField,
    ...auditFields,
  ],
}
