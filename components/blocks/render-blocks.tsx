import type { Page } from "@/payload-types";
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
  ProjectsListView,
  RichTextView,
  SectorTilesView,
  ServicesGridView,
  SpacerView,
  StatsCountersView,
  StepsView,
  TeamGridView,
  TestimonialsView,
} from "./blocks";

type Block = NonNullable<Page["layout"]>[number];

function BlockSwitch({ block, index }: { block: Block; index: number }) {
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
    case "logoWall":
      return <LogoWallView block={block} />;
    case "partnerBar":
      return <PartnerBarView block={block} />;
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

export function RenderBlocks({ blocks }: { blocks?: Page["layout"] | null }) {
  if (!blocks?.length) return null;
  return (
    <>
      {blocks.map((block, i) => (
        <BlockSwitch key={block.id ?? i} block={block} index={i} />
      ))}
    </>
  );
}
