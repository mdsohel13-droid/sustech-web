import { Fragment } from "react";
import type { Page } from "@/payload-types";
import { gapBelowClass, type GapBelow } from "@/lib/block-styles";
import {
  ArticlesListView,
  CalculatorEmbedView,
  CTABandView,
  ContactRFQView,
  FAQView,
  HeroView,
  ImageGalleryView,
  LogoWallView,
  PartnerBarView,
  PhotoStripView,
  ProductShowcaseView,
  ProjectsListView,
  RichTextView,
  SectorTilesView,
  ServicesGridView,
  SpacerView,
  StatsCountersView,
  StepsView,
  TeamGridView,
  TestimonialsView,
  VideoShowcaseView,
} from "./blocks";

type Block = NonNullable<Page["layout"]>[number];
// Extended to cover newly-added block types before payload-types.ts is regenerated.
type AnyBlock = Block | { blockType: "photoStrip"; [k: string]: unknown };

function BlockSwitch({ block, index }: { block: AnyBlock; index: number }) {
  switch (block.blockType) {
    case "hero":
      return <HeroView block={block} isFirst={index === 0} />;
    case "richText":
      return <RichTextView block={block} />;
    case "statsCounters":
      return <StatsCountersView block={block} />;
    case "servicesGrid":
      return <ServicesGridView block={block} />;
    case "sectorTiles":
      return <SectorTilesView block={block} />;
    case "projectsList":
      return <ProjectsListView block={block} />;
    case "imageGallery":
      return <ImageGalleryView block={block} />;
    case "photoStrip":
      return <PhotoStripView block={block as Parameters<typeof PhotoStripView>[0]["block"]} />;
    case "videoShowcase":
      return <VideoShowcaseView block={block} />;
    case "logoWall":
      return <LogoWallView block={block} />;
    case "partnerBar":
      return <PartnerBarView block={block} />;
    case "productShowcase":
      return <ProductShowcaseView block={block} />;
    case "articlesList":
      return <ArticlesListView block={block} />;
    case "testimonials":
      return <TestimonialsView block={block} />;
    case "teamGrid":
      return <TeamGridView block={block} />;
    case "steps":
      return <StepsView block={block} />;
    case "ctaBand":
      return <CTABandView block={block} />;
    case "faq":
      return <FAQView block={block} />;
    case "calculatorEmbed":
      return <CalculatorEmbedView block={block} />;
    case "contactRFQ":
      return <ContactRFQView block={block} />;
    case "spacer":
      return <SpacerView block={block} />;
    default:
      return null;
  }
}

const GAP_KEYS: readonly GapBelow[] = ["none", "small", "default", "large"];

/** Resolve the admin-set gap-below class for a block without re-resolving full style. */
function gapClassFor(block: AnyBlock): string {
  const g = (block as { style?: { gapBelow?: string | null } }).style?.gapBelow;
  const key = GAP_KEYS.includes(g as GapBelow) ? (g as GapBelow) : "default";
  return gapBelowClass[key];
}

export function RenderBlocks({ blocks }: { blocks?: Page["layout"] | null }) {
  if (!blocks?.length) return null;
  return (
    <>
      {(blocks as AnyBlock[]).map((block, i) => {
        const gap = gapClassFor(block);
        const key = (block as { id?: string }).id ?? i;
        const view = <BlockSwitch block={block} index={i} />;
        // Only introduce a wrapper when a non-default gap is requested, to avoid
        // changing the layout of existing content.
        return gap ? (
          <div key={key} className={gap}>
            {view}
          </div>
        ) : (
          <Fragment key={key}>{view}</Fragment>
        );
      })}
    </>
  );
}
