import { RichText } from "@payloadcms/richtext-lexical/react";
import { ArrowRight, Calculator, Check, Quote } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { sectorIcons, serviceIcons } from "@/components/icons";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { GridMotif } from "@/components/ui/grid-motif";
import { ProofCounter } from "@/components/ui/proof-counter";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getBlockStyle, itemRevealProps, resolveBlockStyle } from "@/lib/block-styles";
import type { SectionTone } from "@/lib/block-styles";
import { fallbackPoster, parseVideoEmbed, toIso8601Duration, type VideoItem } from "@/lib/video";
import { serverUrl } from "@/lib/seo";
import {
  getArticles,
  getClients,
  getFeaturedProducts,
  getFeaturedProjects,
  getRecentMedia,
  getSectors,
  getServices,
  getTeam,
  getTestimonials,
} from "@/lib/payload";
import { pagePath } from "@/cms/utils/preview";
import type {
  ArticlesListBlock,
  CalculatorEmbedBlock,
  Client,
  ContactRFQBlock,
  CTABandBlock,
  FAQBlock,
  HeroBlock,
  ImageGalleryBlock,
  LogoWallBlock,
  Media,
  PartnerBarBlock,
  Product,
  ProductShowcaseBlock,
  Project,
  Sector,
  Service,
  SpacerBlock,
  StatsCountersBlock,
  StepsBlock,
  Team,
  Testimonial,
  VideoShowcaseBlock,
} from "@/payload-types";
import { HeroCarousel } from "./hero-carousel";
import { HeroMediaPanel, type HeroPanelItem } from "./hero-media-panel";
import { PhotoStripClient } from "./photo-strip";
import { CtaButtons, type Cta } from "./shared";
import { VideoShowcaseClient } from "./video-showcase";

type RichData = ComponentProps<typeof RichText>["data"];
function Rich({ data, className }: { data: unknown; className?: string }) {
  if (!data) return null;
  return <RichText data={data as RichData} className={className} />;
}

const objs = <T,>(arr?: (number | T)[] | null): T[] =>
  (arr ?? []).filter((x): x is T => typeof x === "object" && x !== null);

function mediaUrl(m?: number | Media | null): { url: string; alt: string } | null {
  if (!m || typeof m !== "object" || !m.url) return null;
  return { url: m.url, alt: m.alt ?? "" };
}

/**
 * Smoothly expands a description below the card's persistent header (image + title + meta)
 * when the parent `group` is hovered (desktop), focused (Tab) or tap-focused (mobile).
 *
 * Same `grid-template-rows: 0fr → 1fr` technique used by the nav dropdown reveal and the
 * team-bio reveal — pure CSS, GPU-only, no JS, no layout thrash. The 150ms `--delay-reveal`
 * applies only on the way IN (anti-flicker on fast mouse-sweeps); collapse is instant.
 *
 * Under prefers-reduced-motion the description is shown statically (no animation).
 * For the reveal to fire, the ANCESTOR card needs the `group` class.
 */
function HoverRevealText({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="ease-standard grid grid-rows-[0fr] transition-[grid-template-rows] delay-0 duration-[var(--duration-base)] group-focus-within:grid-rows-[1fr] group-focus-within:delay-[var(--delay-reveal)] group-hover:grid-rows-[1fr] group-hover:delay-[var(--delay-reveal)] motion-reduce:grid-rows-[1fr]">
      <div className="overflow-hidden">
        <p
          className={cn(
            "text-text-soft ease-standard -translate-y-1 text-[0.9375rem] opacity-0 transition-[opacity,transform] duration-[var(--duration-base)] group-focus-within:translate-y-0 group-focus-within:opacity-100 group-focus-within:delay-[var(--delay-reveal)] group-hover:translate-y-0 group-hover:opacity-100 group-hover:delay-[var(--delay-reveal)] motion-reduce:translate-y-0 motion-reduce:opacity-100",
            className,
          )}
        >
          {children}
        </p>
      </div>
    </div>
  );
}

// --- Hero -------------------------------------------------------------------

/** Map a (possibly unpopulated) media relation to a hero panel item. */
function panelItemFromMedia(
  m: number | Media | null | undefined,
  caption?: string | null,
): HeroPanelItem | null {
  if (!m || typeof m !== "object" || !m.url) return null;
  return { url: m.url, mimeType: m.mimeType ?? null, alt: m.alt ?? "", caption: caption ?? null };
}

/**
 * Resolve the hero side-media panel items from the CMS `sideMedia` group.
 * Source is admin-selectable:
 *   manual   → the exact items chosen on the block
 *   library  → most recent media uploads (images + videos)
 *   projects → featured project gallery photos, with a few explainer videos mixed in
 */
