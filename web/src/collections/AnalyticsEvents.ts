import type { CollectionConfig } from 'payload'
import { isAdminOrManager, isStaff, publicCreate } from '../access/roles'

/**
 * Website analytics events — METADATA ONLY. Never store chat content, customer names/phones/emails
 * or images. Used for management dashboards (counts + attribution).
 */
export const AnalyticsEvents: CollectionConfig = {
  slug: 'analytics-events',
  labels: { singular: 'Analytics event', plural: 'Website analytics' },
  admin: { useAsTitle: 'type', group: 'Operations', defaultColumns: ['type', 'ref', 'createdAt'] },
  access: { read: isStaff, create: publicCreate, update: isAdminOrManager, delete: isAdminOrManager },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        'product_viewed', 'calculator_started', 'calculator_completed', 'quote_requested',
        'site_visit_requested', 'boq_uploaded', 'whatsapp_clicked', 'branch_selected',
        'ai_conversation_started', 'ai_converted_to_lead', 'painter_registration',
      ].map((v) => ({ label: v, value: v })),
    },
    { name: 'ref', type: 'text', admin: { description: 'Non-PII reference (e.g. product slug, branch slug, quotation ref).' } },
    { name: 'meta', type: 'json', admin: { description: 'Non-PII metadata only (counts/flags). Never chat, names, phones or images.' } },
  ],
}
