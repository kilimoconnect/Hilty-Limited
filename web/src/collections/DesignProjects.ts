import type { CollectionConfig } from 'payload'
import { canHandleLeads, isAdminOrManager, isStaff, publicCreate } from '../access/roles'
import { auditFields, consentField, retentionField, setResponsibleStaff } from '../fields/shared'
import { generateReference, referenceField } from '../fields/reference'

/** Design Studio: a saved customer design project (paint-led visual design → conversion). */
export const DesignProjects: CollectionConfig = {
  slug: 'design-projects',
  labels: { singular: 'Design project', plural: 'Design projects' },
  admin: { useAsTitle: 'reference', group: 'Design Studio', defaultColumns: ['reference', 'name', 'status', 'quotationStatus', 'branch'] },
  access: { read: isStaff, create: publicCreate, update: canHandleLeads, delete: isAdminOrManager },
  hooks: { beforeChange: [generateReference('DSN'), setResponsibleStaff] },
  fields: [
    referenceField,
    { name: 'customerRef', type: 'text', admin: { description: 'Customer/user identifier where applicable (session or account id).' } },
    { name: 'name', type: 'text', required: true, admin: { description: 'Project name.' } },
    { name: 'sector', type: 'select', options: [{ label: 'Residential', value: 'residential' }, { label: 'Commercial', value: 'commercial' }] },
    { name: 'location', type: 'text' },
    { name: 'branch', type: 'relationship', relationTo: 'branches' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Surfaces confirmed', value: 'surfaces_confirmed' },
        { label: 'Palette selected', value: 'palette_selected' },
        { label: 'Visualised', value: 'visualised' },
        { label: 'Mapped to products', value: 'mapped' },
        { label: 'Measured', value: 'measured' },
        { label: 'Saved', value: 'saved' },
        { label: 'Converted', value: 'converted' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    { name: 'language', type: 'select', defaultValue: 'en', options: [{ label: 'English', value: 'en' }, { label: 'Kiswahili', value: 'sw' }] },
    {
      name: 'quotationStatus',
      type: 'select',
      defaultValue: 'none',
      admin: { position: 'sidebar' },
      options: [
        { label: 'None', value: 'none' },
        { label: 'Requested', value: 'requested' },
        { label: 'Quoted', value: 'quoted' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Declined', value: 'declined' },
      ],
    },
    { name: 'linkedQuotation', type: 'relationship', relationTo: 'quotation-requests', admin: { position: 'sidebar' } },
    { name: 'linkedSiteVisit', type: 'relationship', relationTo: 'site-visit-requests', admin: { position: 'sidebar' } },
    consentField,
    retentionField,
    ...auditFields,
  ],
}
