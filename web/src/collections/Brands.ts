import type { CollectionConfig } from 'payload'
import { canEditContent, isAdminOrManager } from '../access/roles'
import { auditFields, setResponsibleStaff } from '../fields/shared'
import { slugField } from '../fields/slug'

/**
 * Paint brands Hilty stocks (e.g. Plascon = anchor). Hilty is a retailer/supplier,
 * NOT the manufacturer, and does not own these brands' products/colours/IP.
 */
export const Brands: CollectionConfig = {
  slug: 'brands',
  admin: { useAsTitle: 'name', group: 'Catalogue', defaultColumns: ['name', 'isAuthorisedDealerBrand'] },
  access: {
    read: () => true,
    create: canEditContent,
    update: canEditContent,
    delete: isAdminOrManager,
  },
  hooks: { beforeChange: [setResponsibleStaff] },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField('name'),
    { name: 'logo', type: 'upload', relationTo: 'media' },
    {
      name: 'isAuthorisedDealerBrand',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Hilty is an authorised retailer/dealer of this brand (not the manufacturer).' },
    },
    { name: 'website', type: 'text' },
    { name: 'notes', type: 'textarea' },
    ...auditFields,
  ],
}