async function resolveHeroPanelItems(sideMedia: HeroBlock["sideMedia"]): Promise<HeroPanelItem[]> {
  if (!sideMedia?.enabled) return [];
  const source = sideMedia.source ?? "projects";

  if (source === "manual") {
    return (sideMedia.items ?? [])
      .map((it) => panelItemFromMedia(it.media, it.caption))
      .filter((x): x is HeroPanelItem => x !== null)
      .slice(0, 12);
  }

  if (source === "library") {
    const media = await getRecentMedia({ limit: 12 });
    return media
      .filter(
        (m) => m.url && (m.mimeType?.startsWith("image/") || m.mimeType?.startsWith("video/")),
      )
      .map((m) => panelItemFromMedia(m))
      .filter((x): x is HeroPanelItem => x !== null);
  }

  // "projects" — featured project gallery photos + a few explainer videos.
  const [projects, videos] = await Promise.all([
    getFeaturedProjects(6),
    getRecentMedia({ videoOnly: true, limit: 4 }),
  ]);
  const images = projects
    .flatMap((p) => p.gallery ?? [])
    .map((g) => panelItemFromMedia(g.image))
    .filter((x): x is HeroPanelItem => x !== null);
  const clips = videos
    .map((m) => panelItemFromMedia(m))
    .filter((x): x is HeroPanelItem => x !== null);

  if (clips.length === 0) return images.slice(0, 10);

  // Interleave one clip every few images so the mix feels natural.
  const merged: HeroPanelItem[] = [];
  const step = Math.max(2, Math.ceil(images.length / (clips.length + 1)));
  let ci = 0;
  images.forEach((img, i) => {
    merged.push(img);
    if ((i + 1) % step === 0) {
      const clip = clips[ci];
      if (clip) {
        merged.push(clip);
        ci += 1;
      }
    }
  });
  for (; ci < clips.length; ci += 1) {
    const clip = clips[ci];
    if (clip) merged.push(clip);
  }
  return merged.slice(0, 10);
}

