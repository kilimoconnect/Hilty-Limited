import type { CollectionConfig } from 'payload'
import { canHandleLeads, isAdminOrManager, isStaff, publicCreate } from '../access/roles'
import { auditFields, setResponsibleStaff } from '../fields/shared'

/** Customer design preferences for a project. */
export const DesignPreferences: CollectionConfig = {
  slug: 'design-preferences',
  labels: { singular: 'Design preference', plural: 'Design preferences' },
  admin: { useAsTitle: 'id', group: 'Design Studio', defaultColumns: ['project', 'preferredStyle', 'temperature'] },
  access: { read: isStaff, create: publicCreate, update: canHandleLeads, delete: isAdminOrManager },
  hooks: { beforeChange: [setResponsibleStaff] },
  fields: [
    { name: 'project', type: 'relationship', relationTo: 'design-projects', required: true },
    { name: 'preferredStyle', type: 'text', admin: { description: 'e.g. modern, classic, minimal.' } },
    { name: 'mood', type: 'text' },
    { name: 'temperature', type: 'select', options: [{ label: 'Warm', value: 'warm' }, { label: 'Cool', value: 'cool' }, { label: 'Neutral', value: 'neutral' }] },
    { name: 'desiredColours', type: 'array', labels: { singular: 'Colour', plural: 'Desired colours' }, fields: [{ name: 'colour', type: 'text' }] },
    { name: 'avoidColours', type: 'array', labels: { singular: 'Colour', plural: 'Colours to avoid' }, fields: [{ name: 'colour', type: 'text' }] },
    { name: 'furnitureColours', type: 'array', labels: { singular: 'Colour', plural: 'Existing furniture colours' }, fields: [{ name: 'colour', type: 'text' }] },
    { name: 'preferredFinish', type: 'text', admin: { description: 'e.g. matt, satin, silk, gloss.' } },
    { name: 'durability', type: 'text', admin: { description: 'Durability / cleanability requirement.' } },
    { name: 'budgetRange', type: 'text' },
    {
      name: 'factors',
      type: 'group',
      admin: { description: 'High-traffic / lifestyle factors.' },
      fields: [
        { name: 'children', type: 'checkbox', defaultValue: false },
        { name: 'pets', type: 'checkbox', defaultValue: false },
        { name: 'highTraffic', type: 'checkbox', defaultValue: false },
      ],
    },
    ...auditFields,
  ],
}
