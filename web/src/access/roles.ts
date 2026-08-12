import type { Access, FieldAccess } from 'payload'

/**
 * Role-based access control for Hilty.
 * Roles are stored on `users.roles` (array of strings).
 */
export type Role =
  | 'admin' // full control
  | 'manager' // all content + operations
  | 'content_editor' // products, services, projects (drafts, needs verification)
  | 'sales' // leads, quotations, site-visits
  | 'branch_staff' // own branch, stock status, complaints
  | 'viewer' // read-only

export const ROLE_OPTIONS: { label: string; value: Role }[] = [
  { label: 'Admin', value: 'admin' },
  { label: 'Manager', value: 'manager' },
  { label: 'Content editor', value: 'content_editor' },
  { label: 'Sales', value: 'sales' },
  { label: 'Branch staff', value: 'branch_staff' },
  { label: 'Viewer (read-only)', value: 'viewer' },
]

type MaybeUser = { roles?: Role[] | null } | null | undefined

export const hasRole = (user: MaybeUser, ...roles: Role[]): boolean =>
  Boolean(user?.roles?.some((r) => roles.includes(r as Role)))

// ---- Collection-level access helpers ----

/** Any authenticated staff member. */
export const isStaff: Access = ({ req: { user } }) => Boolean(user)

export const isAdmin: Access = ({ req: { user } }) => hasRole(user, 'admin')

export const isAdminOrManager: Access = ({ req: { user } }) =>
  hasRole(user, 'admin', 'manager')

/** Staff who can edit catalogue/content. */
export const canEditContent: Access = ({ req: { user } }) =>
  hasRole(user, 'admin', 'manager', 'content_editor')

/** Staff who can work customer pipeline (leads, quotations, visits). */
export const canHandleLeads: Access = ({ req: { user } }) =>
  hasRole(user, 'admin', 'manager', 'sales', 'branch_staff')

/** Read that is public but limited to active records when logged out. */
export const publicReadActiveOnly =
  (activeField = 'active'): Access =>
  ({ req: { user } }) => {
    if (user) return true
    return { [activeField]: { equals: true } }
  }

/** Read restricted to staff only (used for personal-data collections). */
export const staffOnlyRead: Access = ({ req: { user } }) => Boolean(user)

/** Anyone (incl. public forms) may create; used for lead/quotation/visit submissions. */
export const publicCreate: Access = () => true

// ---- Field-level access helpers ----

/** Only staff can read this field (e.g. price, stock, internal notes). */
export const fieldStaffOnlyRead: FieldAccess = ({ req: { user } }) => Boolean(user)

/** Only admins/managers can edit this field. */
export const fieldAdminOrManager: FieldAccess = ({ req: { user } }) =>
  hasRole(user, 'admin', 'manager')
