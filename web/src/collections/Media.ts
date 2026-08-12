import type { CollectionConfig } from 'payload'
import { isAdminOrManager, isStaff } from '../access/roles'

/** Public image uploads (product / service / project images, brand logos). */
export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Administration' },
  access: {
    read: () => true, // public
    create: isStaff,
    update: isStaff,
    delete: isAdminOrManager,
  },
  upload: {
    staticDir: 'media-uploads',
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'thumbnail', width: 400 },
      { name: 'card', width: 768 },
      { name: 'large', width: 1400 },
    ],
  },
  fields: [
    { name: 'alt', type: 'text', required: true, admin: { description: 'Accessible description of the image.' } },
    {
      name: 'credit',
      type: 'text',
      admin: {
        description: 'Source / ownership of this asset. Use only assets owned by or authorised for Hilty.',
      },
    },
  ],
}
