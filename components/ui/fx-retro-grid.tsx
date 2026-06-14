"use client";

/**
 * RetroGrid — perspective "engineering grid" flying toward the horizon.
 *
 * Adapted from the RetroGrid reference, brand-tuned: the neon-magenta synthwave
 * grid becomes True Blue over the ink horizon, so it reads as a technical CAD
 * sweep rather than 80s retro. Hero "Background effect" → Engineering grid.
 *
 * Safety rails match ShaderBackground: reduced-motion → nothing; scoped to its
 * container; DPR capped; rAF cleaned up; decorative (aria-hidden, no pointer).
 */
import { useEffect, useRef } from "react";

const DPR_CAP = 1.5;
// True Blue #0073CF
const GRID_RGB = { r: 0, g: 115, b: 207 };

export function RetroGrid() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cellWidth = 120;
    const cellDepth = 80;
    const numCellsWide = 16;
    const numCellsDeep = 20;
    const cameraY = 60;
    const cameraZ = 400;
    const focalLength = 500;
    const speed = 1.5;
    let offset = 0;
    let rafId = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      canvas.width = Math.max(1, Math.round(canvas.offsetWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.offsetHeight * dpr));
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const project = (x: number, y: number, z: number) => {
      const relZ = z - cameraZ;
      if (relZ <= 10) return null;
      const scale = focalLength / relZ;
      return {
        x: canvas.width / 2 + x * scale,
        y: canvas.height * 0.5 - (y - cameraY) * scale,
      };
    };

    const drawCell = (x: number, z: number, zOffset: number) => {
      const actualZ = z - zOffset;
      if (actualZ < 0 || actualZ > numCellsDeep * cellDepth) return;
      const tl = project(x - cellWidth / 2, 0, actualZ);
      const tr = project(x + cellWidth / 2, 0, actualZ);
      const bl = project(x - cellWidth / 2, 0, actualZ + cellDepth);
      const br = project(x + cellWidth / 2, 0, actualZ + cellDepth);
      if (!tl || !tr || !bl || !br) return;
      const dist = Math.min(1, actualZ / (numCellsDeep * cellDepth));
      ctx.globalAlpha = Math.max(0.18, 1 - dist * 0.8);
      ctx.lineWidth = Math.max(1, 2 * (1 - dist * 0.5));
      ctx.strokeStyle = `rgb(${GRID_RGB.r}, ${GRID_RGB.g}, ${GRID_RGB.b})`;
      ctx.shadowBlur = 8 * (1 - dist);
      ctx.shadowColor = ctx.strokeStyle;
      ctx.beginPath();
      ctx.moveTo(bl.x, bl.y);
      ctx.lineTo(br.x, br.y);
      ctx.lineTo(tr.x, tr.y);
      ctx.lineTo(tl.x, tl.y);
      ctx.closePath();
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    };

    const render = () => {
      const { r, g, b } = GRID_RGB;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Ink sky → deep-blue horizon.
      const sky = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.55);
      sky.addColorStop(0, "rgba(7,12,22,1)");
      sky.addColorStop(1, `rgba(${r * 0.18}, ${g * 0.22}, ${b * 0.32}, 1)`);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, canvas.width, canvas.height * 0.55);
      const ground = ctx.createLinearGradient(0, canvas.height * 0.55, 0, canvas.height);
      ground.addColorStop(0, `rgba(${r * 0.1}, ${g * 0.12}, ${b * 0.18}, 1)`);
      ground.addColorStop(1, "rgba(7,12,22,1)");
      ctx.fillStyle = ground;
      ctx.fillRect(0, canvas.height * 0.55, canvas.width, canvas.height * 0.45);

      offset = (offset + speed) % cellDepth;
      for (let row = -5; row < numCellsDeep + 5; row += 1) {
        for (let col = -numCellsWide / 2; col <= numCellsWide / 2; col += 1) {
          drawCell(col * cellWidth, row * cellDepth, offset);
        }
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
