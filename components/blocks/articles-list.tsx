import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { getBlockStyle, itemRevealProps, resolveBlockStyle } from "@/lib/block-styles";
import { getArticles } from "@/lib/payload";
import type { ArticlesListBlock } from "@/payload-types";

export async function ArticlesListView({ block }: { block: ArticlesListBlock }) {
  const bs = resolveBlockStyle(getBlockStyle(block), block.appearance);
  const articles = (await getArticles()).slice(0, 3);
  if (articles.length === 0) return null;
  return (
    <Section
      tone={bs.tone}
      width={bs.width}
      paddingSize={bs.paddingSize}
      align={bs.textAlign}
      headingSize={bs.headingSize}
      headingFont={bs.headingFont}
      eyebrowAccent={bs.accentColour}
      eyebrow="Knowledge"
      title={block.heading ?? undefined}
      lede={block.lede ?? undefined}
    >
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a, i) => (
          <li key={a.id}>
            <Reveal {...itemRevealProps(bs, i)} className="h-full">
              <Card interactive className="relative flex h-full flex-col p-6">
                <h3 className="text-h3 text-ink-900 font-semibold">{a.title}</h3>
                {a.excerpt && (
                  <p className="text-text-soft mt-2 flex-1 text-[0.9375rem]">{a.excerpt}</p>
                )}
                <span className="text-brand mt-4 inline-flex items-center gap-1.5 text-sm font-medium">
                  Read <ArrowRight className="h-4 w-4" aria-hidden />
                </span>
                <Link
                  href={`/knowledge/${a.slug}`}
                  prefetch={false}
                  aria-label={`${a.title} — read article`}
                  className="focus-visible:outline-brand absolute inset-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2"
                />
              </Card>
            </Reveal>
          </li>
        ))}
      </ul>
      <div className="mt-10">
        <Link
          href="/knowledge"
          prefetch={false}
          className="text-brand focus-visible:outline-brand inline-flex items-center gap-1.5 font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {block.viewAllLabel ?? "Read the knowledge hub"}{" "}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </Section>
  );
}
