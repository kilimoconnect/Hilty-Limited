import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Container } from '../../../components/ui/Container'

export const metadata: Metadata = { title: 'Hilty Operations Lite', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

function Kpi({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="rounded-xl border border-line bg-surface p-4 hover:border-brand-300">
      <div className="text-2xl font-bold">{value}</div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </Link>
  )
}

export default async function OpsDashboard() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) redirect('/admin/login?redirect=/ops')

  const now = new Date().toISOString()
  const count = async (collection: string, where?: object) => (await payload.find({ collection: collection as never, where: (where ?? {}) as never, limit: 0, depth: 0, overrideAccess: true })).totalDocs

  const [newLeads, openQuotes, siteVisits, aiQualified, overdue, painters, complaints, reservations] = await Promise.all([
    count('leads', { status: { equals: 'new' } }),
    count('quotation-requests', { status: { in: ['received', 'in_review', 'quoted'] } }),
    count('site-visit-requests', { status: { in: ['requested', 'scheduled'] } }),
    count('leads', { source: { in: ['ai_advisor', 'design_studio'] } }),
    count('leads', { and: [{ followUpAt: { less_than: now } }, { status: { not_in: ['won', 'lost'] } }] }),
    count('painters', { status: { equals: 'pending' } }),
    count('complaints', { status: { in: ['open', 'investigating'] } }),
    count('reservations', { status: { in: ['requested', 'confirmed'] } }),
  ])

  const sources = ['website_form', 'whatsapp', 'ai_advisor', 'design_studio', 'site_visit', 'quotation', 'other']
  const sourceCounts = await Promise.all(sources.map((s) => count('leads', { source: { equals: s } })))
  const branches = (await payload.find({ collection: 'branches', limit: 20, depth: 0, overrideAccess: true })).docs
  const branchPerf = await Promise.all(branches.map(async (b) => ({ name: b.name as string, leads: await count('leads', { branch: { equals: b.id } }), won: await count('leads', { and: [{ branch: { equals: b.id } }, { status: { equals: 'won' } }] }) })))

  const roles = (user as { roles?: string[] }).roles ?? []

  return (
    <Container className="py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hilty Operations Lite</h1>
          <p className="text-sm text-muted">Signed in as {String((user as { email?: string }).email)} · roles: {roles.join(', ') || '—'}</p>
        </div>
        <Link href="/admin" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Open full admin →</Link>
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Pipeline overview</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <Kpi label="New leads" value={newLeads} href="/admin/collections/leads?where[status][equals]=new" />
          <Kpi label="Open quotations" value={openQuotes} href="/admin/collections/quotation-requests" />
          <Kpi label="Site visits" value={siteVisits} href="/admin/collections/site-visit-requests" />
          <Kpi label="AI-qualified projects" value={aiQualified} href="/admin/collections/leads" />
          <Kpi label="Overdue follow-ups" value={overdue} href="/admin/collections/leads" />
          <Kpi label="Painter applications" value={painters} href="/admin/collections/painters" />
          <Kpi label="Open complaints" value={complaints} href="/admin/collections/complaints" />
          <Kpi label="Active reservations" value={reservations} href="/admin/collections/reservations" />
        </div>
      </section>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Lead source</h2>
          <ul className="divide-y divide-line rounded-xl border border-line text-sm">
            {sources.map((s, i) => (
              <li key={s} className="flex justify-between px-4 py-2">
                <span className="capitalize">{s.replace(/_/g, ' ')}</span>
                <span className="font-medium">{sourceCounts[i]}</span>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Branch performance</h2>
          <ul className="divide-y divide-line rounded-xl border border-line text-sm">
            {branchPerf.length === 0 && <li className="px-4 py-2 text-muted">No branches.</li>}
            {branchPerf.map((b) => (
              <li key={b.name} className="flex justify-between px-4 py-2">
                <span>{b.name}</span>
                <span className="text-muted">{b.leads} leads · {b.won} won</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <p className="mt-8 text-xs text-muted">Operations Lite reads the live website database. It does not replace Hilty’s accounting/POS system; figures shown are counts of records, never invented financial or inventory data.</p>
    </Container>
  )
}