export async function HeroView({ block, isFirst }: { block: HeroBlock; isFirst: boolean }) {
  const dark = block.tone !== "light";
  const bg = mediaUrl(block.backgroundImage);
  const video = mediaUrl(block.backgroundVideo);
  const Heading = isFirst ? "h1" : "h2";

  // ── Side media panel (fills the empty space beside the hero text) ─────────
  const panelItems = await resolveHeroPanelItems(block.sideMedia);
  const showPanel = Boolean(block.sideMedia?.enabled) && panelItems.length > 0;
  const panelInterval = block.sideMedia?.interval ?? 5;

  // ── Band height (admin-adjustable) ────────────────────────────────────────
  const heroHeight = block.height ?? "standard";
  const isScreen = heroHeight === "screen";
  const heroPadding: Record<string, string> = {
    compact: showPanel ? "py-12 md:py-16" : "py-14 md:py-20",
    standard: showPanel ? "py-16 md:py-24 lg:py-28" : "py-24 md:py-32 lg:py-40",
    tall: showPanel ? "py-24 md:py-36 lg:py-44" : "py-32 md:py-44 lg:py-56",
    screen: showPanel ? "py-16 md:py-20" : "py-20 md:py-28",
  };
  const heroPad = heroPadding[heroHeight] ?? heroPadding.standard;

  // Carousel mode: use client-side HeroCarousel component
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isCarousel = (block as any).heroMode === "carousel";
  const carouselItems: {
    url: string;
    mimeType?: string | null;
    alt?: string | null;
    caption?: string | null;
  }[] = isCarousel
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((block as any).carouselItems ?? [])
        .map((item: { media?: Record<string, unknown> | null; caption?: string | null }) => {
          const m = item.media;
          if (!m || typeof m !== "object") return null;
          return {
            url: String(m["url"] ?? ""),
            mimeType: m["mimeType"] as string | null | undefined,
            alt: m["alt"] as string | null | undefined,
            caption: item.caption,
          };
        })
        .filter(Boolean)
    : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const intervalSec = (block as any).carouselInterval ?? 5;

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden",
        dark ? "bg-ink-900 text-text-invert" : "bg-surface text-text",
        isScreen && "flex min-h-[100svh] flex-col justify-center",
      )}
    >
      {dark && (
        <>
          {/* Vertical depth gradient — softens the band instead of a flat fill. */}
          <div
            aria-hidden
            className="from-ink-950 via-ink-900 to-ink-950 absolute inset-0 bg-gradient-to-b"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(60%_55%_at_18%_-5%,rgba(14,95,216,0.28),transparent_60%),radial-gradient(45%_40%_at_92%_8%,rgba(245,158,11,0.12),transparent_55%)]"
          />
          <GridMotif tone="dark" />
          {/* Smooth gradient hand-off into the (usually light) section below —
              removes the hard dark→white edge. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-20 bg-gradient-to-b from-transparent to-[var(--color-surface)] md:h-28"
          />
        </>
      )}

      {/* Carousel mode — client component handles the crossfade */}
      {isCarousel && carouselItems.length > 0 ? (
        <HeroCarousel items={carouselItems} interval={intervalSec} />
      ) : (
        <>
          {video ? (
            // Autoplay-muted-loop video. The image is the poster — it paints instantly (LCP-safe)
            // and stays visible if the video is blocked, slow, or motion is reduced. `motion-reduce`
            // hides the <video> entirely under prefers-reduced-motion (poster remains visible).
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={bg?.url}
              aria-hidden
              className="absolute inset-0 -z-10 h-full w-full object-cover opacity-30 motion-reduce:hidden"
            >
              <source src={video.url} type="video/mp4" />
            </video>
          ) : null}
          {bg && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bg.url}
              alt={bg.alt}
              className={`absolute inset-0 -z-20 h-full w-full object-cover opacity-25 ${video ? "motion-reduce:opacity-30" : ""}`}
            />
          )}
        </>
      )}

      <Container className={cn("relative w-full", heroPad)}>
        <div className={cn(showPanel && "grid items-center gap-10 lg:grid-cols-2 lg:gap-14")}>
          <div className={showPanel ? "max-w-2xl" : "max-w-3xl"}>
            {block.eyebrow && (
              <Eyebrow onDark={dark} className="hero-rise [animation-delay:0ms]">
                {block.eyebrow}
              </Eyebrow>
            )}
            <Heading className="text-display hero-rise mt-4 font-bold text-balance [animation-delay:70ms]">
              {block.heading}
            </Heading>
            {block.subhead && (
              <p
                className={`text-lede hero-rise mt-6 max-w-2xl [animation-delay:140ms] ${dark ? "text-text-invert-soft" : "text-text-soft"}`}
              >
                {block.subhead}
              </p>
            )}
            <div className="hero-rise [animation-delay:210ms]">
              <CtaButtons ctas={block.ctas as Cta[] | null} onDark={dark} />
            </div>
          </div>

          {showPanel && (
            <div className="hero-rise [animation-delay:240ms]">
              <HeroMediaPanel items={panelItems} interval={panelInterval} dark={dark} />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

// --- PhotoStrip -------------------------------------------------------------

export function PhotoStripView({
  block,
}: {
  block: {
    heading?: string | null;
    photos?: Array<{ image: number | Media; caption?: string | null }> | null;
    displayMode?: string | null;
    speed?: string | null;
    appearance?: string | null;
  };
}) {
  const bs = resolveBlockStyle(getBlockStyle(block), block.appearance);
  const photos = (block.photos ?? [])
    .map((item) => {
      const img = mediaUrl(item.image);
      if (!img) return null;
      return { url: img.url, alt: img.alt, caption: item.caption };
    })
    .filter(Boolean) as Array<{ url: string; alt: string; caption?: string | null }>;

  return (
    <Section
      tone={bs.tone}
      width={bs.width === "full-bleed" ? "full-bleed" : "wide"}
      paddingSize={bs.paddingSize}
      align={bs.textAlign}
      headingSize={bs.headingSize}
      headingFont={bs.headingFont}
      eyebrowAccent={bs.accentColour}
      withBorder={bs.withBorder}
      headerAnimation={bs.animationStyle}
      title={block.heading ?? undefined}
      srTitle={block.heading ? undefined : "Photo gallery"}
    >
      <PhotoStripClient
        photos={photos}
        displayMode={(block.displayMode as "marquee" | "carousel" | null) ?? "marquee"}
        speed={block.speed}
      />
    </Section>
  );
}

// --- VideoShowcase ----------------------------------------------------------

/** Make a media URL absolute for schema.org (poster/contentUrl must be absolute). */
function absUrl(u?: string | null): string | undefined {
  if (!u) return undefined;
  return u.startsWith("http") ? u : `${serverUrl}${u}`;
}

export function VideoShowcaseView({ block }: { block: VideoShowcaseBlock }) {
  const styleInput = getBlockStyle(block);
  // The style panel still drives width / padding / heading / animation, but the
  // band background is owned by the dedicated `tone` field (defaults to dark —
  // the cinematic look that reads best for video).
  const bs = resolveBlockStyle(styleInput);
  const tone: SectionTone = (block.tone as SectionTone | null | undefined) ?? "dark";
  const isDark = tone === "dark" || tone === "brand" || tone === "energy";
  const layout = block.layout === "grid" ? "grid" : "spotlight";

  const rawVideos = block.videos ?? [];

  // Normalise each CMS row into a render-ready VideoItem for the client player.
  const videos: VideoItem[] = rawVideos
    .map((v): VideoItem | null => {
      const source: VideoItem["source"] = v.source === "url" ? "url" : "upload";
      const embed = source === "url" ? parseVideoEmbed(v.videoUrl) : null;
      const poster = mediaUrl(v.poster);
      const file = mediaUrl(v.videoFile);
      const posterUrl = poster?.url ?? fallbackPoster(embed);
      const playable = source === "upload" ? Boolean(file?.url) : Boolean(embed);
      if (!playable) return null;
      return {
        title: v.title,
        description: v.description ?? null,
        posterUrl,
        posterAlt: poster?.alt ?? v.title,
        duration: v.duration ?? null,
        source,
        mp4Url: file?.url ?? null,
        embed,
        featured: Boolean(v.featured),
      };
    })
    .filter((v): v is VideoItem => v !== null);

  if (videos.length === 0) return null;

  // VideoObject schema per video — mirrors visible content (no invented data),
  // so AI engines and Google Video can surface and cite these clips.
  const videoSchemas = rawVideos
    .map((v, i) => {
      const item = videos.find((x) => x.title === v.title);
      if (!item) return null;
      const thumb = absUrl(item.posterUrl);
      const duration = toIso8601Duration(v.duration);
      const schema: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: v.title,
        description: v.description || v.title,
      };
      if (thumb) schema.thumbnailUrl = thumb;
      if (v.uploadDate) schema.uploadDate = v.uploadDate;
      if (duration) schema.duration = duration;
      if (item.source === "upload" && item.mp4Url) schema.contentUrl = absUrl(item.mp4Url);
      if (item.embed) schema.embedUrl = item.embed.embedUrl;
      // Google requires a thumbnail; skip emitting an incomplete object.
      return thumb ? { key: v.id ?? i, schema } : null;
    })
    .filter((x): x is { key: string | number; schema: Record<string, unknown> } => x !== null);

  const bgClass =
    tone === "brand"
      ? "bg-brand text-white"
      : tone === "energy"
        ? "bg-energy text-white"
        : tone === "dark"
          ? "bg-ink-900 text-text-invert"
          : tone === "muted"
            ? "bg-surface-2 text-text"
            : tone === "solar"
              ? "bg-solar text-solar-text"
              : "bg-surface text-text";

  const hasHeader = Boolean(block.eyebrow || block.heading || block.lede);

  return (
    <section className={cn(bgClass, "relative isolate overflow-hidden")}>
      {videoSchemas.map(({ key, schema }) => (
        <JsonLd key={key} data={schema} />
      ))}

      {isDark && (
        <>
          {/* Brand-correct ambient glow — True Blue + Lime Green (never purple). */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(55%_50%_at_15%_-5%,rgba(0,115,207,0.25),transparent_60%),radial-gradient(45%_45%_at_90%_8%,rgba(50,205,50,0.12),transparent_55%)]"
          />
          <GridMotif tone="dark" />
        </>
      )}

      <Container width={bs.width} className={cn("relative", bs.paddingClass)}>
        {hasHeader && (
          <Reveal
            animation={bs.animationStyle}
            delay={bs.delayMs}
            className={cn(
              "mb-10 max-w-2xl md:mb-14",
              bs.textAlign === "center" && "mx-auto text-center",
            )}
          >
            {block.eyebrow && <Eyebrow onDark={isDark}>{block.eyebrow}</Eyebrow>}
            {block.heading && (
              <h2
                className={cn(
                  bs.headingSizeClass,
                  bs.headingFontClass,
                  "mt-3 font-semibold text-balance",
                  isDark ? "text-text-invert" : "text-ink-900",
                )}
              >
                {block.heading}
              </h2>
            )}
            {block.lede && (
              <p
                className={cn(
                  "text-lede mt-4",
                  isDark ? "text-text-invert-soft" : "text-text-soft",
                )}
              >
                {block.lede}
              </p>
            )}
          </Reveal>
        )}

        <Reveal animation={bs.animationStyle} delay={bs.delayMs + 80}>
          <VideoShowcaseClient videos={videos} layout={layout} />
        </Reveal>
      </Container>
    </section>
  );
}

// --- RichText ---------------------------------------------------------------

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
      withBorder={bs.withBorder}
      headerAnimation={bs.animationStyle}
    >
      <Rich data={block.content} className="richtext max-w-prose" />
    </Section>
  );
}

