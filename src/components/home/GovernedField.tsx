import React, {type ReactNode, useEffect, useRef} from 'react';
import styles from './styles.module.css';

/**
 * GovernedField — the merged 2a "Governed Field" + 2c "Depth Atlas" hero
 * background (AAASM-4143). It is a purely decorative layer behind the hero
 * copy: three cursor-parallax orbit-ring layers (2c) with a calming center
 * vignette, overlaid by a canvas particle field (2a) whose particles are
 * governed agent requests classified ALLOWED / REVIEWED / DENIED at an
 * invisible policy boundary — a literal depiction of the policy engine and
 * the three-layer interception model.
 *
 * Rendered aria-hidden with pointer-events disabled. Honors
 * prefers-reduced-motion by drawing a single static frame and disabling
 * parallax + ring spin.
 */

type Verdict = 'allow' | 'review' | 'deny';
type Phase = 'travel' | 'held' | 'escort' | 'deflect';

interface Agent {
  x: number;
  y: number;
  vx: number;
  vy: number;
  verdict: Verdict;
  phase: Phase;
  hold: number; // frames remaining while held at the checkpoint
  blink: number;
  r: number;
  alpha: number;
}

interface Palette {
  allow: string;
  review: string;
  deny: string;
  line: string;
}

function readPalette(): Palette {
  const dark =
    typeof document !== 'undefined' &&
    document.documentElement.dataset.theme !== 'light';
  return dark
    ? {
        allow: '#2dd4bf',
        review: '#f5a623',
        deny: '#f87171',
        line: 'rgba(230, 237, 243, ',
      }
    : {
        allow: '#0d9488',
        review: '#d18616',
        deny: '#e5484d',
        line: 'rgba(27, 39, 51, ',
      };
}

function pickVerdict(): Verdict {
  const r = Math.random();
  if (r < 0.56) return 'allow';
  if (r < 0.8) return 'review';
  return 'deny';
}

