/**
 * Renders a JSON-LD <script>. `<` is escaped to `<` to neutralise any injection
 * vector, per the standard Next.js structured-data pattern.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