// --- StatsCounters ----------------------------------------------------------

export function StatsCountersView({ block }: { block: StatsCountersBlock }) {
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
      withBorder={bs.withBorder}
      headerAnimation={bs.animationStyle}
      srTitle="Key figures"
    >
      {block.intro && (
        <p className="text-text-soft mb-10 text-center font-mono text-xs font-medium tracking-[0.08em] uppercase">
          {block.intro}
        </p>
      )}
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
        {(block.stats ?? []).map((s, i) => (
          <Reveal key={s.id ?? i} {...itemRevealProps(bs, i)}>
            <ProofCounter value={s.value ?? null} label={s.label} suffix={s.suffix ?? undefined} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

// --- ServicesGrid -----------------------------------------------------------

export async function ServicesGridView({
  block,
}: {
  block: {
    heading?: string | null;
    lede?: string | null;
    appearance?: Service["icon"] extends never ? never : string | null;
    source?: string | null;
    services?: (number | Service)[] | null;
  };
}) {
  const bs = resolveBlockStyle(getBlockStyle(block), block.appearance as string | null);
  const services =
    block.source === "selected" ? objs<Service>(block.services) : await getServices();
  return (
    <Section
      id="services"
      tone={bs.tone}
      width={bs.width}
      paddingSize={bs.paddingSize}
      align={bs.textAlign}
      headingSize={bs.headingSize}
      headingFont={bs.headingFont}
      eyebrowAccent={bs.accentColour}
      withBorder={bs.withBorder}
      headerAnimation={bs.animationStyle}
      eyebrow="What we do"
      title={block.heading ?? undefined}
      lede={block.lede ?? undefined}
    >
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {services.map((svc, i) => {
          const Icon = serviceIcons[svc.icon] ?? serviceIcons.solar;
          return (
            <li key={svc.id}>
              <Reveal {...itemRevealProps(bs, i)} className="h-full">
                <Card interactive className="relative flex h-full flex-col p-6">
                  <span className="bg-brand/10 text-brand inline-flex h-11 w-11 items-center justify-center rounded-md">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <h3 className="text-h3 text-ink-900 mt-5 font-semibold">{svc.title}</h3>
                  <p className="text-text-soft mt-2 flex-1 text-[0.9375rem]">{svc.summary}</p>
                  <span className="text-brand mt-5 inline-flex items-center gap-1.5 text-sm font-medium">
                    Explore <ArrowRight className="h-4 w-4" aria-hidden />
                  </span>
                  <Link
                    href={`/services/${svc.slug}`}
                    prefetch={false}
                    aria-label={`${svc.title} — explore this service`}
                    className="focus-visible:outline-brand absolute inset-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2"
                  />
                </Card>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

// --- SectorTiles ------------------------------------------------------------

export async function SectorTilesView({
  block,
}: {
  block: {
    heading?: string | null;
    lede?: string | null;
    appearance?: string | null;
    source?: string | null;
    sectors?: (number | Sector)[] | null;
  };
}) {
  const bs = resolveBlockStyle(getBlockStyle(block), block.appearance);
  const sectors = block.source === "selected" ? objs<Sector>(block.sectors) : await getSectors();
  return (
    <Section
      id="solutions"
      tone={bs.tone}
      width={bs.width}
      paddingSize={bs.paddingSize}
      align={bs.textAlign}
      headingSize={bs.headingSize}
      headingFont={bs.headingFont}
      eyebrowAccent={bs.accentColour}
      withBorder={bs.withBorder}
      headerAnimation={bs.animationStyle}
      eyebrow="Solutions by sector"
      title={block.heading ?? undefined}
      lede={block.lede ?? undefined}
    >
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {sectors.map((sec, i) => {
          const Icon = sectorIcons[sec.icon] ?? sectorIcons.industrial;
          return (
            <li key={sec.id}>
              <Reveal {...itemRevealProps(bs, i)} className="h-full">
                <Card interactive className="relative flex h-full flex-col p-6">
                  <span className="bg-ink-900/[0.06] text-ink-900 inline-flex h-11 w-11 items-center justify-center rounded-md">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <h3 className="text-h3 text-ink-900 mt-5 font-semibold">{sec.title}</h3>
                  <p className="text-text-soft mt-2 flex-1 text-[0.9375rem]">{sec.summary}</p>
                  <Link
                    href={`/solutions/${sec.slug}`}
                    prefetch={false}
                    aria-label={`${sec.title} — view sector solutions`}
                    className="focus-visible:outline-brand absolute inset-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2"
                  />
                </Card>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

// --- ProjectsList -----------------------------------------------------------

export async function ProjectsListView({
  block,
}: {
  block: {
    heading?: string | null;
    lede?: string | null;
    appearance?: string | null;
    source?: string | null;
    projects?: (number | Project)[] | null;
    viewAllLabel?: string | null;
  };
}) {
  const bs = resolveBlockStyle(getBlockStyle(block), block.appearance);
  const projects =
    block.source === "selected" ? objs<Project>(block.projects) : await getFeaturedProjects(3);
  return (
    <Section
      tone={bs.tone}
      width={bs.width}
      paddingSize={bs.paddingSize}
      align={bs.textAlign}
      headingSize={bs.headingSize}
      headingFont={bs.headingFont}
      eyebrowAccent={bs.accentColour}
      withBorder={bs.withBorder}
      headerAnimation={bs.animationStyle}
      eyebrow="Featured projects"
      title={block.heading ?? undefined}
      lede={block.lede ?? undefined}
    >
      {projects.length === 0 ? (
        <ul
          className="grid gap-6 md:grid-cols-3"
          aria-busy="true"
          aria-label="Featured projects — loading from the content system"
        >
          {[0, 1, 2].map((i) => (
            <li key={i}>
              <Card className="overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="space-y-3 p-6">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid gap-6 md:grid-cols-3">
          {projects.map((p, i) => {
            const img = mediaUrl(objs<{ image?: number | Media | null }>(p.gallery)[0]?.image);
            const sectorName = p.sector && typeof p.sector === "object" ? p.sector.title : null;
            return (
              <li key={p.id}>
                <Reveal {...itemRevealProps(bs, i)}>
                  {/*
                   * `group` enables the hover/focus-within reveal of the summary below the
                   * meta line. The image + sector + name stay always visible so the card is
                   * scannable at a glance; the longer summary expands smoothly on interaction.
                   */}
                  <Card
                    interactive
                    className="group focus-within:border-brand/30 relative h-full overflow-hidden focus-within:-translate-y-0.5 focus-within:shadow-md"
                  >
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img.url}
                        alt={img.alt}
                        className="ease-standard aspect-[4/3] w-full object-cover transition-transform duration-[var(--duration-slow)] group-focus-within:scale-[1.03] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-focus-within:scale-100 motion-reduce:group-hover:scale-100"
                      />
                    ) : (
                      <Skeleton className="aspect-[4/3] w-full rounded-none" />
                    )}
                    <div className="p-6">
                      {sectorName && (
                        <p className="text-brand font-mono text-xs tracking-[0.08em] uppercase">
                          {sectorName}
                        </p>
                      )}
                      <h3 className="text-h3 text-ink-900 mt-2 font-semibold">{p.name}</h3>
                      {p.summary && <HoverRevealText className="mt-2">{p.summary}</HoverRevealText>}
                    </div>
                    <Link
                      href={`/projects/${p.slug}`}
                      prefetch={false}
                      aria-label={`${p.name} — read case study`}
                      className="focus-visible:outline-brand absolute inset-0 focus-visible:outline-2 focus-visible:outline-offset-2"
                    />
                  </Card>
                </Reveal>
              </li>
            );
          })}
        </ul>
      )}
      <div className="mt-10">
        <Link
          href="/projects"
          prefetch={false}
          className="text-brand focus-visible:outline-brand inline-flex items-center gap-1.5 font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {block.viewAllLabel ?? "View all projects"} <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </Section>
  );
}

// --- TeamGrid ---------------------------------------------------------------

export async function TeamGridView({
  block,
}: {
  block: {
    heading?: string | null;
    lede?: string | null;
    appearance?: string | null;
    source?: string | null;
    group?: string | null;
    members?: (number | Team)[] | null;
  };
}) {
  const bs = resolveBlockStyle(getBlockStyle(block), block.appearance);
  const all = block.source === "selected" ? objs<Team>(block.members) : await getTeam();
  // Automatic mode can scope to a single group (Leadership, Engineering, …) so an
  // admin can stack one Team block per group, each with its own heading.
  const group = block.group ?? "all";
  const members =
    block.source === "selected" || group === "all"
      ? all
      : all.filter((m) => (m.category ?? "leadership") === group);
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
      withBorder={bs.withBorder}
      headerAnimation={bs.animationStyle}
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
                 * or tap (mobile tap = focus). Pure CSS — the same grid-rows trick used by
                 * the nav dropdown reveal, so the height animates smoothly with no layout
                 * thrash. `tabIndex={0}` (when there's a bio) makes the card reachable by Tab
                 * and discoverable by touch. Reduced-motion users get the bio shown statically.
                 */}
                <Card
                  className={cn(
                    "group ease-standard relative flex h-full flex-col overflow-hidden transition-[border-color,box-shadow,transform] duration-[var(--duration-base)]",
                    hasBio &&
                      "focus-visible:outline-brand hover:border-brand/30 focus:border-brand/30 cursor-pointer hover:-translate-y-0.5 hover:shadow-md focus:-translate-y-0.5 focus:shadow-md focus-visible:outline-2 focus-visible:-outline-offset-2",
                  )}
                  // Whole card is one trigger; we don't double-tabstop on the image.
                  // No role="button" / aria-expanded — without JS toggling it would lie to AT;
                  // the bio is in the DOM at all times and always read by assistive tech.
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

// --- ArticlesList -----------------------------------------------------------

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
      withBorder={bs.withBorder}
      headerAnimation={bs.animationStyle}
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

// --- ProductShowcase --------------------------------------------------------

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
      withBorder={bs.withBorder}
      headerAnimation={bs.animationStyle}
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

// --- PartnerBar -------------------------------------------------------------

export function PartnerBarView({ block }: { block: PartnerBarBlock }) {
  const bs = resolveBlockStyle(getBlockStyle(block), block.appearance);
  const partners = block.partners ?? [];
  if (partners.length === 0) return null;
  return (
    <Section
      tone={bs.tone}
      width={bs.width}
      paddingSize={bs.paddingSize}
      align={bs.textAlign}
      headingSize={bs.headingSize}
      headingFont={bs.headingFont}
      eyebrowAccent={bs.accentColour}
      withBorder={bs.withBorder}
      headerAnimation={bs.animationStyle}
      srTitle="Technology partners"
    >
      {block.heading && (
        <p className="text-text-soft mb-6 text-center font-mono text-xs font-medium tracking-[0.08em] uppercase">
          {block.heading}
        </p>
      )}
      <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {partners.map((p, i) => {
          const logo = mediaUrl(p.logo);
          return (
            <li key={p.id ?? i} className="text-text-soft text-lg font-semibold">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logo.url}
                  alt={logo.alt || p.name}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                p.name
              )}
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

// --- ImageGallery -----------------------------------------------------------

export function ImageGalleryView({ block }: { block: ImageGalleryBlock }) {
  const bs = resolveBlockStyle(getBlockStyle(block), block.appearance);
  const images = (block.images ?? [])
    .map((row) => mediaUrl(row.image))
    .filter((x): x is { url: string; alt: string } => Boolean(x));
  return (
    <Section
      tone={bs.tone}
      width={bs.width}
      paddingSize={bs.paddingSize}
      align={bs.textAlign}
      headingSize={bs.headingSize}
      headingFont={bs.headingFont}
      eyebrowAccent={bs.accentColour}
      withBorder={bs.withBorder}
      headerAnimation={bs.animationStyle}
      title={block.heading ?? undefined}
    >
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {images.map((img, i) => (
          <li key={i} className="border-border overflow-hidden rounded-lg border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={img.alt}
              className="aspect-[4/3] w-full object-cover"
              loading="lazy"
            />
          </li>
        ))}
      </ul>
    </Section>
  );
}

// --- LogoWall ---------------------------------------------------------------

export async function LogoWallView({ block }: { block: LogoWallBlock }) {
  const bs = resolveBlockStyle(getBlockStyle(block), block.appearance);
  const clients = block.source === "selected" ? objs<Client>(block.clients) : await getClients();
  return (
    <Section
      tone={bs.tone}
      width={bs.width}
      paddingSize={bs.paddingSize}
      align={bs.textAlign}
      headingSize={bs.headingSize}
      headingFont={bs.headingFont}
      eyebrowAccent={bs.accentColour}
      withBorder={bs.withBorder}
      headerAnimation={bs.animationStyle}
    >
      {block.heading && (
        <h2 className="text-text-soft text-center text-base font-medium">{block.heading}</h2>
      )}
      <Reveal animation={bs.animationStyle} delay={bs.delayMs} className="mt-10">
        <ul className="grid grid-cols-2 items-center gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
          {clients.length === 0
            ? Array.from({ length: 6 }, (_, i) => (
                <li key={i} className="flex justify-center">
                  <Skeleton className="bg-surface-3 h-10 w-28" />
                </li>
              ))
            : clients.map((c) => {
                const logo = mediaUrl(c.logo);
                return (
                  <li key={c.id} className="flex justify-center">
                    {logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logo.url}
                        alt={c.name}
                        className="h-10 w-auto object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-text-soft text-sm font-medium">{c.name}</span>
                    )}
                  </li>
                );
              })}
        </ul>
      </Reveal>
    </Section>
  );
}

// --- Testimonials -----------------------------------------------------------

export async function TestimonialsView({
  block,
}: {
  block: {
    heading?: string | null;
    appearance?: string | null;
    source?: string | null;
    testimonials?: (number | Testimonial)[] | null;
  };
}) {
  const bs = resolveBlockStyle(getBlockStyle(block), block.appearance);
  const items =
    block.source === "selected" ? objs<Testimonial>(block.testimonials) : await getTestimonials();
  return (
    <Section
      tone={bs.tone}
      width={bs.width}
      paddingSize={bs.paddingSize}
      align={bs.textAlign}
      headingSize={bs.headingSize}
      headingFont={bs.headingFont}
      eyebrowAccent={bs.accentColour}
      withBorder={bs.withBorder}
      headerAnimation={bs.animationStyle}
      eyebrow="Testimonials"
      title={block.heading ?? undefined}
    >
      {items.length === 0 ? (
        <ul
          className="grid gap-6 md:grid-cols-2"
          aria-busy="true"
          aria-label="Client testimonials — loading from the content system"
        >
          {[0, 1].map((i) => (
            <li key={i}>
              <Card className="flex h-full flex-col gap-5 p-8">
                <Quote className="text-brand/30 h-7 w-7" aria-hidden />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid gap-6 md:grid-cols-2">
          {items.map((t, i) => (
            <li key={t.id}>
              <Reveal {...itemRevealProps(bs, i)}>
                <Card className="flex h-full flex-col gap-5 p-8">
                  <Quote className="text-brand/30 h-7 w-7" aria-hidden />
                  <blockquote className="text-ink-900 text-lg">“{t.quote}”</blockquote>
                  <footer className="mt-auto">
                    <p className="text-ink-900 font-semibold">{t.person}</p>
                    <p className="text-text-soft text-sm">
                      {[t.role, t.company].filter(Boolean).join(", ")}
                    </p>
                  </footer>
                </Card>
              </Reveal>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

// --- Steps ------------------------------------------------------------------

export function StepsView({ block }: { block: StepsBlock }) {
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
      withBorder={bs.withBorder}
      headerAnimation={bs.animationStyle}
      eyebrow={block.eyebrow ?? "How we work"}
      title={block.heading ?? undefined}
    >
      <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {(block.steps ?? []).map((step, i) => (
          <li key={step.id ?? i}>
            <Reveal {...itemRevealProps(bs, i)}>
              <div className="border-border border-t pt-5">
                <span className="text-brand font-mono text-sm font-medium tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-h3 text-ink-900 mt-3 font-semibold">{step.title}</h3>
                <p className="text-text-soft mt-2 text-[0.9375rem]">{step.body}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}

// --- CTABand ----------------------------------------------------------------

export function CTABandView({ block }: { block: CTABandBlock }) {
  // CTABand now fully respects the block-style system:
  // padding, width, tone, text-align and animation are all CMS-driven.
  // Default tone is "dark" but editors can switch to brand/energy/solar/light.
  const bs = resolveBlockStyle(getBlockStyle(block));
  const isDark = bs.tone === "dark" || bs.tone === "brand" || bs.tone === "energy";
  const bgClass =
    bs.tone === "brand"
      ? "bg-brand text-white"
      : bs.tone === "energy"
        ? "bg-energy text-white"
        : bs.tone === "solar"
          ? "bg-solar text-solar-text"
          : bs.tone === "muted"
            ? "bg-surface-2 text-text"
            : bs.tone === "light"
              ? "bg-surface text-text"
              : "bg-ink-900 text-text-invert"; // default dark
  const subheadColour = isDark ? "text-text-invert-soft" : "text-text-soft";
  // Respect the paddingSize CMS control — override the old hardcoded py-20 md:py-28
  const bandPadding: Record<string, string> = {
    compact: "py-10 md:py-14",
    standard: "py-16 md:py-20",
    spacious: "py-20 md:py-28",
  };
  const py = bandPadding[bs.paddingSize] ?? bandPadding.standard;
  return (
    <section className={cn(bgClass, "relative isolate overflow-hidden")}>
      {isDark && (
        <>
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(50%_60%_at_80%_110%,rgba(245,158,11,0.14),transparent_60%),radial-gradient(50%_60%_at_10%_-10%,rgba(14,95,216,0.22),transparent_60%)]"
          />
          <GridMotif tone="dark" />
        </>
      )}
      <Container width={bs.width} className={cn("relative", py)}>
        <Reveal animation={bs.animationStyle} delay={bs.delayMs}>
          <div
            className={cn(
              "mx-auto",
              bs.textAlign === "center" ? "text-center" : "",
              bs.width === "narrow" ? "max-w-xl" : "max-w-2xl",
            )}
          >
            <h2 className={cn(bs.headingSizeClass, bs.headingFontClass, "font-bold text-balance")}>
              {block.heading}
            </h2>
            {block.subhead && (
              <p className={cn("text-lede mt-4", subheadColour)}>{block.subhead}</p>
            )}
            <div className={cn("flex", bs.textAlign === "center" && "justify-center")}>
              <CtaButtons
                ctas={block.ctas as Cta[] | null}
                onDark={isDark}
                className={cn("mt-9", bs.textAlign === "center" && "justify-center")}
              />
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

// --- FAQ --------------------------------------------------------------------

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
      withBorder={bs.withBorder}
      headerAnimation={bs.animationStyle}
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

// --- CalculatorEmbed (placeholder) ------------------------------------------

export function CalculatorEmbedView({ block }: { block: CalculatorEmbedBlock }) {
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
      withBorder={bs.withBorder}
      headerAnimation={bs.animationStyle}
    >
      <Reveal animation={bs.animationStyle} delay={bs.delayMs}>
        <div className="border-border bg-surface-2 relative overflow-hidden rounded-xl border p-8 md:p-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <span className="bg-brand/10 text-brand inline-flex h-11 w-11 items-center justify-center rounded-md">
                <Calculator className="h-6 w-6" aria-hidden />
              </span>
              <h2 className="text-h2 text-ink-900 mt-5 font-semibold text-balance">
                {block.heading ?? "Engineering calculators"}
              </h2>
              {block.body && <p className="text-text-soft mt-3 text-[1.0625rem]">{block.body}</p>}
            </div>
            <Button asChild variant="secondary" size="lg">
              <Link href="/tools" prefetch={false}>
                {block.ctaLabel ?? "Try the calculator"}{" "}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

// --- ContactRFQ (placeholder CTA; full server-action form lands in a later phase) ----

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
      withBorder={bs.withBorder}
      headerAnimation={bs.animationStyle}
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

// --- Spacer -----------------------------------------------------------------

export function SpacerView({ block }: { block: SpacerBlock }) {
  const h = block.size === "lg" ? "h-24" : block.size === "sm" ? "h-8" : "h-16";
  return (
    <div className={`bg-surface ${h}`}>
      {block.divider && (
        <Container>
          <hr className="border-border" />
        </Container>
      )}
    </div>
  );
}
