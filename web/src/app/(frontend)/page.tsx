/**
 * Placeholder landing page. The redesigned frontend is NOT part of this portion
 * (data foundation only). This simply confirms the app runs and points staff to the admin.
 */
import Link from 'next/link'

export default function Home() {
  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">Hilty Paint &amp; Coatings Centre</h1>
      <p className="text-sm opacity-70">
        Genuine paint. Professional guidance. Reliable project delivery.
      </p>
      <p className="text-sm">
        Data foundation is live. Staff admin:{' '}
        <Link className="underline" href="/admin">
          /admin
        </Link>
        .
      </p>
      <p className="text-xs opacity-50">
        The customer-facing site is built in a later portion.
      </p>
    </main>
  )
}
