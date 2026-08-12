import { Container } from '../../../components/ui/Container'

export default function Loading() {
  return (
    <Container className="py-10">
      <div className="h-8 w-40 animate-pulse rounded bg-brand-50" />
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <div className="h-80 animate-pulse rounded-xl bg-surface-2" />
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="overflow-hidden rounded-xl border border-line">
              <div className="aspect-[4/3] animate-pulse bg-brand-50" />
              <div className="space-y-2 p-4">
                <div className="h-3 w-16 animate-pulse rounded bg-surface-2" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-surface-2" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Container>
  )
}
