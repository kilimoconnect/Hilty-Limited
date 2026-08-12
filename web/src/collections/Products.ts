import type { CollectionConfig } from 'payload'
import {
  canEditContent,
  fieldStaffOnlyRead,
  isAdminOrManager,
  publicReadActiveOnly,
} from '../access/roles'
import { auditFields, setResponsibleStaff, verificationField } from '../fields/shared'
import { slugField } from '../fields/slug'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    group: 'Catalogue',
    defaultColumns: ['name', 'brand', 'category', 'active', 'quotationEligible'],
  },
  access: {
    read: publicReadActiveOnly('active'),
    create: canEditContent,
    update: canEditContent,
    delete: isAdminOrManager,
  },
  hooks: { beforeChange: [setResponsibleStaff] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Basics',
          fields: [
            { name: 'name', type: 'text', required: true },
            slugField('name'),
            { name: 'brand', type: 'relationship', relationTo: 'brands' },
            { name: 'category', type: 'relationship', relationTo: 'product-categories', required: true },
            {
              name: 'useTypes',
              type: 'select',
              hasMany: true,
              options: [
                { label: 'Interior', value: 'interior' },
                { label: 'Exterior', value: 'exterior' },
                { label: 'Roof', value: 'roof' },
                { label: 'Wood', value: 'wood' },
                { label: 'Metal', value: 'metal' },
              ],
            },
            {
              name: 'finish',
              type: 'select',
              options: [
                { label: 'Matt', value: 'matt' },
                { label: 'Silk / eggshell', value: 'silk' },
                { label: 'Satin', value: 'satin' },
                { label: 'Semi-gloss', value: 'semi_gloss' },
                { label: 'Gloss', value: 'gloss' },
                { label: 'Textured', value: 'textured' },
                { label: 'Other', value: 'other' },
              ],
            },
            { name: 'colourAvailability', type: 'textarea', admin: { description: 'Describe colour availability. Do not imply Hilty owns colour names/IP.' } },
            { name: 'image', type: 'upload', relationTo: 'media' },
            { name: 'description', type: 'richText' },
          ],
        },
        {
          label: 'Technical',
          fields: [
            { name: 'surfaceCompatibility', type: 'array', fields: [{ name: 'surface', type: 'text' }] },
            { name: 'applicationInstructions', type: 'richText' },
            { name: 'recommendedPrimer', type: 'text' },
            { name: 'recommendedTopcoat', type: 'text' },
            { name: 'coveragePerLitre', type: 'number', admin: { description: 'Coverage in m² per litre.' } },
            { name: 'recommendedCoats', type: 'number' },
            {
              name: 'dryingTime',
              type: 'group',
              fields: [
                { name: 'touchDry', type: 'text', admin: { placeholder: 'e.g. 1 hour' } },
                { name: 'recoat', type: 'text', admin: { placeholder: 'e.g. 4 hours' } },
              ],
            },
            {
              name: 'packSizes',
              type: 'array',
              fields: [
                { name: 'litres', type: 'number' },
                { name: 'sku', type: 'text' },
              ],
            },
            { name: 'tdsFile', type: 'upload', relationTo: 'media', admin: { description: 'Technical data sheet (owned/authorised only).' } },
            { name: 'tdsUrl', type: 'text', admin: { description: 'Authorised link to the manufacturer TDS.' } },
          ],
        },
        {
          label: 'Pricing & stock (private)',
          description: 'Not shown to the public unless explicitly verified and toggled on.',
          fields: [
            {
              name: 'pricing',
              type: 'group',
              access: { read: fieldStaffOnlyRead },
              fields: [
                { name: 'price', type: 'number' },
                { name: 'currency', type: 'text', defaultValue: 'TZS' },
                { name: 'priceVerified', type: 'checkbox', defaultValue: false },
                {
                  name: 'showPricePublicly',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: { description: 'Only enable once the price is verified.' },
                },
              ],
            },
            {
              name: 'stock',
              type: 'array',
              labels: { singular: 'Branch stock', plural: 'Branch stock' },
              access: { read: fieldStaffOnlyRead },
              admin: { description: 'Per-branch availability. Default is "Contact branch for availability".' },
              fields: [
                { name: 'branch', type: 'relationship', relationTo: 'branches' },
                {
                  name: 'status',
                  type: 'select',
                  defaultValue: 'contact_branch',
                  options: [
                    { label: 'In stock', value: 'in_stock' },
                    { label: 'Low stock', value: 'low' },
                    { label: 'Out of stock', value: 'out_of_stock' },
                    { label: 'Contact branch for availability', value: 'contact_branch' },
                  ],
                },
                { name: 'showPublicly', type: 'checkbox', defaultValue: false },
              ],
            },
          ],
        },
      ],
    },
    // Sidebar
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'active', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    {
      name: 'quotationEligible',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar', description: 'Can be included in quotation requests.' },
    },
    verificationField,
    ...auditFields,
  ],
}
