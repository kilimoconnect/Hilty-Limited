import '../globals.css'
import type { Metadata } from 'next'
import { getLocale } from '../../i18n/locale'
import { getDictionary } from '../../i18n/dictionaries'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { WhatsAppFab } from '../../components/WhatsAppFab'

export const metadata: Metadata = {
  title: {
    default: 'Hilty Paint & Coatings Centre',
    template: '%s — Hilty Paint & Coatings Centre',
  },
  description: 'Genuine paint. Professional guidance. Reliable project delivery. Shop Plascon paint and painting materials, calculate requirements and request a quotation from Hilty in Tanzania.',
}

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
      </body>
    </html>
  )
}
