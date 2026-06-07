import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { getBlockStyle, resolveBlockStyle } from "@/lib/block-styles";
import { pagePath } from "@/cms/utils/preview";
import type { ContactRFQBlock } from "@/payload-types";

export function ContactRFQView({ block }: { block: ContactRFQBlock }) {
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
      title={block.heading ?? "Request a consultation"}
      lede={block.subhead ?? undefined}
    >
      <ul className="text-text-soft flex flex-wrap items-center gap-3">
        <li className="flex items-center gap-2">
          <Check className="text-energy h-4 w-4" aria-hidden /> No obligation
        </li>
        <li className="flex items-center gap-2">
          <Check className="text-energy h-4 w-4" aria-hidden /> Engineer-scoped
        </li>
      </ul>
      <div className="mt-6">
        <Button asChild size="lg">
          <Link href={pagePath("request-quote")} prefetch={false}>
            Request a Consultation
          </Link>
        </Button>
      </div>
    </Section>
  );
}
