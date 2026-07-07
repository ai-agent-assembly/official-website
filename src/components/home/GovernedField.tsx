import React, {type ReactNode, useEffect, useRef} from 'react';
import styles from './styles.module.css';

/**
 * GovernedField — the hero background for AAASM-4143. A purely decorative layer
 * behind the hero copy that renders the product's real three-layer interception
 * model as a **concentric governance membrane**:
 *
 *   AGENT (center) → SDK ring → PROXY ring → eBPF ring → OUTSIDE (LLM / APIs)
 *
 * Requests are emitted from the central agent core and travel radially outward.
 * At each ring boundary the request's fate is decided: ALLOWED requests pass
 * through all three rings into the external zone; DENIED requests are absorbed
 * with a flash + a short reason label at the ring they violate and never reach
 * outside; requests that carry a secret have that secret stripped (redacted) at
 * the PROXY ring — the amber secret dot detaches and dissolves while the
 * sanitized request continues outward. Small ephemeral mono labels announce
 * what each layer did (PERMISSION DENIED / EGRESS BLOCKED / SYSCALL BLOCKED /
 * SECRET REDACTED / ALLOWED). The point: only allowed, sanitized requests ever
 * cross the outer ring — secrets never leak outward.
 *
 * Rendered aria-hidden with pointer-events disabled (via styles.field). Honors
 * prefers-reduced-motion by drawing a single static frame — the core, three
 * labeled rings, a few particles mid-flight, the external nodes, and a couple
 * example event labels — with no animation loop and no cursor parallax. Theme
 * palette (light/dark) is tracked live via a MutationObserver, and ring/label
 * opacity is raised in the light theme so the structure reads on white.
 */

type Verdict = 'allow' | 'review' | 'deny';

interface Particle {
  angle: number; // radial direction of travel
  radius: number; // distance from the agent core
  speed: number;
  verdict: Verdict; // allow (teal) | review (secret carrier) | deny (red)
  denyR: number; // ring radius at which a denied request is absorbed
  secret: boolean; // review request still carrying its secret dot
  blocked: boolean; // absorbed at a ring — dissolving in place
  life: number; // dissolve countdown once blocked
  alpha: number;
  size: number;
}

interface Flash {
  radius: number; // ring the flash sits on
  angle: number;
  life: number;
  maxLife: number;
  color: string;
}

interface Secret {
  radius: number; // where the secret detached (the PROXY ring)
  angle: number;
  life: number;
  maxLife: number;
}

interface EventLabel {
  angle: number;
  radius: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

interface LabelOptions {
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  size: number;
  align: CanvasTextAlign;
  bold?: boolean;
}

interface Palette {
  allow: string;
  review: string;
  deny: string;
  line: string; // "rgba(r, g, b, " — caller appends alpha + ")"
  halo: string; // background-colored "rgba(r, g, b, " for text halos
  dark: boolean;
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
        halo: 'rgba(13, 17, 23, ',
        dark: true,
      }
    : {
        allow: '#0d9488',
        review: '#c2410c',
        deny: '#dc2626',
        line: 'rgba(24, 34, 45, ',
        halo: 'rgba(255, 255, 255, ',
        dark: false,
      };
}

function pickVerdict(): Verdict {
  const r = Math.random(); // NOSONAR - safe: visual particle animation only, not security-sensitive
  if (r < 0.54) return 'allow';
  if (r < 0.76) return 'review';
  return 'deny';
}

