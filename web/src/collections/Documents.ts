import type { CollectionConfig } from 'payload'
import { isAdminOrManager, isStaff, publicCreate } from '../access/roles'

/**
 * PRIVATE uploads: customer BOQs and generated quote PDFs.
 * Public forms may CREATE (upload a BOQ) but only staff may READ them.
 */
export const Documents: CollectionConfig = {
  slug: 'documents',
  admin: { group: 'Administration', description: 'Private customer documents (BOQs, quotes). Staff-only read.' },
  access: {
    read: isStaff, // NOT public
    create: publicCreate,
    update: isStaff,
    delete: isAdminOrManager,
  },
  upload: {
    staticDir: 'private-uploads',
    mimeTypes: [
      'application/pdf',
      'image/*',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    ],
  },
  fields: [
    { name: 'label', type: 'text' },
    {
      name: 'kind',
      type: 'select',
      defaultValue: 'boq',
      options: [
        { label: 'BOQ / project document', value: 'boq' },
        { label: 'Quotation PDF', value: 'quote' },
        { label: 'Design Studio image', value: 'design' },
        { label: 'Other', value: 'other' },
      ],
    },
  ],
}
