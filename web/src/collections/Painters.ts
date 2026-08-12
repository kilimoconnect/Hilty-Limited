import type { CollectionConfig } from 'payload'
import {
  canHandleLeads,
  fieldStaffOnlyRead,
  isAdminOrManager,
  isStaff,
  publicCreate,
} from '../access/roles'
import {
  auditFields,
  consentField,
  retentionField,
  setResponsibleStaff,
  verificationField,
} from '../fields/shared'

/** Painter / contractor registrations. Personal data → consent + retention. */
export const Painters: CollectionConfig = {
  slug: 'painters',
  labels: { singular: 'Painter / contractor', plural: 'Painters & contractors' },
  admin: { useAsTitle: 'fullName', group: 'Network', defaultColumns: ['fullName', 'type', 'region', 'status'] },
  access: {
    read: isStaff, // personal data — staff only
    create: publicCreate, // public registration form
    update: canHandleLeads,
    delete: isAdminOrManager,
  },
  hooks: { beforeChange: [setResponsibleStaff] },
  fields: [
    { name: 'fullName', type: 'text', required: true },
    {
      name: 'type',
      type: 'select',
      defaultValue: 'painter',
      options: [
        { label: 'Painter', value: 'painter' },
        { label: 'Contractor', value: 'contractor' },
        { label: 'Company', value: 'company' },
      ],
    },
    { name: 'phone', type: 'text', required: true },
    { name: 'whatsapp', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'region', type: 'text' },
    { name: 'districts', type: 'array', fields: [{ name: 'district', type: 'text' }] },
    { name: 'skills', type: 'array', fields: [{ name: 'skill', type: 'text' }] },
    { name: 'yearsExperience', type: 'number' },
    { name: 'portfolio', type: 'array', fields: [{ name: 'image', type: 'upload', relationTo: 'media' }] },
    {
      name: 'idNumber',
      type: 'text',
      access: { read: fieldStaffOnlyRead },
      admin: { description: 'Sensitive ID reference — staff only.' },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
    consentField,
    retentionField,
    verificationField,
    ...auditFields,
  ],
}