export function GovernedField(): ReactNode {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

    const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';
    // Ray (upper-right) along which the ring labels + OUTSIDE cue are stacked,
    // so the "cross-section" reads AGENT → SDK → PROXY → eBPF → OUTSIDE away
    // from the centered hero text.
    const LABEL_ANGLE = -Math.PI * 0.3;
    const MAX_LABELS = 6;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let cx = 0;
    let cy = 0;
    const r0 = 18; // agent core radius (emission origin)
    let r1 = 0; // SDK ring
    let r2 = 0; // PROXY ring
    let r3 = 0; // eBPF ring
    let diag = 0;

    const COUNT = 34;
    const particles: Particle[] = [];
    const flashes: Flash[] = [];
    const secrets: Secret[] = [];
    const labels: EventLabel[] = [];

    // Animation-only state.
    let rot = 0;
    let t = 0;
    let parX = 0;
    let parY = 0;
    let tParX = 0;
    let tParY = 0;

    function lineColor(a: number): string {
      return palette.line + a + ')';
    }

    function verdictColor(v: Verdict): string {
      if (v === 'deny') return palette.deny;
      return palette.allow; // allowed + sanitized review carriers travel teal
    }

    function denyReason(denyR: number): string {
      if (denyR === r1) return 'PERMISSION DENIED';
      if (denyR === r2) return 'EGRESS BLOCKED';
      return 'SYSCALL BLOCKED';
    }

    function pushLabel(
      text: string,
      angle: number,
      radius: number,
      color: string,
      life: number,
    ) {
      if (labels.length >= MAX_LABELS) labels.shift();
      labels.push({angle, radius, text, color, life, maxLife: life});
    }

    // Text with a background-colored halo so it stays legible in both themes.
    function label(opts: LabelOptions) {
      const {text, x, y, color, alpha, size, align, bold = false} = opts;
      ctx!.font = `${bold ? 'bold ' : ''}${size}px ${MONO}`;
      ctx!.textAlign = align;
      ctx!.textBaseline = 'middle';
      ctx!.globalAlpha = alpha;
      ctx!.lineJoin = 'round';
      ctx!.lineWidth = 3;
      ctx!.strokeStyle = palette.halo + '0.82)';
      ctx!.strokeText(text, x, y);
      ctx!.fillStyle = color;
      ctx!.fillText(text, x, y);
      ctx!.globalAlpha = 1;
    }

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
      const maxR = Math.min(width * 0.46, height * 0.66, 540);
      r3 = maxR;
      r2 = maxR * 0.68;
      r1 = maxR * 0.4;
      diag = Math.hypot(width, height);
    }

    function respawn(p: Particle) {
      p.angle = Math.random() * Math.PI * 2; // NOSONAR - safe: visual particle animation only, not security-sensitive
      p.radius = r0 + Math.random() * 6; // NOSONAR - safe: visual particle animation only, not security-sensitive
      p.speed = 0.55 + Math.random() * 0.7; // NOSONAR - safe: visual particle animation only, not security-sensitive
      p.verdict = pickVerdict();
      // Denied requests are caught at one of the three rings.
      p.denyR = [r1, r2, r3][Math.floor(Math.random() * 3)]; // NOSONAR - safe: visual particle animation only, not security-sensitive
      p.secret = p.verdict === 'review';
      p.blocked = false;
      p.life = 0;
      p.alpha = 0;
      p.size = 1.6 + Math.random() * 1.5; // NOSONAR - safe: visual particle animation only, not security-sensitive
    }

    function step(p: Particle) {
      if (p.alpha < 1) p.alpha = Math.min(1, p.alpha + 0.04);

      if (p.blocked) {
        p.life -= 1;
        p.alpha -= 0.05;
        p.size *= 0.98;
        if (p.life <= 0 || p.alpha <= 0) respawn(p);
        return;
      }

      const prevR = p.radius;
      p.radius += p.speed;

      // Secret scanned + stripped at the PROXY ring — detaches and dissolves.
      if (p.verdict === 'review' && p.secret && p.radius >= r2) {
        p.secret = false;
        secrets.push({radius: r2, angle: p.angle, life: 34, maxLife: 34});
        flashes.push({
          radius: r2,
          angle: p.angle,
          life: 20,
          maxLife: 20,
          color: palette.review,
        });
        pushLabel('SECRET REDACTED', p.angle, r2, palette.review, 52);
        return;
      }

      // Denied request absorbed at the ring it violates — never passes.
      if (p.verdict === 'deny' && p.radius >= p.denyR) {
        p.radius = p.denyR;
        p.blocked = true;
        p.life = 24;
        flashes.push({
          radius: p.denyR,
          angle: p.angle,
          life: 22,
          maxLife: 22,
          color: palette.deny,
        });
        pushLabel(denyReason(p.denyR), p.angle, p.denyR, palette.deny, 50);
        return;
      }

      // An allowed / sanitized request crossing the outer ring into the world.
      if (prevR < r3 && p.radius >= r3 && Math.random() < 0.14) {
        // NOSONAR - safe: visual particle animation only
        // NOSONAR - safe: visual particle animation only, not security-sensitive
        pushLabel('ALLOWED', p.angle, r3, palette.allow, 46);
      }

      // Fully out into the external zone — recycle.
      if (p.radius > diag) respawn(p);
    }

    function buildStatic() {
      // A curated, motionless cross-section for prefers-reduced-motion: an
      // allowed request outside, one mid-flight, a request denied at two rings,
      // a review carrier past PROXY with its secret dissolving, plus a couple of
      // example event labels.
      particles.length = 0;
      flashes.length = 0;
      secrets.length = 0;
      labels.length = 0;
      const mk = (
        angle: number,
        radius: number,
        verdict: Verdict,
        secret: boolean,
        blocked: boolean,
        denyR: number,
      ): Particle => ({
        angle,
        radius,
        speed: 0,
        verdict,
        denyR,
        secret,
        blocked,
        life: blocked ? 12 : 0,
        alpha: 1,
        size: 2.6,
      });
      particles.push(
        mk(-0.5, r3 * 1.14, 'allow', false, false, r3), // outside
        mk(1.1, r1 * 1.2, 'allow', false, false, r3), // mid-flight
        mk(2.4, r1, 'deny', false, true, r1), // denied at SDK
        mk(3.7, r3, 'deny', false, true, r3), // denied at eBPF
        mk(5.2, r2 * 1.28, 'review', false, false, r3), // sanitized
        mk(0.4, r1 * 1.15, 'review', true, false, r3), // has secret
      );
      flashes.push(
        {radius: r1, angle: 2.4, life: 16, maxLife: 22, color: palette.deny},
        {radius: r3, angle: 3.7, life: 16, maxLife: 22, color: palette.deny},
        {radius: r2, angle: 5.2, life: 14, maxLife: 20, color: palette.review},
      );
      secrets.push({radius: r2, angle: 5.2, life: 20, maxLife: 34});
      pushLabel('PERMISSION DENIED', 2.4, r1, palette.deny, 50);
      pushLabel('SECRET REDACTED', 5.2, r2, palette.review, 50);
      pushLabel('ALLOWED', -0.5, r3, palette.allow, 46);
    }

    function drawRing(
      r: number,
      rotation: number,
      dash: number[],
      lw: number,
      alpha: number,
    ): void {
      const ecx = cx + parX;
      const ecy = cy + parY;
      // Continuous faint membrane so each layer reads even between dashes.
      ctx!.beginPath();
      ctx!.setLineDash([]);
      ctx!.arc(ecx, ecy, r, 0, Math.PI * 2);
      ctx!.strokeStyle = lineColor(alpha * 0.5);
      ctx!.lineWidth = Math.max(1, lw * 0.7);
      ctx!.stroke();
      // Slow rotating dashed emphasis on top.
      ctx!.save();
      ctx!.translate(ecx, ecy);
      ctx!.rotate(rotation);
      ctx!.beginPath();
      ctx!.setLineDash(dash);
      ctx!.arc(0, 0, r, 0, Math.PI * 2);
      ctx!.strokeStyle = lineColor(alpha);
      ctx!.lineWidth = lw;
      ctx!.stroke();
      ctx!.setLineDash([]);
      ctx!.restore();
    }

    function ringLabel(r: number, name: string): void {
      const ecx = cx + parX;
      const ecy = cy + parY;
      const lx = ecx + Math.cos(LABEL_ANGLE) * r;
      const ly = ecy + Math.sin(LABEL_ANGLE) * r;
      ctx!.beginPath();
      ctx!.arc(lx, ly, 2.8, 0, Math.PI * 2);
      ctx!.fillStyle = lineColor(0.95);
      ctx!.globalAlpha = 1;
      ctx!.fill();
      label({
        text: name,
        x: lx + 9,
        y: ly,
        color: lineColor(1),
        alpha: 1,
        size: 11,
        align: 'left',
        bold: true,
      });
    }

    function externalNode(name: string, angle: number): void {
      const ecx = cx + parX;
      const ecy = cy + parY;
      const rr = r3 + 54;
      let x = ecx + Math.cos(angle) * rr;
      let y = ecy + Math.sin(angle) * rr;
      const m = 96;
      x = Math.max(m, Math.min(width - m, x));
      y = Math.max(m, Math.min(height - m, y));
      ctx!.beginPath();
      ctx!.arc(x, y, 3, 0, Math.PI * 2);
      ctx!.fillStyle = lineColor(0.6);
      ctx!.globalAlpha = 1;
      ctx!.fill();
      label({
        text: name,
        x,
        y: y + 12,
        color: lineColor(0.7),
        alpha: 1,
        size: 9,
        align: 'center',
      });
    }

    function drawCore(): void {
      const ecx = cx + parX;
      const ecy = cy + parY;
      const pulse = 2 + 2.5 * Math.abs(Math.sin(t));
      // Layered glow so the agent reads as the origin even through the vignette.
      ctx!.fillStyle = palette.allow;
      ctx!.beginPath();
      ctx!.arc(ecx, ecy, r0 * 2.6, 0, Math.PI * 2);
      ctx!.globalAlpha = 0.1;
      ctx!.fill();
      ctx!.beginPath();
      ctx!.arc(ecx, ecy, r0 * 1.7, 0, Math.PI * 2);
      ctx!.globalAlpha = 0.16;
      ctx!.fill();
      // Pulse ring.
      ctx!.beginPath();
      ctx!.arc(ecx, ecy, r0 + pulse, 0, Math.PI * 2);
      ctx!.strokeStyle = palette.allow;
      ctx!.globalAlpha = 0.5;
      ctx!.lineWidth = 1;
      ctx!.stroke();
      // Core disc — halo-colored fill for contrast, accent outline.
      ctx!.beginPath();
      ctx!.arc(ecx, ecy, r0, 0, Math.PI * 2);
      ctx!.fillStyle = palette.halo + '0.88)';
      ctx!.globalAlpha = 1;
      ctx!.fill();
      ctx!.strokeStyle = palette.allow;
      ctx!.lineWidth = 2.4;
      ctx!.stroke();
      // Inner glyph.
      ctx!.beginPath();
      ctx!.arc(ecx, ecy, 4.2, 0, Math.PI * 2);
      ctx!.fillStyle = palette.allow;
      ctx!.fill();
      ctx!.globalAlpha = 1;
      // Label.
      label({
        text: 'AGENT',
        x: ecx,
        y: ecy + r0 + 13,
        color: palette.allow,
        alpha: 1,
        size: 10,
        align: 'center',
        bold: true,
      });
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      const ecx = cx + parX;
      const ecy = cy + parY;

      // Faint radial cross-section guide tying the ring labels together.
      ctx!.beginPath();
      ctx!.setLineDash([2, 6]);
      ctx!.moveTo(
        ecx + Math.cos(LABEL_ANGLE) * (r0 + 6),
        ecy + Math.sin(LABEL_ANGLE) * (r0 + 6),
      );
      ctx!.lineTo(
        ecx + Math.cos(LABEL_ANGLE) * (r3 + 66),
        ecy + Math.sin(LABEL_ANGLE) * (r3 + 66),
      );
      ctx!.strokeStyle = lineColor(0.14);
      ctx!.lineWidth = 1;
      ctx!.stroke();
      ctx!.setLineDash([]);

      // Three interception rings, inner→outer, progressively bolder. The outer
      // eBPF ring is the strongest — it is the last boundary before OUTSIDE.
      const base = palette.dark ? 0.34 : 0.52;
      drawRing(r1, rot * 1.0, [4, 6], 1.4, base);
      drawRing(r2, -rot * 0.8, [12, 8], 1.7, base + 0.05);
      drawRing(r3, rot * 0.55, [3, 8], 2.1, base + 0.12);

      ringLabel(r1, 'SDK');
      ringLabel(r2, 'PROXY');
      ringLabel(r3, 'eBPF');

      // Inside↔outside cue: OUTSIDE sits just beyond the outer ring on the ray.
      const ox = ecx + Math.cos(LABEL_ANGLE) * (r3 + 44);
      const oy = ecy + Math.sin(LABEL_ANGLE) * (r3 + 44);
      label({
        text: 'OUTSIDE',
        x: ox + 9,
        y: oy,
        color: lineColor(0.6),
        alpha: 1,
        size: 9.5,
        align: 'left',
      });

      // External zone nodes (outside the outer ring).
      externalNode('LLM', -1.15);
      externalNode('EXTERNAL API', 0.32);
      externalNode('SERVICES', 2.3);

      // Request particles (faded near the core so the headline stays calm).
      for (const p of particles) {
        const px = ecx + Math.cos(p.angle) * p.radius;
        const py = ecy + Math.sin(p.angle) * p.radius;
        const col = verdictColor(p.verdict);
        const near = Math.max(0, Math.min(1, (p.radius - r0) / (r1 - r0)));
        const a = p.alpha * (0.18 + 0.82 * near);

        if (!p.blocked) {
          // Short radial motion trail.
          ctx!.beginPath();
          ctx!.moveTo(px, py);
          ctx!.lineTo(px - Math.cos(p.angle) * 6, py - Math.sin(p.angle) * 6);
          ctx!.strokeStyle = col;
          ctx!.globalAlpha = a * 0.3;
          ctx!.lineWidth = 1;
          ctx!.stroke();
        }

        ctx!.beginPath();
        ctx!.arc(px, py, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = col;
        ctx!.globalAlpha = a * (p.blocked ? 0.9 : 1);
        ctx!.fill();

        // Attached secret dot on a review carrier that still holds it.
        if (p.secret) {
          const ox2 = Math.cos(p.angle + Math.PI / 2) * 4;
          const oy2 = Math.sin(p.angle + Math.PI / 2) * 4;
          ctx!.beginPath();
          ctx!.arc(px + ox2, py + oy2, 2.3, 0, Math.PI * 2);
          ctx!.fillStyle = palette.review;
          ctx!.globalAlpha = a;
          ctx!.fill();
        }
      }
      ctx!.globalAlpha = 1;

      // Detached secrets dissolving at the PROXY ring.
      for (const s of secrets) {
        const sx = ecx + Math.cos(s.angle) * s.radius;
        const sy = ecy + Math.sin(s.angle) * s.radius;
        const k = s.life / s.maxLife;
        ctx!.beginPath();
        ctx!.arc(sx, sy, 2.3 + (1 - k) * 3, 0, Math.PI * 2);
        ctx!.fillStyle = palette.review;
        ctx!.globalAlpha = Math.max(0, k) * 0.9;
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;

      // Ring flashes where requests are absorbed or secrets stripped.
      for (const f of flashes) {
        const k = f.life / f.maxLife;
        ctx!.beginPath();
        ctx!.arc(ecx, ecy, f.radius, f.angle - 0.3, f.angle + 0.3);
        ctx!.strokeStyle = f.color;
        ctx!.globalAlpha = Math.max(0, k) * 0.9;
        ctx!.lineWidth = 3;
        ctx!.stroke();
      }
      ctx!.globalAlpha = 1;

      // Ephemeral event text near each flash/strip point.
      for (const ev of labels) {
        const k = ev.life / ev.maxLife;
        const lx = ecx + Math.cos(ev.angle) * (ev.radius + 15);
        const ly = ecy + Math.sin(ev.angle) * (ev.radius + 15);
        const fade = Math.min(1, k * 3); // quick out-fade near end of life
        label({
          text: ev.text,
          x: lx,
          y: ly,
          color: ev.color,
          alpha: fade,
          size: 9,
          align: 'center',
          bold: true,
        });
      }

      drawCore();
    }

    function update() {
      for (const p of particles) step(p);
      for (let i = flashes.length - 1; i >= 0; i--) {
        flashes[i].life -= 1;
        if (flashes[i].life <= 0) flashes.splice(i, 1);
      }
      for (let i = secrets.length - 1; i >= 0; i--) {
        secrets[i].life -= 1;
        if (secrets[i].life <= 0) secrets.splice(i, 1);
      }
      for (let i = labels.length - 1; i >= 0; i--) {
        labels[i].life -= 1;
        labels[i].radius += 0.35; // drift gently outward while fading
        if (labels[i].life <= 0) labels.splice(i, 1);
      }
      rot += 0.0016;
      t += 0.03;
      parX += (tParX - parX) * 0.06;
      parY += (tParY - parY) * 0.06;
    }

    let raf = 0;
    function frame() {
      update();
      draw();
      raf = requestAnimationFrame(frame);
    }

    resize();

    if (reduced) {
      buildStatic();
      draw();
    } else {
      for (let i = 0; i < COUNT; i++) {
        const p: Particle = {
          angle: 0,
          radius: 0,
          speed: 0,
          verdict: 'allow',
          denyR: 0,
          secret: false,
          blocked: false,
          life: 0,
          alpha: 0,
          size: 2,
        };
        respawn(p);
        // Pre-scatter across the membrane so the field is populated at once.
        p.radius = r0 + Math.random() * (diag * 0.55); // NOSONAR - safe: visual particle animation only, not security-sensitive
        p.alpha = 0.9;
        particles.push(p);
      }
      raf = requestAnimationFrame(frame);
    }

    // Resizing clears the canvas; under reduced-motion there is no loop to
    // repaint, so rebuild and redraw the single static frame after each resize.
    const onResize = () => {
      resize();
      if (reduced) {
        buildStatic();
        draw();
      }
    };
    window.addEventListener('resize', onResize);

    // Cursor parallax gives the membrane a subtle sense of depth.
    let onMove: ((e: MouseEvent) => void) | null = null;
    if (!reduced) {
      onMove = (e: MouseEvent) => {
        const rect = root!.getBoundingClientRect();
        tParX = ((e.clientX - rect.left) / rect.width - 0.5) * 26;
        tParY = ((e.clientY - rect.top) / rect.height - 0.5) * 26;
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
      <canvas ref={canvasRef} className={styles.canvas} />
      {/* Softer than the CSS default so the agent core + inner rings read while
          the headline stays legible (particles are also faded near center). */}
      <div
        className={styles.vignette}
        style={{
          background:
            'radial-gradient(ellipse 600px 340px at 50% 46%, ' +
            'color-mix(in srgb, var(--aa-bg) 76%, transparent) 0%, ' +
            'color-mix(in srgb, var(--aa-bg) 40%, transparent) 58%, ' +
            'transparent 100%)',
        }}
      />
      <div className={styles.logStrip}>
        LAYERS: SDK · PROXY · eBPF · SECRETS: CONTAINED
      </div>
    </div>
  );
}
