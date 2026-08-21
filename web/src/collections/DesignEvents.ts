import type { CollectionConfig } from 'payload'
import { isAdminOrManager, isStaff, publicCreate } from '../access/roles'

/**
 * Design Studio analytics events — METADATA ONLY (counts / attribution). Never stores customer
 * images, chat content, names, phones or emails.
 */
export const DesignEvents: CollectionConfig = {
  slug: 'design-events',
  labels: { singular: 'Design event', plural: 'Design analytics' },
  admin: { useAsTitle: 'type', group: 'Design Studio', defaultColumns: ['type', 'project', 'branch', 'value', 'createdAt'] },
  access: { read: isStaff, create: publicCreate, update: isAdminOrManager, delete: isAdminOrManager },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        'studio_visit', 'project_started', 'image_uploaded', 'palette_created', 'visual_generated',
        'favourite_saved', 'calculation_completed', 'quotation_requested', 'site_visit_requested',
        'whatsapp_handoff', 'lead_won', 'lead_lost', 'revenue_recorded', 'followup_scheduled',
      ].map((v) => ({ label: v, value: v })),
    },
    { name: 'project', type: 'relationship', relationTo: 'design-projects' },
    { name: 'branch', type: 'relationship', relationTo: 'branches' },
    { name: 'leadRef', type: 'text' },
    { name: 'value', type: 'number', admin: { description: 'Attributable revenue where later recorded.' } },
    { name: 'currency', type: 'text', defaultValue: 'TZS' },
    { name: 'meta', type: 'json', admin: { description: 'Non-PII metadata only (counts / flags). Never images or chat.' } },
  ],
}
