import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * Dynamic Open Graph image generator.
 *
 * Usage: /api/og?title=Page+Title&description=Optional+description&section=Services
 *
 * Renders a 1200×630 branded image with:
 *   - Sustech True Blue background (#0073CF)
 *   - White headline + subtitle
 *   - Accent bar in Lime Green (#32CD32)
 *   - Company name + domain in footer
 *
 * The og-default.jpg (/public/og-default.jpg) is used as the fallback for pages
 * that do not need per-page images. This endpoint is used for detail pages
 * (projects, knowledge articles, services) that benefit from a unique image.
 */
export async function GET(req: NextRequest): Promise<ImageResponse> {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? "Engineering Excellence";
  const description = searchParams.get("description") ?? "";
  const section = searchParams.get("section") ?? "";

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#0073CF",
        fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
        padding: "60px 72px",
        position: "relative",
      }}
    >
      {/* Decorative grid pattern — subtle diagonal lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 40px)",
        }}
      />

      {/* Green accent bar */}
      <div
        style={{
          width: 64,
          height: 6,
          backgroundColor: "#32CD32",
          borderRadius: 3,
          marginBottom: 32,
        }}
      />

      {/* Section label */}
      {section ? (
        <p
          style={{
            color: "rgba(255,255,255,0.65)",
            fontSize: 22,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            marginBottom: 16,
            fontWeight: 600,
          }}
        >
          {section}
        </p>
      ) : null}

      {/* Main title */}
      <h1
        style={{
          color: "#ffffff",
          fontSize: title.length > 60 ? 44 : title.length > 40 ? 52 : 62,
          fontWeight: 700,
          lineHeight: 1.15,
          flex: 1,
          margin: 0,
          // Clamp to avoid overflow
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {title}
      </h1>

      {/* Description */}
      {description ? (
        <p
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: 24,
            lineHeight: 1.5,
            marginTop: 20,
            marginBottom: 0,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {description}
        </p>
      ) : null}

      {/* Footer — company identity */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 48,
          paddingTop: 24,
          borderTop: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <span
          style={{
            color: "#ffffff",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "-0.01em",
          }}
        >
          Sustech Technology Ltd
        </span>
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 18 }}>sustechltd.com</span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
