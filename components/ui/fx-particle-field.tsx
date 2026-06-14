"use client";

/**
 * ParticleField — rising "embers" particle background (brand-tuned).
 *
 * Adapted from the ParticleHero reference (particle layer only — the demo's
 * gold-mode/spotlight/heading chrome is dropped). Soft blue-white motes drift
 * upward and fade, over the hero's existing ink gradient.
 *
 * Hero "Background effect" → Particle field. Safety rails match ShaderBackground:
 * reduced-motion → nothing; scoped to its container; DPR capped; rAF + listeners
 * cleaned up on unmount; decorative (aria-hidden, pointer-events-none).
 */
import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  speed: number;
  opacity: number;
  fadeStart: number;
  fadingOut: boolean;
}

const DPR_CAP = 1.5;

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let rafId = 0;

    const reset = (p: Particle, h: number) => {
      p.x = Math.random() * canvas.width;
      p.y = Math.random() * h;
      p.speed = (Math.random() / 5 + 0.1) * (canvas.height / 700);
      p.opacity = 1;
      p.fadeStart = performance.now() + Math.random() * 4000 + 800;
      p.fadingOut = false;
    };

    const init = () => {
      const count = Math.min(260, Math.floor((canvas.width * canvas.height) / 7000));
      particles = [];
      for (let i = 0; i < count; i += 1) {
        const p: Particle = { x: 0, y: 0, speed: 0, opacity: 1, fadeStart: 0, fadingOut: false };
        reset(p, canvas.height);
        particles.push(p);
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      canvas.width = Math.max(1, Math.round(canvas.offsetWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.offsetHeight * dpr));
      init();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const render = () => {
      const now = performance.now();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.y -= p.speed;
        if (p.y < 0) reset(p, canvas.height);
        if (!p.fadingOut && now > p.fadeStart) p.fadingOut = true;
        if (p.fadingOut) {
          p.opacity -= 0.008;
          if (p.opacity <= 0) reset(p, canvas.height);
        }
        // Brand blue-white mote.
        ctx.fillStyle = `rgba(${150 + Math.random() * 60}, ${200 + Math.random() * 40}, 255, ${p.opacity})`;
        ctx.fillRect(p.x, p.y, 0.7, Math.random() * 2.4 + 1);
      }
      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full motion-reduce:hidden"
    />
  );
}
