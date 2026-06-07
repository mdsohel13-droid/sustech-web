import path from "path";
import { fileURLToPath } from "url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Articles } from "./cms/collections/articles";
import { Clients } from "./cms/collections/clients";
import { Icons } from "./cms/collections/icons";
import { Media } from "./cms/collections/media";
import { Pages } from "./cms/collections/pages";
import { Products } from "./cms/collections/products";
import { Projects } from "./cms/collections/projects";
import { RfqRequests } from "./cms/collections/rfq-requests";
import { Sectors } from "./cms/collections/sectors";
import { Services } from "./cms/collections/services";
import { Team } from "./cms/collections/team";
import { Testimonials } from "./cms/collections/testimonials";
import { Users } from "./cms/collections/Users";
import { Navigation } from "./cms/globals/navigation";
import { SiteSettings } from "./cms/globals/site-settings";

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
    Media,
    Icons,
    RfqRequests,
    Users,
  ],
  globals: [SiteSettings, Navigation],
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI },
    // `push` (dev) auto-syncs the schema so no manual migrations are needed locally/CI.
    push: process.env.NODE_ENV !== "production",
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
