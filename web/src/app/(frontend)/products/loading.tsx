import { Container } from '../../../components/ui/Container'

export default function Loading() {
  return (
    <>
      <div className="border-b border-line bg-surface-2">
        <Container className="py-12 sm:py-16 lg:py-20">
          <div className="h-3 w-24 animate-pulse rounded-sm bg-line" />
          <div className="mt-5 h-10 w-64 animate-pulse rounded-sm bg-line" />
          <div className="mt-5 h-4 w-80 max-w-full animate-pulse rounded-sm bg-line" />
          <div className="mt-9 flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-9 w-32 animate-pulse rounded-full bg-line" />
            ))}
          </div>
        </Container>
      </div>

      <Container className="grid grid-cols-1 gap-10 py-14 lg:grid-cols-[17rem_1fr] lg:gap-14 lg:py-20">
        <div className="h-96 animate-pulse rounded-lg border border-line bg-surface-2" />
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="overflow-hidden rounded-lg border border-line">
              <div className="aspect-[4/3] animate-pulse bg-surface-3" />
              <div className="space-y-3 p-5">
                <div className="h-2.5 w-16 animate-pulse rounded-sm bg-surface-3" />
                <div className="h-4 w-3/4 animate-pulse rounded-sm bg-surface-3" />
                <div className="h-3 w-1/2 animate-pulse rounded-sm bg-surface-3" />
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </>
  )
}
