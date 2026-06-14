"use client";

/**
 * HeroFx — lazy mount for the Hero block's animated background effect.
 *
 * next/dynamic with ssr:false keeps each effect's bundle out of the initial
 * payload and the server render — the SSR HTML carries only this wrapper div,
 * so LCP/crawlability are untouched and the static hero gradient shows until
 * (and unless) the effect paints. Each effect is itself reduced-motion- and
 * capability-guarded.
 */
import dynamic from "next/dynamic";

export type HeroFxType = "aurora" | "particles" | "retro" | "tracing";

const Aurora = dynamic(
  () => import("@/components/ui/shader-background").then((m) => m.ShaderBackground),
  { ssr: false },
);
const Particles = dynamic(
  () => import("@/components/ui/fx-particle-field").then((m) => m.ParticleField),
  { ssr: false },
);
const Retro = dynamic(() => import("@/components/ui/fx-retro-grid").then((m) => m.RetroGrid), {
  ssr: false,
});
const Tracing = dynamic(
  () => import("@/components/ui/fx-gradient-tracing").then((m) => m.GradientTracing),
  { ssr: false },
);

export function HeroFx({ fx }: { fx: HeroFxType }) {
  return (
    <div data-fx={fx} aria-hidden className="absolute inset-0 overflow-hidden">
      {fx === "aurora" && <Aurora />}
      {fx === "particles" && <Particles />}
      {fx === "retro" && <Retro />}
      {fx === "tracing" && <Tracing />}
    </div>
  );
}
