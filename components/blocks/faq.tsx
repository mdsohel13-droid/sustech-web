import { JsonLd } from "@/components/seo/json-ld";
import { Section } from "@/components/ui/section";
import { getBlockStyle, resolveBlockStyle } from "@/lib/block-styles";
import type { FAQBlock } from "@/payload-types";

export function FAQView({ block }: { block: FAQBlock }) {
  const bs = resolveBlockStyle(getBlockStyle(block), block.appearance);
  const items = block.items ?? [];
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  };
  return (
    <Section
      tone={bs.tone}
      width={bs.width}
      paddingSize={bs.paddingSize}
      align={bs.textAlign}
      headingSize={bs.headingSize}
      headingFont={bs.headingFont}
      eyebrowAccent={bs.accentColour}
      title={block.heading ?? "Frequently asked questions"}
    >
      {items.length > 0 && <JsonLd data={schema} />}
      <dl className="divide-border mx-auto max-w-3xl divide-y">
        {items.map((it, i) => (
          <div key={it.id ?? i} className="py-5">
            <dt className="text-ink-900 text-lg font-semibold">{it.question}</dt>
            <dd className="text-text-soft mt-2">{it.answer}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
