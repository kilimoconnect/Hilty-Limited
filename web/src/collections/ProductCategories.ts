import type { CollectionConfig } from 'payload'
import { canEditContent, isAdminOrManager, publicReadActiveOnly } from '../access/roles'
import { auditFields, setResponsibleStaff } from '../fields/shared'
import { slugField } from '../fields/slug'

export const CATEGORY_KEYS = [
  { label: 'Interior paint', value: 'interior_paint' },
  { label: 'Exterior paint', value: 'exterior_paint' },
  { label: 'Roof paint', value: 'roof_paint' },
  { label: 'Primer & undercoat', value: 'primer_undercoat' },
  { label: 'Wood & metal coatings', value: 'wood_metal_coatings' },
  { label: 'Wall preparation', value: 'wall_preparation' },
  { label: 'Thinners & solvents', value: 'thinners_solvents' },
  { label: 'Brushes, rollers & tools', value: 'brushes_rollers_tools' },
  { label: 'Waterproofing & protective coatings', value: 'waterproofing_protective' },
] as const

export const ProductCategories: CollectionConfig = {
  slug: 'product-categories',
  admin: { useAsTitle: 'name', group: 'Catalogue', defaultColumns: ['name', 'key', 'displayOrder', 'active'] },
  access: {
    read: publicReadActiveOnly('active'),
    create: canEditContent,
    update: canEditContent,
    delete: isAdminOrManager,
  },
  hooks: { beforeChange: [setResponsibleStaff] },
  defaultSort: 'displayOrder',
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField('name'),
    {
      name: 'key',
      type: 'select',
      required: true,
      options: [...CATEGORY_KEYS],
      admin: { description: 'Canonical category type.' },
    },
    { name: 'description', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'displayOrder', type: 'number', defaultValue: 0 },
    { name: 'active', type: 'checkbox', defaultValue: true },
    ...auditFields,
  ],
}
