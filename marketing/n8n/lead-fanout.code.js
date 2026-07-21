// n8n "Lead → ERP + GrowthOS" — single Code node, verify once, fan out to both.
// Replace the existing Verify+Forward Code node body in the "Lead to ERP"
// workflow with this. The web tier posts the HMAC-signed lead ONCE to this
// webhook; n8n distributes it to the ERP (system of record) AND GrowthOS
// (nurture/outbound). Both get the full verified lead.
//
// n8n env: NODE_FUNCTION_ALLOW_BUILTIN must include  crypto,http,https
// Set these n8n variables (or paste literals below):
//   LEAD_FORWARD_SECRET   — same secret the website signs with
//   ERP_LEAD_INGEST_URL   — e.g. http://127.0.0.1:3010/api/leads/from-web
//   ERP_WEB_INGEST_KEY    — ERP Bearer token
//   GROWTHOS_LEADS_URL    — https://growth.sustechltd.com/api/v1/public/leads
//   GROWTHOS_API_KEY      — optional, only if GrowthOS needs auth

const crypto = require("crypto");
const http = require("http");
const https = require("https");

const SECRET = $env.LEAD_FORWARD_SECRET || "PASTE_LEAD_FORWARD_SECRET";
const ERP_URL = $env.ERP_LEAD_INGEST_URL || "http://127.0.0.1:3010/api/leads/from-web";
const ERP_KEY = $env.ERP_WEB_INGEST_KEY || "PASTE_ERP_BEARER";
const GROWTH_URL = $env.GROWTHOS_LEADS_URL || "https://growth.sustechltd.com/api/v1/public/leads";
const GROWTH_KEY = $env.GROWTHOS_API_KEY || "";

// 1) Verify the website HMAC over the RAW body (never re-stringify before checking).
const item = $input.first();
const raw =
  item.binary && item.binary.data
    ? Buffer.from(item.binary.data.data, "base64").toString("utf8")
    : item.json.rawBody || JSON.stringify(item.json.body || item.json);
const headers = item.json.headers || {};
const sig = headers["x-signature"] || headers["X-Signature"] || "";
const expected = crypto.createHmac("sha256", SECRET).update(raw).digest("hex");
const a = Buffer.from(sig);
const b = Buffer.from(expected);
if (!(a.length === b.length && crypto.timingSafeEqual(a, b))) {
  throw new Error("Invalid X-Signature"); // rejects forged/replayed posts
}
const lead = JSON.parse(raw);

// Tiny POST helper — picks http/https by URL, never throws (best-effort sink).
function post(url, body, extraHeaders) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const lib = u.protocol === "https:" ? https : http;
    const data = Buffer.from(JSON.stringify(body));
    const req = lib.request(
      {
        hostname: u.hostname,
        port: u.port || (u.protocol === "https:" ? 443 : 80),
        path: u.pathname + u.search,
        method: "POST",
        headers: Object.assign(
          { "Content-Type": "application/json", "Content-Length": data.length },
          extraHeaders || {},
        ),
        timeout: 8000,
      },
      (res) => {
        let buf = "";
        res.on("data", (d) => (buf += d));
        res.on("end", () => resolve({ status: res.statusCode, body: buf.slice(0, 200) }));
      },
    );
    req.on("error", (e) => resolve({ status: 0, error: String(e) }));
    req.on("timeout", () => {
      req.destroy();
      resolve({ status: 0, error: "timeout" });
    });
    req.write(data);
    req.end();
  });
}

// 2) Fan out — ERP + GrowthOS in parallel, both get the full verified lead.
const [erp, growth] = await Promise.all([
  post(ERP_URL, lead, ERP_KEY ? { Authorization: `Bearer ${ERP_KEY}` } : {}),
  post(GROWTH_URL, lead, GROWTH_KEY ? { Authorization: `Bearer ${GROWTH_KEY}` } : {}),
]);

// Surfaces both statuses in the execution log for debugging.
return [{ json: { ok: true, erp: erp.status, growth: growth.status } }];
