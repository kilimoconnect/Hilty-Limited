import '../globals.css'
import type { Metadata, Viewport } from 'next'
import { getLocale } from '../../i18n/locale'
import { getDictionary } from '../../i18n/dictionaries'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { WhatsAppFab } from '../../components/WhatsAppFab'
import { PwaRegister } from '../../components/PwaRegister'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://hilty.co.tz'),
  title: {
    default: 'Hilty Paint & Coatings Centre',
    template: '%s — Hilty Paint & Coatings Centre',
  },
  description: 'Genuine paint. Professional guidance. Reliable project delivery. Shop Plascon paint and painting materials, calculate requirements and request a quotation from Hilty in Tanzania.',
  manifest: '/manifest.webmanifest',
  applicationName: 'Hilty',
  appleWebApp: { capable: true, title: 'Hilty', statusBarStyle: 'default' },
}

export const viewport: Viewport = { themeColor: '#1e5aa8' }

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const dict = getDictionary(locale)
  return (
    <html lang={locale} className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-surface">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header dict={dict} locale={locale} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer dict={dict} />
        <WhatsAppFab label={dict.nav.whatsapp} />
        <PwaRegister />
      </body>
    </html>
  )
}
