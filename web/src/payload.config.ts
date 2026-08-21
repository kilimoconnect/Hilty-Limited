import path from 'path'
import { fileURLToPath } from 'url'

import { buildConfig } from 'payload'
import { importExportPlugin } from '@payloadcms/plugin-import-export'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'

/**
 * DB adapter: Postgres in production (Vercel/serverless) when a Postgres URL is provided,
 * SQLite for local development otherwise. Set DATABASE_URI (or POSTGRES_URL) to a
 * postgres:// connection string on the host. `push` auto-syncs schema outside production.
 */
const postgresUrl = process.env.DATABASE_URI?.startsWith('postgres') ? process.env.DATABASE_URI : process.env.POSTGRES_URL
const dbAdapter = postgresUrl
  ? postgresAdapter({ pool: { connectionString: postgresUrl }, push: process.env.NODE_ENV !== 'production' })
  : sqliteAdapter({ client: { url: process.env.DATABASE_URI || 'file:./hilty.db' } })

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Documents } from './collections/Documents'
import { Brands } from './collections/Brands'
import { ProductCategories } from './collections/ProductCategories'
import { Products } from './collections/Products'
import { Branches } from './collections/Branches'
import { Services } from './collections/Services'
import { Projects } from './collections/Projects'
import { Painters } from './collections/Painters'
import { Leads } from './collections/Leads'
import { QuotationRequests } from './collections/QuotationRequests'
import { SiteVisitRequests } from './collections/SiteVisitRequests'
import { Complaints } from './collections/Complaints'
import { Enquiries } from './collections/Enquiries'
import { DesignProjects } from './collections/DesignProjects'
import { DesignSpaces } from './collections/DesignSpaces'
import { DesignSurfaces } from './collections/DesignSurfaces'
import { DesignPreferences } from './collections/DesignPreferences'
import { DesignPalettes } from './collections/DesignPalettes'
import { DesignVariants } from './collections/DesignVariants'
import { DesignProductPlan } from './collections/DesignProductPlan'
import { DesignEvents } from './collections/DesignEvents'
import { BranchStock } from './collections/BranchStock'
import { Reservations } from './collections/Reservations'
import { AiSessions } from './collections/AiSessions'
import { AiLeadSummaries } from './collections/AiLeadSummaries'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '— Hilty Paint & Coatings Centre',
    },
  },
  collections: [
    // Administration
    Users,
    Media,
    Documents,
    // Catalogue
    Brands,
    ProductCategories,
    Products,
    // Company
    Branches,
    Services,
    Projects,
    // Network / pipeline / support
    Painters,
    Leads,
    QuotationRequests,
    SiteVisitRequests,
    Enquiries,
    DesignProjects,
    DesignSpaces,
    DesignSurfaces,
    DesignPreferences,
    DesignPalettes,
    DesignVariants,
    DesignProductPlan,
    DesignEvents,
    BranchStock,
    Reservations,
    Complaints,
    // AI advisor
    AiSessions,
    AiLeadSummaries,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'DEV-ONLY-INSECURE-SECRET-CHANGE-ME',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: dbAdapter,
  plugins: [
    // CSV/JSON export for staff (Operations Lite). Import disabled to avoid unsafe bulk writes.
    importExportPlugin({
      collections: [
        { slug: 'leads', import: false },
        { slug: 'quotation-requests', import: false },
        { slug: 'site-visit-requests', import: false },
        { slug: 'enquiries', import: false },
        { slug: 'painters', import: false },
        { slug: 'complaints', import: false },
        { slug: 'reservations', import: false },
        { slug: 'branch-stock', import: false },
        { slug: 'design-events', import: false },
      ],
    }),
  ],
  sharp,
})
