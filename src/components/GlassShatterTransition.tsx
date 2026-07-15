import { useEffect, useRef } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Pt { x: number; y: number }

interface Shard {
  a: Pt; b: Pt; c: Pt;          // triangle vertices
  cx: number; cy: number;        // centroid
  vx: number; vy: number;        // outward velocity (px/s)
  spin: number;                  // rotation speed (rad/s)
  delay: number;                 // stagger delay 0–1 normalised
  fill1: string;                 // gradient start color
  fill2: string;                 // gradient end color
}

// ─── Jittered grid → triangle shards ─────────────────────────────────────────
function buildShards(W: number, H: number, cols = 11, rows = 7): Shard[] {
  // Build a jittered point grid
  const grid: Pt[][] = [];
  for (let r = 0; r <= rows; r++) {
    grid.push([]);
    for (let c = 0; c <= cols; c++) {
      const edge = r === 0 || r === rows || c === 0 || c === cols;
      const jx = edge ? 0 : (Math.random() - 0.5) * (W / cols) * 0.55;
      const jy = edge ? 0 : (Math.random() - 0.5) * (H / rows) * 0.55;
      grid[r].push({ x: (c / cols) * W + jx, y: (r / rows) * H + jy });
    }
  }

  const shards: Shard[] = [];
  const ocx = W / 2;
  const ocy = H / 2;

  const palette: [string, string][] = [
    ['rgba(69,217,196,0.30)', 'rgba(69,217,196,0.06)'],
    ['rgba(181,139,255,0.25)', 'rgba(181,139,255,0.05)'],
    ['rgba(242,251,250,0.20)', 'rgba(69,217,196,0.08)'],
    ['rgba(255,255,255,0.18)', 'rgba(181,139,255,0.06)'],
    ['rgba(181,139,255,0.15)', 'rgba(69,217,196,0.10)'],
  ];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Each cell → 2 triangles
      const quads: [Pt, Pt, Pt][] = [
        [grid[r][c], grid[r][c + 1], grid[r + 1][c + 1]],
        [grid[r][c], grid[r + 1][c + 1], grid[r + 1][c]],
      ];

      for (const [a, b, cc] of quads) {
        const cx = (a.x + b.x + cc.x) / 3;
        const cy = (a.y + b.y + cc.y) / 3;

        // Direction from screen center outward
        let dx = cx - ocx;
        let dy = cy - ocy;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        dx /= len; dy /= len;

        // Speed scales with distance from center (outer shards fly faster)
        const distNorm = len / Math.sqrt(ocx * ocx + ocy * ocy);
        const speed = 400 + distNorm * 900 + Math.random() * 300;

        const [fill1, fill2] = palette[Math.floor(Math.random() * palette.length)];

        shards.push({
          a, b, c: cc,
          cx, cy,
          vx: dx * speed,
          vy: dy * speed,
          spin: (Math.random() - 0.5) * 6,
          delay: Math.random() * 0.18,
          fill1, fill2,
        });
      }
    }
  }
  return shards;
}

// ─── Easing ───────────────────────────────────────────────────────────────────
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

// ─── Component ────────────────────────────────────────────────────────────────
export default function GlassShatterTransition({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const shards = buildShards(W, H);
    const TOTAL   = 850;   // ms – total shard animation
    const FLASH   = 160;   // ms – core flash duration
    const start   = performance.now();
    let raf: number;

    const frame = (now: number) => {
      const elapsed = now - start;
      const gt = Math.min(elapsed / TOTAL, 1);

      ctx.clearRect(0, 0, W, H);

      // ── 1. Core radial flash (screen composite) ───────────────────────────
      if (elapsed < FLASH) {
        const ft = elapsed / FLASH;                        // 0→1 over FLASH ms
        const radius = 30 + ft * Math.max(W, H) * 1.4;
        const g = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, radius);
        g.addColorStop(0,    `rgba(255,255,255,${(1-ft)*0.98})`);
        g.addColorStop(0.08, `rgba(200,255,250,${(1-ft)*0.92})`);
        g.addColorStop(0.25, `rgba(69,217,196,${(1-ft)*0.75})`);
        g.addColorStop(0.55, `rgba(181,139,255,${(1-ft)*0.40})`);
        g.addColorStop(1,    'rgba(0,0,0,0)');
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'source-over';
      }

      // ── 2. Shatter shards ─────────────────────────────────────────────────
      for (const s of shards) {
        const shardStart = s.delay * TOTAL;
        const se = Math.max(0, elapsed - shardStart);
        const st = Math.min(se / TOTAL, 1);
        const ease = easeOutCubic(st);
        const opacity = Math.max(0, 1 - easeOutQuart(st) * 1.15);
        if (opacity < 0.005) continue;

        const tx = s.vx * ease;
        const ty = s.vy * ease;
        const rot = s.spin * ease * Math.PI;
        const sc  = 1 + ease * 0.22;   // slight scale-up as they fly

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.translate(s.cx + tx, s.cy + ty);
        ctx.rotate(rot);
        ctx.scale(sc, sc);

        // Vertex positions relative to centroid
        const ax = s.a.x - s.cx, ay = s.a.y - s.cy;
        const bx = s.b.x - s.cx, by = s.b.y - s.cy;
        const ccx = s.c.x - s.cx, ccy = s.c.y - s.cy;

        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.lineTo(ccx, ccy);
        ctx.closePath();

        // ── Glassmorphism fill: gradient + subtle inner glow ──
        const grad = ctx.createLinearGradient(ax, ay, ccx, ccy);
        grad.addColorStop(0, s.fill1);
        grad.addColorStop(1, s.fill2);
        ctx.fillStyle = grad;
        ctx.fill();

        // ── Thin frosted-glass border (all edges) ────────────
        ctx.strokeStyle = `rgba(255,255,255,${0.28 * opacity})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();

        // ── Bright specular highlight – first edge ────────────
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.strokeStyle = `rgba(255,255,255,${0.72 * opacity})`;
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // ── Inner radial glow at centroid (small) ────────────
        const innerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 30);
        innerGlow.addColorStop(0, `rgba(255,255,255,${0.12 * opacity})`);
        innerGlow.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = innerGlow;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.lineTo(ccx, ccy);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

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
        zIndex: 9999,
        pointerEvents: 'none',
        willChange: 'transform',
      }}
    />
  );
}
