import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { getBlockStyle, itemRevealProps, resolveBlockStyle } from "@/lib/block-styles";
import { getFeaturedProducts } from "@/lib/payload";
import type { Product, ProductShowcaseBlock } from "@/payload-types";
import { HoverRevealText, mediaUrl, objs } from "./shared";

export async function ProductShowcaseView({ block }: { block: ProductShowcaseBlock }) {
  const bs = resolveBlockStyle(getBlockStyle(block), block.appearance as string | null);
  const products =
    block.source === "selected" ? objs<Product>(block.products) : await getFeaturedProducts();
  if (products.length === 0) return null;
  return (
    <Section
      id="products"
      tone={bs.tone}
      width={bs.width}
      paddingSize={bs.paddingSize}
      align={bs.textAlign}
      headingSize={bs.headingSize}
      headingFont={bs.headingFont}
      eyebrowAccent={bs.accentColour}
      eyebrow="Products & distribution"
      title={block.heading ?? undefined}
      lede={block.lede ?? undefined}
    >
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p, i) => {
          const img = mediaUrl(p.image);
          const isExternal = Boolean(p.externalUrl);
          const href = p.externalUrl || `#`;
          return (
            <li key={p.id}>
              <Reveal {...itemRevealProps(bs, i)} className="h-full">
                {/* `group` enables the hover/focus reveal of the summary below brand + title. */}
                <Card
                  interactive
                  className="group focus-within:border-brand/30 relative flex h-full flex-col overflow-hidden focus-within:-translate-y-0.5 focus-within:shadow-md"
                >
                  <div className="bg-surface-2 aspect-[3/2] w-full overflow-hidden">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img.url}
                        alt={img.alt || p.title}
                        loading="lazy"
                        className="ease-standard h-full w-full object-cover transition-transform duration-[var(--duration-slow)] group-focus-within:scale-[1.04] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-focus-within:scale-100 motion-reduce:group-hover:scale-100"
                      />
                    ) : (
                      <Skeleton className="h-full w-full rounded-none" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    {p.brand && (
                      <p className="text-text-soft font-mono text-xs tracking-[0.08em] uppercase">
                        {p.brand}
                      </p>
                    )}
                    <h3 className="text-h3 text-ink-900 mt-1 font-semibold">{p.title}</h3>
                    {p.summary && <HoverRevealText className="mt-3">{p.summary}</HoverRevealText>}
                    {p.externalUrl && (
                      <span className="text-brand mt-4 inline-flex items-center gap-1.5 text-sm font-medium">
                        Learn more <ArrowRight className="h-4 w-4" aria-hidden />
                      </span>
                    )}
                  </div>
                  {p.externalUrl && (
                    <Link
                      href={href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      prefetch={false}
                      aria-label={`${p.title} — open product page`}
                      className="focus-visible:outline-brand absolute inset-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2"
                    />
                  )}
                </Card>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
