import type { CollectionConfig } from 'payload'
import { ROLE_OPTIONS, hasRole, isAdmin, isStaff } from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'roles', 'active'],
    group: 'Administration',
  },
  access: {
    read: isStaff,
    create: isAdmin,
    update: ({ req: { user }, id }) => hasRole(user, 'admin') || user?.id === id,
    delete: isAdmin,
    // Any authenticated user may open the admin panel (viewer = read-only).
    admin: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['viewer'],
      options: ROLE_OPTIONS,
      // Only admins/managers may change someone's roles.
      access: { update: ({ req: { user } }) => hasRole(user, 'admin', 'manager') },
    },
    {
      name: 'branch',
      type: 'relationship',
      relationTo: 'branches',
      admin: { description: 'For branch staff: the outlet this user is responsible for.' },
    },
    { name: 'phone', type: 'text' },
    { name: 'active', type: 'checkbox', defaultValue: true },
  ],
}
