import config from "@payload-config";
import { GRAPHQL_PLAYGROUND_GET } from "@payloadcms/next/routes";

// Disable the playground entirely in production — it exposes the full schema to
// unauthenticated visitors and is only useful for local development.
const handler = GRAPHQL_PLAYGROUND_GET(config);

export async function GET(req: Request): Promise<Response> {
  if (process.env.NODE_ENV === "production") {
    return new Response(null, { status: 404 });
  }
  return handler(req);
}
