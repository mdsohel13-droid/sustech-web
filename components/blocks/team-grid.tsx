import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { getBlockStyle, itemRevealProps, resolveBlockStyle } from "@/lib/block-styles";
import { getTeam } from "@/lib/payload";
import { cn } from "@/lib/utils";
import type { Team } from "@/payload-types";
import { HoverRevealText, mediaUrl, objs } from "./shared";

export async function TeamGridView({
  block,
}: {
  block: {
    heading?: string | null;
    lede?: string | null;
    appearance?: string | null;
    source?: string | null;
    members?: (number | Team)[] | null;
  };
}) {
  const bs = resolveBlockStyle(getBlockStyle(block), block.appearance);
  const members = block.source === "selected" ? objs<Team>(block.members) : await getTeam();
  if (members.length === 0) return null;
  return (
    <Section
      tone={bs.tone}
      width={bs.width}
      paddingSize={bs.paddingSize}
      align={bs.textAlign}
      headingSize={bs.headingSize}
      headingFont={bs.headingFont}
      eyebrowAccent={bs.accentColour}
      eyebrow="Our team"
      title={block.heading ?? undefined}
      lede={block.lede ?? undefined}
    >
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {members.map((m, i) => {
          const photo = mediaUrl(m.photo);
          const hasBio = Boolean(m.bio);
          return (
            <li key={m.id}>
              <Reveal {...itemRevealProps(bs, i)} className="h-full">
                {/*
                 * The whole card is the disclosure target. Image + name + role are always
                 * visible. The bio expands BELOW the role on hover (desktop), focus (keyboard)
                 * or tap (mobile tap = focus). Pure CSS — grid-rows trick, no layout thrash.
                 * `tabIndex={0}` (when there's a bio) makes the card reachable by Tab.
                 * Reduced-motion users get the bio shown statically.
                 */}
                <Card
                  className={cn(
                    "group ease-standard relative flex h-full flex-col overflow-hidden transition-[border-color,box-shadow,transform] duration-[var(--duration-base)]",
                    hasBio &&
                      "focus-visible:outline-brand hover:border-brand/30 focus:border-brand/30 cursor-pointer hover:-translate-y-0.5 hover:shadow-md focus:-translate-y-0.5 focus:shadow-md focus-visible:outline-2 focus-visible:-outline-offset-2",
                  )}
                >
                  <div
                    tabIndex={hasBio ? 0 : -1}
                    role={hasBio ? "button" : undefined}
                    className="bg-surface-2 aspect-square w-full overflow-hidden focus:outline-none"
                    aria-label={hasBio ? `${m.name} — biography` : undefined}
                    aria-expanded={hasBio ? true : undefined}
                  >
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photo.url}
                        alt={photo.alt}
                        className="ease-standard h-full w-full object-cover transition-transform duration-[var(--duration-slow)] group-focus-within:scale-[1.04] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-focus-within:scale-100 motion-reduce:group-hover:scale-100"
                      />
                    ) : (
                      <Skeleton className="h-full w-full rounded-none" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-h3 text-ink-900 font-semibold">{m.name}</h3>
                    <p className="text-brand mt-1 font-mono text-xs tracking-[0.08em] uppercase">
                      {m.role}
                    </p>
                    {hasBio && <HoverRevealText className="mt-3">{m.bio}</HoverRevealText>}
                  </div>
                </Card>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
