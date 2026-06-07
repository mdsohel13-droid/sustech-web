import { getBlockStyle, resolveBlockStyle } from "@/lib/block-styles";
import { Rich } from "./shared";
import { Section } from "@/components/ui/section";

export function RichTextView({
  block,
}: {
  block: { content?: unknown; appearance?: string | null };
}) {
  const bs = resolveBlockStyle(getBlockStyle(block), block.appearance);
  return (
    <Section
      tone={bs.tone}
      width={bs.width}
      paddingSize={bs.paddingSize}
      align={bs.textAlign}
      headingSize={bs.headingSize}
      headingFont={bs.headingFont}
      eyebrowAccent={bs.accentColour}
    >
      <Rich data={block.content} className="richtext max-w-prose" />
    </Section>
  );
}
