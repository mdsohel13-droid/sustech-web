/**
 * Block component barrel — re-exports every block view from its own file.
 *
 * Each block lives in its own file (hero.tsx, stats-counters.tsx, …) for
 * independent review, tree-shaking, and focused maintenance. This barrel
 * keeps all consumer imports unchanged: `import { HeroView } from './blocks'`.
 *
 * Shared helpers (Rich, mediaUrl, objs, HoverRevealText) live in shared.tsx.
 */

export { ArticlesListView } from "./articles-list";
export { CalculatorEmbedView } from "./calculator-embed";
export { ContactRFQView } from "./contact-rfq";
export { CTABandView } from "./cta-band";
export { FAQView } from "./faq";
export { HeroView } from "./hero";
export { ImageGalleryView } from "./image-gallery";
export { LogoWallView } from "./logo-wall";
export { PartnerBarView } from "./partner-bar";
export { ProductShowcaseView } from "./product-showcase";
export { ProjectsListView } from "./projects-list";
export { RichTextView } from "./rich-text";
export { SectorTilesView } from "./sector-tiles";
export { ServicesGridView } from "./services-grid";
export { SpacerView } from "./spacer";
export { StatsCountersView } from "./stats-counters";
export { StepsView } from "./steps";
export { TeamGridView } from "./team-grid";
export { TestimonialsView } from "./testimonials";
