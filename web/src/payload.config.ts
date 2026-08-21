import path from 'path'
import { fileURLToPath } from 'url'

import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'

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
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./hilty.db',
    },
  }),
  sharp,
})
