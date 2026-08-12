import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'

/** Renders Payload Lexical rich text; returns null when empty. */
export function Rich({ data, className }: { data: unknown; className?: string }) {
  if (!data || typeof data !== 'object') return null
  return (
    <div className={`prose-hilty ${className ?? ''}`}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <LexicalRichText data={data as any} />
    </div>
  )
}
