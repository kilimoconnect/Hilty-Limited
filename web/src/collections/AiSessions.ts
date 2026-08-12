import type { CollectionConfig } from 'payload'
import { isAdminOrManager, isStaff } from '../access/roles'
import { auditFields, consentField, retentionField, setResponsibleStaff } from '../fields/shared'

/**
 * AI Paint Advisor conversation sessions.
 * Created/updated server-side by the advisor API (never with keys in the frontend).
 */
export const AiSessions: CollectionConfig = {
  slug: 'ai-sessions',
  labels: { singular: 'AI session', plural: 'AI sessions' },
  admin: { useAsTitle: 'sessionId', group: 'AI advisor', defaultColumns: ['sessionId', 'channel', 'locale', 'startedAt'] },
  access: {
    read: isStaff,
    create: isStaff, // written by the server (advisor API runs as a system/staff context)
    update: isStaff,
    delete: isAdminOrManager,
  },
  hooks: { beforeChange: [setResponsibleStaff] },
  fields: [
    { name: 'sessionId', type: 'text', required: true, index: true },
    {
      name: 'channel',
      type: 'select',
      defaultValue: 'web',
      options: [
        { label: 'Web', value: 'web' },
        { label: 'WhatsApp', value: 'whatsapp' },
      ],
    },
    {
      name: 'locale',
      type: 'select',
      defaultValue: 'en',
      options: [
        { label: 'English', value: 'en' },
        { label: 'Kiswahili', value: 'sw' },
      ],
    },
    { name: 'startedAt', type: 'date' },
    { name: 'endedAt', type: 'date' },
    {
      name: 'messages',
      type: 'array',
      fields: [
        {
          name: 'role',
          type: 'select',
          options: [
            { label: 'User', value: 'user' },
            { label: 'Assistant', value: 'assistant' },
            { label: 'System', value: 'system' },
          ],
        },
        { name: 'content', type: 'textarea' },
        { name: 'timestamp', type: 'date' },
      ],
    },
    { name: 'linkedLead', type: 'relationship', relationTo: 'leads' },
    consentField,
    retentionField,
    ...auditFields,
  ],
}
