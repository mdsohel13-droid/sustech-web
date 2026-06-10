"use client";

/**
 * HeroFx — lazy mount for the Hero block's animated background effect.
 *
 * next/dynamic with ssr:false keeps the WebGL bundle out of the initial
 * payload and out of the server render entirely — the SSR HTML carries only
 * this wrapper div, so LCP/crawlability are untouched. The static hero
 * gradient stays visible until (and unless) the canvas paints.
 */
import dynamic from "next/dynamic";

const ShaderBackground = dynamic(
  () => import("@/components/ui/shader-background").then((m) => m.ShaderBackground),
  { ssr: false },
);

export function HeroFx({ fx }: { fx: "aurora" }) {
  return (
    <div data-fx={fx} aria-hidden className="absolute inset-0 overflow-hidden">
      <ShaderBackground />
    </div>
  );
}