export function GovernedField(): ReactNode {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const farRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const nearRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    let palette = readPalette();
    const themeObserver = new MutationObserver(() => {
      palette = readPalette();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    let width = 0;
    let height = 0;
    let dpr = 1;
    // Boundary ellipse (the reading zone) + aperture point (toward the CTA).
    let cx = 0;
    let cy = 0;
    let bx = 0;
    let by = 0;

    const COUNT = 90;
    const agents: Agent[] = [];

    function resize() {
      const rect = root!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = width * 0.5;
      cy = height * 0.46;
      bx = Math.min(width * 0.32, 470);
      by = Math.min(height * 0.32, 260);
    }

    function spawn(a: Agent) {
      // Enter from a random edge, aimed loosely inward toward the boundary.
      const edge = Math.floor(Math.random() * 4);
      if (edge === 0) {
        a.x = Math.random() * width;
        a.y = -20;
      } else if (edge === 1) {
        a.x = width + 20;
        a.y = Math.random() * height;
      } else if (edge === 2) {
        a.x = Math.random() * width;
        a.y = height + 20;
      } else {
        a.x = -20;
        a.y = Math.random() * height;
      }
      const ang = Math.atan2(cy - a.y, cx - a.x) + (Math.random() - 0.5) * 0.7;
      const speed = 0.55 + Math.random() * 0.6;
      a.vx = Math.cos(ang) * speed;
      a.vy = Math.sin(ang) * speed;
      a.verdict = pickVerdict();
      a.phase = 'travel';
      a.hold = 0;
      a.blink = 0;
      a.r = 1.4 + Math.random() * 1.8;
      a.alpha = 0;
    }

    for (let i = 0; i < COUNT; i++) {
      const a: Agent = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        verdict: 'allow',
        phase: 'travel',
        hold: 0,
        blink: 0,
        r: 2,
        alpha: 0,
      };
      spawn(a);
      // Pre-scatter so the field is populated on the first frame.
      const t = Math.random();
      a.x = a.x + (cx - a.x) * t * 0.8;
      a.y = a.y + (cy - a.y) * t * 0.8;
      a.alpha = 0.9;
      agents.push(a);
    }

    function ellipseDist(x: number, y: number): number {
      const nx = (x - cx) / bx;
      const ny = (y - cy) / by;
      return nx * nx + ny * ny;
    }

    function step(a: Agent) {
      if (a.alpha < 0.9) a.alpha = Math.min(0.9, a.alpha + 0.03);

      if (a.phase === 'travel') {
        a.x += a.vx;
        a.y += a.vy;
        if (ellipseDist(a.x, a.y) < 1) {
          if (a.verdict === 'deny') {
            // Deflect off the boundary normal.
            const nx = (2 * (a.x - cx)) / (bx * bx);
            const ny = (2 * (a.y - cy)) / (by * by);
            const len = Math.hypot(nx, ny) || 1;
            const ux = nx / len;
            const uy = ny / len;
            const dot = a.vx * ux + a.vy * uy;
            a.vx = (a.vx - 2 * dot * ux) * 1.05;
            a.vy = (a.vy - 2 * dot * uy) * 1.05;
            a.phase = 'deflect';
          } else if (a.verdict === 'review') {
            // Held at the checkpoint, then released.
            a.phase = 'held';
            a.hold = 70 + Math.floor(Math.random() * 50);
            a.vx = 0;
            a.vy = 0;
          } else {
            a.phase = 'escort';
          }
        }
      } else if (a.phase === 'held') {
        a.hold -= 1;
        a.blink += 0.22;
        if (a.hold <= 0) a.phase = 'escort';
      } else if (a.phase === 'escort') {
        // Steer toward the aperture (bottom of the boundary, aimed at the CTA).
        const ax = cx;
        const ay = cy + by * 1.25;
        const dx = ax - a.x;
        const dy = ay - a.y;
        const d = Math.hypot(dx, dy) || 1;
        const speed = 1.7;
        a.vx += (dx / d) * speed * 0.06;
        a.vy += (dy / d) * speed * 0.06;
        a.vx *= 0.97;
        a.vy *= 0.97;
        a.x += a.vx;
        a.y += a.vy;
        if (a.y > cy + by + 40) {
          a.alpha -= 0.05;
          if (a.alpha <= 0) spawn(a);
        }
      } else {
        // deflect — coast until off-screen.
        a.x += a.vx;
        a.y += a.vy;
      }

      if (a.x < -60 || a.x > width + 60 || a.y < -60 || a.y > height + 60) {
        spawn(a);
      }
    }

    function color(a: Agent): string {
      if (a.verdict === 'deny') return palette.deny;
      if (a.verdict === 'review') return palette.review;
      return palette.allow;
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);

      // Aperture marker at the bottom of the boundary (toward the CTA).
      ctx!.beginPath();
      ctx!.arc(cx, cy + by * 1.25, 3, 0, Math.PI * 2);
      ctx!.fillStyle = palette.allow;
      ctx!.globalAlpha = 0.5;
      ctx!.fill();
      ctx!.globalAlpha = 1;

      for (const a of agents) {
        let alpha = a.alpha;
        if (a.phase === 'held') {
          alpha *= 0.45 + 0.55 * Math.abs(Math.sin(a.blink));
        }
        // Escort trail toward the aperture.
        if (a.phase === 'escort') {
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(a.x - a.vx * 4, a.y - a.vy * 4);
          ctx!.strokeStyle = color(a);
          ctx!.globalAlpha = alpha * 0.35;
          ctx!.lineWidth = 1;
          ctx!.stroke();
        }
        ctx!.beginPath();
        ctx!.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx!.fillStyle = color(a);
        ctx!.globalAlpha = alpha;
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
    }

    let raf = 0;
    function frame() {
      for (const a of agents) step(a);
      draw();
      raf = requestAnimationFrame(frame);
    }

    resize();
    // Resizing the canvas clears it; under reduced-motion there is no animation
    // loop to repaint, so redraw the single static frame after each resize.
    const onResize = () => {
      resize();
      if (reduced) draw();
    };
    window.addEventListener('resize', onResize);

    if (reduced) {
      draw();
    } else {
      raf = requestAnimationFrame(frame);
    }

    // Cursor parallax across the three depth layers.
    let onMove: ((e: MouseEvent) => void) | null = null;
    if (!reduced) {
      onMove = (e: MouseEvent) => {
        const rect = root!.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        if (farRef.current)
          farRef.current.style.transform = `translate(${px * 14}px, ${py * 14}px)`;
        if (midRef.current)
          midRef.current.style.transform = `translate(${px * 30}px, ${py * 30}px)`;
        if (nearRef.current)
          nearRef.current.style.transform = `translate(${px * 52}px, ${py * 52}px)`;
      };
      window.addEventListener('mousemove', onMove);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      if (onMove) window.removeEventListener('mousemove', onMove);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.field} aria-hidden="true">
      <div ref={farRef} className={styles.plxLayer}>
        <svg
          className={styles.ringFar}
          viewBox="0 0 1600 1600"
          width="1600"
          height="1600"
        >
          <circle
            cx="800"
            cy="800"
            r="720"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="2800 340 900 483"
          />
        </svg>
        <svg
          className={styles.ringFarRev}
          viewBox="0 0 1600 1600"
          width="1600"
          height="1600"
        >
          <circle
            cx="800"
            cy="800"
            r="560"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 10"
          />
        </svg>
      </div>

      <div ref={midRef} className={styles.plxLayer}>
        <svg
          className={styles.ringMid}
          viewBox="0 0 1100 1100"
          width="1100"
          height="1100"
        >
          <circle
            cx="550"
            cy="550"
            r="470"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="900 120 500 120 900 313"
          />
        </svg>
        <span className={`${styles.node} ${styles.nodeTrack1}`}>
          <i className={styles.nodeRing} />
          <em className={styles.nodeLabel}>RESEARCH TRACK 01</em>
        </span>
        <span className={`${styles.node} ${styles.nodeTrack2}`}>
          <i className={styles.nodeRing} />
          <em className={styles.nodeLabel}>RESEARCH TRACK 02</em>
        </span>
      </div>

      <div ref={nearRef} className={styles.plxLayer}>
        <span className={`${styles.node} ${styles.nodeActive}`}>
          <i className={styles.nodeDotPulse} />
          <em className={styles.nodeLabelActive}>
            AI AGENT ASSEMBLY
            <b>IN DEVELOPMENT</b>
          </em>
        </span>
        <span className={`${styles.node} ${styles.nodeFuture}`}>
          <i className={styles.nodeDotBlink} />
          <em className={styles.nodeLabelFuture}>FUTURE SYSTEMS</em>
        </span>
      </div>

      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.vignette} />
      <div className={styles.logStrip}>
        FIELD: 90 AGENTS · BOUNDARY: ACTIVE · APERTURE: CTA
      </div>
    </div>
  );
}
