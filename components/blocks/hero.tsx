import { Eyebrow } from "@/components/ui/eyebrow";
import { GridMotif } from "@/components/ui/grid-motif";
import { Container } from "@/components/ui/container";
import type { HeroBlock } from "@/payload-types";
import { mediaUrl, type Cta, CtaButtons } from "./shared";

export function HeroView({ block, isFirst }: { block: HeroBlock; isFirst: boolean }) {
  const dark = block.tone !== "light";
  const bg = mediaUrl(block.backgroundImage);
  const video = mediaUrl(block.backgroundVideo);
  const Heading = isFirst ? "h1" : "h2";
  return (
    <section
      className={
        dark
          ? "bg-ink-900 text-text-invert relative isolate overflow-hidden"
          : "bg-surface text-text relative isolate overflow-hidden"
      }
    >
      {dark && (
        <>
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(60%_55%_at_18%_-5%,rgba(14,95,216,0.28),transparent_60%),radial-gradient(45%_40%_at_92%_8%,rgba(245,158,11,0.12),transparent_55%)]"
          />
          <GridMotif tone="dark" />
        </>
      )}
      {video ? (
        // Autoplay-muted-loop video. The image is the poster — it paints instantly (LCP-safe)
        // and stays visible if the video is blocked, slow, or motion is reduced.
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
      <Container className="relative py-24 md:py-32 lg:py-40">
        <div className="max-w-3xl">
          {block.eyebrow && (
            <Eyebrow onDark={dark} className="hero-rise [animation-delay:0ms]">
              {block.eyebrow}
            </Eyebrow>
          )}
          <Heading className="text-display mt-4 font-bold text-balance">{block.heading}</Heading>
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
      </Container>
    </section>
  );
}
