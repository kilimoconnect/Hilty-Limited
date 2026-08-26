import { Button } from './ui/Button'
import { Container } from './ui/Container'
import { PageHeader } from './ui/PageHeader'
import { EmptyState } from './ui/EmptyState'
import { BrushIcon } from './ui/icons'

/**
 * Placeholder for navigation targets that are built in later portions.
 * Keeps global navigation functional without broken links or fabricated content.
 */
export function ComingSoon({ title, note }: { title: string; note?: string }) {
  return (
    <>
      <PageHeader title={title} lead={note ?? 'This page is being prepared. In the meantime our team can help you directly.'} />
      <Container className="py-16 sm:py-20">
        <EmptyState
          icon={<BrushIcon width={22} height={22} />}
          title="We're still writing this page"
          body="Everything here is being confirmed with the Hilty team so nothing goes live that isn't accurate. Ask us anything in the meantime."
          action={
            <>
              <Button href="/request-quotation">Request a quotation</Button>
              <Button href="/" variant="outline">
                Back to home
              </Button>
            </>
          }
        />
      </Container>
    </>
  )
}
