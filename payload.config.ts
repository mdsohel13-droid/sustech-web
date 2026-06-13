import path from "path";
import { fileURLToPath } from "url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Articles } from "./cms/collections/articles";
import { Awards } from "./cms/collections/awards";
import { JobOpenings } from "./cms/collections/job-openings";
import { Partners } from "./cms/collections/partners";
import { KnowledgeResources } from "./cms/collections/knowledge-resources";
import { Leads } from "./cms/collections/leads";
import { NewsItems } from "./cms/collections/news-items";
import { Clients } from "./cms/collections/clients";
import { Icons } from "./cms/collections/icons";
import { Media } from "./cms/collections/media";
import { Pages } from "./cms/collections/pages";
import { Products } from "./cms/collections/products";
import { Projects } from "./cms/collections/projects";
import { RfqRequests } from "./cms/collections/rfq-requests";
import { Sectors } from "./cms/collections/sectors";
import { Services } from "./cms/collections/services";
import { PipelineRuns } from "./cms/collections/pipeline-runs";
import { PublishAudit } from "./cms/collections/publish-audit";
import { Sources } from "./cms/collections/sources";
import { Team } from "./cms/collections/team";
import { Testimonials } from "./cms/collections/testimonials";
import { Users } from "./cms/collections/Users";
import { AutomationSettings } from "./cms/globals/automation-settings";
import { Navigation } from "./cms/globals/navigation";
import { NextBestActions } from "./cms/globals/next-best-actions";
import { SiteSettings } from "./cms/globals/site-settings";
import { TariffRates } from "./cms/globals/tariff-rates";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const serverURL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:4123";

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: " · Sustech CMS" },
  },
  serverURL,
  editor: lexicalEditor(),
  collections: [
    Pages,
    Projects,
    Products,
    Services,
    Sectors,
    Team,
    Testimonials,
    Clients,
    Articles,
    KnowledgeResources,
    NewsItems,
    // Company credentials & careers (pre-built; populate from the admin)
    Awards,
    Partners,
    JobOpenings,
    Media,
    Icons,
    RfqRequests,
    Leads,
    Sources,
    PipelineRuns,
    PublishAudit,
    Users,
  ],
  globals: [SiteSettings, Navigation, TariffRates, NextBestActions, AutomationSettings],
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI },
    // `push` auto-syncs the DB schema from the collection configs — on by default
    // in dev/CI. In production it stays OFF (safer): production schema changes
    // are applied as committed, reviewable SQL migrations via `pnpm migrate`
    // (see ./migrations and DB-MIGRATIONS.md). PAYLOAD_DB_PUSH=true remains as an
    // emergency escape hatch to force a one-off push, but migrations are preferred.
    push: process.env.PAYLOAD_DB_PUSH === "true" || process.env.NODE_ENV !== "production",
    migrationDir: path.resolve(dirname, "./migrations"),
  }),
  secret: (() => {
    const s = process.env.PAYLOAD_SECRET;
    if (!s) throw new Error("PAYLOAD_SECRET env var must be set");
    return s;
  })(),
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  sharp,
  cors: [serverURL],
  csrf: [serverURL],
});
