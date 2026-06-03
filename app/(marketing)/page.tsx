import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { CtaBand } from "@/components/sections/cta-band";
import { FeaturedProjects } from "@/components/sections/featured-projects";
import { Hero } from "@/components/sections/hero";
import { HowWeWork } from "@/components/sections/how-we-work";
import { LogoWall } from "@/components/sections/logo-wall";
import { ProofBar } from "@/components/sections/proof-bar";
import { Solutions } from "@/components/sections/solutions";
import { Testimonials } from "@/components/sections/testimonials";
import { ToolsTeaser } from "@/components/sections/tools-teaser";
import { WhatWeDo } from "@/components/sections/what-we-do";
import { WhySustech } from "@/components/sections/why-sustech";
import { homeJsonLd } from "@/lib/schema";

const title = "Sustech Technology Ltd — Industrial Solar, Electrical EPC & Safety Engineering";
const description =
  "Single-point EPC for commercial and industrial clients in Bangladesh: solar plants, " +
  "substations, lightning protection and smart electrical systems, engineered to IEC, BNBC " +
  "and NFPA standards.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description, url: "/" },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={homeJsonLd()} />
      <Hero />
      <ProofBar />
      <WhatWeDo />
      <Solutions />
      <FeaturedProjects />
      <WhySustech />
      <HowWeWork />
      <LogoWall />
      <ToolsTeaser />
      <Testimonials />
      <CtaBand />
    </>
  );
}
