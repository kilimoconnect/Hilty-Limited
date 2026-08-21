import type { Access, FieldAccess } from 'payload'

/**
 * Role-based access control for Hilty.
 * Roles are stored on `users.roles` (array of strings).
 */
export type Role =
  // Hilty Operations Lite roles
  | 'admin' // Administrator — full control
  | 'managing_director' // all content + operations
  | 'sales_officer' // leads, quotations, site-visits
  | 'branch_manager' // own branch, stock/reservations, complaints
  | 'project_officer' // site visits, projects
  | 'viewer' // read-only management
  // legacy aliases (kept for backward compatibility)
  | 'manager'
  | 'content_editor'
  | 'sales'
  | 'branch_staff'

export const ROLE_OPTIONS: { label: string; value: Role }[] = [
  { label: 'Administrator', value: 'admin' },
  { label: 'Managing director', value: 'managing_director' },
  { label: 'Sales officer', value: 'sales_officer' },
  { label: 'Branch manager', value: 'branch_manager' },
  { label: 'Project officer', value: 'project_officer' },
  { label: 'Read-only management', value: 'viewer' },
]

const MANAGERS: Role[] = ['admin', 'managing_director', 'manager']
const LEAD_HANDLERS: Role[] = ['admin', 'managing_director', 'manager', 'sales_officer', 'sales', 'branch_manager', 'branch_staff', 'project_officer']
const CONTENT_EDITORS: Role[] = ['admin', 'managing_director', 'manager', 'content_editor']

type MaybeUser = { roles?: Role[] | null } | null | undefined

export const hasRole = (user: MaybeUser, ...roles: Role[]): boolean =>
  Boolean(user?.roles?.some((r) => roles.includes(r as Role)))

// ---- Collection-level access helpers ----

/** Any authenticated staff member. */
export const isStaff: Access = ({ req: { user } }) => Boolean(user)

export const isAdmin: Access = ({ req: { user } }) => hasRole(user, 'admin')

export const isAdminOrManager: Access = ({ req: { user } }) => hasRole(user, ...MANAGERS)

/** Staff who can edit catalogue/content. */
export const canEditContent: Access = ({ req: { user } }) => hasRole(user, ...CONTENT_EDITORS)

/** Staff who can work customer pipeline (leads, quotations, visits). */
export const canHandleLeads: Access = ({ req: { user } }) => hasRole(user, ...LEAD_HANDLERS)

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
export const fieldAdminOrManager: FieldAccess = ({ req: { user } }) => hasRole(user, ...MANAGERS)
