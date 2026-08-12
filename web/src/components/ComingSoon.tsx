import { Button } from './ui/Button'
import { Section, SectionHeading } from './ui/Section'

/**
 * Placeholder for navigation targets that are built in later portions.
 * Keeps global navigation functional without broken links or fabricated content.
 */
export function ComingSoon({ title, note }: { title: string; note?: string }) {
  return (
    <Section>
      <SectionHeading title={title} subtitle={note ?? 'This section is coming soon.'} />
      <div className="flex flex-wrap gap-3">
        <Button href="/request-quotation">Request a quotation</Button>
        <Button href="/" variant="outline">
          Back to home
        </Button>
      </div>
    </Section>
  )
}
