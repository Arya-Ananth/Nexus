import { useEffect, useRef } from 'react';

/**
 * Lightweight particle drift overlay — transparent canvas, additive blending.
 * Fires once, never blocks underlying pages. 600ms total.
 */
export default function TransitionScatter({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width  = W;
    canvas.height = H;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const DURATION = 650;
    const COUNT    = 650;

    // Color palette: teal, violet, white
    const palette = ['69,217,196', '181,139,255', '242,251,250', '181,139,255', '69,217,196'];

    type Particle = {
      x: number; y: number;
      vx: number; vy: number;
      size: number;
      color: string;
      startAt: number; // normalized 0–0.2 stagger
    };

    // Spawn from a loose cloud around center — NOT all from exact center
    // so it looks organic, not mechanical
    const particles: Particle[] = Array.from({ length: COUNT }, () => {
      const angle   = Math.random() * Math.PI * 2;
      // Bi-modal speed: many slow-drift, some fast fly-out
      const speed   = Math.random() < 0.4
        ? 60 + Math.random() * 180   // slow ambient drift
        : 220 + Math.random() * 700; // fast burst
      const spreadR = Math.random() * 180; // spawn radius around center

      return {
        x: W / 2 + Math.cos(angle) * spreadR * Math.random(),
        y: H / 2 + Math.sin(angle) * spreadR * Math.random(),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 0.6 + Math.random() * 2.8,
        color: palette[Math.floor(Math.random() * palette.length)],
        startAt: Math.random() * 0.22, // stagger start
      };
    });

    const start = performance.now();
    let raf: number;

    const frame = (now: number) => {
      const elapsed = now - start;
      const gt = elapsed / DURATION;

      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'screen';

      for (const p of particles) {
        if (gt < p.startAt) continue;

        const pt = Math.min((gt - p.startAt) / (1 - p.startAt), 1);
        // Ease-out cubic
        const ease = 1 - Math.pow(1 - pt, 3);

        // Opacity: fast rise (first 15%), slow fade-out
        const opacity = pt < 0.15
          ? pt / 0.15
          : 1 - (pt - 0.15) / 0.85;

        if (opacity < 0.005) continue;

        const x = p.x + p.vx * ease * (DURATION / 1000);
        const y = p.y + p.vy * ease * (DURATION / 1000);

        ctx.globalAlpha = opacity * 0.78;
        ctx.fillStyle   = `rgb(${p.color})`;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;

      if (gt < 1) {
        raf = requestAnimationFrame(frame);
      } else {
        onComplete();
      }
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1000,
        pointerEvents: 'none',
        willChange: 'transform',
      }}
    />
  );
}
