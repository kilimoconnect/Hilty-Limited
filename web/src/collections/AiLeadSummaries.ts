import type { CollectionConfig } from 'payload'
import { canHandleLeads, isAdminOrManager, isStaff } from '../access/roles'
import { auditFields, retentionField, setResponsibleStaff } from '../fields/shared'

/** AI-generated summaries of advisor sessions, for staff follow-up. */
export const AiLeadSummaries: CollectionConfig = {
  slug: 'ai-lead-summaries',
  labels: { singular: 'AI lead summary', plural: 'AI lead summaries' },
  admin: { useAsTitle: 'id', group: 'AI advisor', defaultColumns: ['session', 'detectedIntent', 'status'] },
  access: {
    read: isStaff,
    create: isStaff,
    update: canHandleLeads,
    delete: isAdminOrManager,
  },
  hooks: { beforeChange: [setResponsibleStaff] },
  fields: [
    { name: 'session', type: 'relationship', relationTo: 'ai-sessions' },
    { name: 'summary', type: 'textarea' },
    { name: 'detectedIntent', type: 'text' },
    { name: 'recommendedProducts', type: 'relationship', relationTo: 'products', hasMany: true },
    { name: 'recommendedSystem', type: 'text', admin: { description: 'Suggested paint system (guidance only — no exact-colour promises).' } },
    {
      name: 'customerContact',
      type: 'group',
      fields: [
        { name: 'name', type: 'text' },
        { name: 'phone', type: 'text' },
        { name: 'consentGiven', type: 'checkbox', defaultValue: false },
      ],
    },
    { name: 'confidence', type: 'number', admin: { description: '0–1 confidence score.' } },
    { name: 'reviewedBy', type: 'relationship', relationTo: 'users', admin: { position: 'sidebar' } },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      admin: { position: 'sidebar' },
      options: [
        { label: 'New', value: 'new' },
        { label: 'Reviewed', value: 'reviewed' },
        { label: 'Converted to lead', value: 'converted' },
        { label: 'Dismissed', value: 'dismissed' },
      ],
    },
    retentionField,
    ...auditFields,
  ],
}
