import React, {type ReactNode, useEffect, useRef} from 'react';
import styles from './styles.module.css';

/**
 * GovernedField — the hero background. A purely decorative layer behind the
 * hero copy that draws the one distinction the whole product rests on:
 *
 *   AGENT (centre) → the GOVERNED PATH boundary → OUTSIDE (LLM / APIs)
 *
 * Actions leave the agent core and travel radially outward. Those that were
 * **routed** meet the boundary and get a decision there — refused before the
 * dial, a recognised credential removed before the request is forwarded, or
 * allowed through. Those that were **not routed** leave through the gap in the
 * boundary and are labelled NOT INSPECTED: nothing looked at them, which is a
 * different result from being allowed.
 *
 * AAASM-5585 replaced the previous drawing deliberately. That version rendered
 * three concentric rings labelled SDK, PROXY and eBPF with requests being
 * "denied at SDK" and "denied at eBPF", which is ADR 0033 forbidden design 1
 * (a fixed SDK→proxy→eBPF pipeline as *the* architecture) plus forbidden
 * design 2 (eBPF as the outermost, cross-platform, enforcing layer). Neither is
 * true: the SDK is advisory, and no eBPF signal takes part in any allow/deny
 * decision. A gap in one boundary is the honest picture; three nested rings
 * that cover for each other is the inference the architecture exists to stop.
 *
 * Rendered aria-hidden with pointer-events disabled (via styles.field). Honors
 * prefers-reduced-motion by drawing a single static frame with no animation
 * loop and no cursor parallax. Theme palette (light/dark) is tracked live via a
 * MutationObserver, and line/label opacity is raised in the light theme so the
 * structure reads on white.
 */

/**
 * What happens to an action in the drawing.
 *
 * `unrouted` is not a verdict — it is the absence of one, and it is drawn in
 * the neutral line colour rather than in an outcome colour for that reason.
 */
type Fate = 'allow' | 'redact' | 'refuse' | 'unrouted';

interface Particle {
  angle: number; // radial direction of travel
  radius: number; // distance from the agent core
  speed: number;
  fate: Fate;
  secret: boolean; // a redact carrier still holding its credential dot
  blocked: boolean; // absorbed at the boundary — dissolving in place
  life: number; // dissolve countdown once blocked
  alpha: number;
  size: number;
}

interface Flash {
  radius: number;
  angle: number;
  life: number;
  maxLife: number;
  color: string;
}

interface Secret {
  radius: number; // where the credential was removed (the boundary)
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
  redact: string;
  refuse: string;
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
        redact: '#f5a623',
        refuse: '#f87171',
        line: 'rgba(230, 237, 243, ',
        halo: 'rgba(13, 17, 23, ',
        dark: true,
      }
    : {
        allow: '#0d9488',
        redact: '#c2410c',
        refuse: '#dc2626',
        line: 'rgba(24, 34, 45, ',
        halo: 'rgba(255, 255, 255, ',
        dark: false,
      };
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
    // Ray carrying the boundary label and the OUTSIDE cue, so the cross-section
    // reads AGENT → GOVERNED PATH → OUTSIDE.
    //
    // Held close to horizontal on purpose. The hero copy is centred and the
    // terminal sits under it, so the only reliably empty regions are the left
    // and right flanks. A steeper ray puts the label behind the headline, where
    // it is painted over by `.heroInner`'s stacking context and silently lost —
    // which is exactly what happened to the first version of this drawing.
    const LABEL_ANGLE = -Math.PI * 0.1;
    // The corridor where the boundary is simply absent. Everything travelling
    // through it leaves uninspected. Opposite the label ray, on the left flank.
    const GAP_MID = Math.PI * 0.98;
    const GAP_HALF = 0.36;
    const MAX_LABELS = 5;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let cx = 0;
    let cy = 0;
    const r0 = 18; // agent core radius (emission origin)
    let rd = 0; // the governed-path boundary
    let rOut = 0; // faint outside cue — not a control, just the world
    let diag = 0;

    const COUNT = 32;
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

    function fateColor(f: Fate): string {
      if (f === 'refuse') return palette.refuse;
      if (f === 'unrouted') return palette.line + '0.55)';
      return palette.allow; // allowed, and redact carriers once sanitized
    }

    /** True when `angle` falls inside the ungoverned corridor. */
    function inGap(angle: number): boolean {
      const d = Math.abs(
        Math.atan2(Math.sin(angle - GAP_MID), Math.cos(angle - GAP_MID)),
      );
      return d < GAP_HALF;
    }

    /** An angle on the boundary — i.e. anywhere the corridor is not. */
    function routedAngle(): number {
      // NOSONAR - safe: visual particle animation only, not security-sensitive
      const span = Math.PI * 2 - GAP_HALF * 2;
      return GAP_MID + GAP_HALF + Math.random() * span;
    }

    /** An angle inside the corridor. */
    function unroutedAngle(): number {
      // NOSONAR - safe: visual particle animation only, not security-sensitive
      return GAP_MID - GAP_HALF + Math.random() * (GAP_HALF * 2);
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
      rOut = maxR;
      rd = maxR * 0.6;
      diag = Math.hypot(width, height);
    }

    function pickFate(angle: number): Fate {
      if (inGap(angle)) return 'unrouted';
      const r = Math.random(); // NOSONAR - safe: visual particle animation only, not security-sensitive
      if (r < 0.52) return 'allow';
      if (r < 0.76) return 'redact';
      return 'refuse';
    }

    function respawn(p: Particle) {
      // Roughly one action in four is never routed. The corridor is drawn to
      // scale with that, so the picture does not imply the boundary is closed.
      const unrouted = Math.random() < 0.26; // NOSONAR - safe: visual only
      p.angle = unrouted ? unroutedAngle() : routedAngle();
      p.radius = r0 + Math.random() * 6; // NOSONAR - safe: visual only
      p.speed = 0.55 + Math.random() * 0.7; // NOSONAR - safe: visual only
      p.fate = pickFate(p.angle);
      p.secret = p.fate === 'redact';
      p.blocked = false;
      p.life = 0;
      p.alpha = 0;
      p.size = 1.6 + Math.random() * 1.5; // NOSONAR - safe: visual only
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

      // A recognised credential removed at the boundary before forwarding —
      // the dot detaches and dissolves, the request itself continues.
      if (p.fate === 'redact' && p.secret && p.radius >= rd) {
        p.secret = false;
        secrets.push({radius: rd, angle: p.angle, life: 34, maxLife: 34});
        flashes.push({
          radius: rd,
          angle: p.angle,
          life: 20,
          maxLife: 20,
          color: palette.redact,
        });
        pushLabel('CREDENTIAL REDACTED', p.angle, rd, palette.redact, 52);
        return;
      }

      // Refused at the boundary — absorbed before the dial.
      if (p.fate === 'refuse' && p.radius >= rd) {
        p.radius = rd;
        p.blocked = true;
        p.life = 24;
        flashes.push({
          radius: rd,
          angle: p.angle,
          life: 22,
          maxLife: 22,
          color: palette.refuse,
        });
        pushLabel('REFUSED BEFORE DIAL', p.angle, rd, palette.refuse, 50);
        return;
      }

      // Crossing the boundary's radius. Routed traffic that got a decision is
      // announced; traffic in the corridor is announced as uninspected, which
      // is the whole point of the drawing.
      // prettier-ignore
      if (prevR < rd && p.radius >= rd) { // NOSONAR - visual animation only
        if (p.fate === 'unrouted' && Math.random() < 0.5) {
          pushLabel('NOT INSPECTED', p.angle, rd, lineColor(0.7), 54);
        } else if (p.fate === 'allow' && Math.random() < 0.14) {
          pushLabel('ALLOWED', p.angle, rd, palette.allow, 46);
        }
      }

      // Fully out into the external zone — recycle.
      if (p.radius > diag) respawn(p);
    }

    function buildStatic() {
      // A curated, motionless cross-section for prefers-reduced-motion: an
      // allowed action outside the boundary, one mid-flight, one refused at the
      // boundary, one sanitized just past it, one still carrying its credential,
      // and one leaving through the corridor uninspected.
      particles.length = 0;
      flashes.length = 0;
      secrets.length = 0;
      labels.length = 0;
      const mk = (
        angle: number,
        radius: number,
        fate: Fate,
        secret: boolean,
        blocked: boolean,
      ): Particle => ({
        angle,
        radius,
        speed: 0,
        fate,
        secret,
        blocked,
        life: blocked ? 12 : 0,
        alpha: 1,
        size: 2.6,
      });
      const refusedAt = -0.9;
      const redactedAt = 0.5;
      particles.push(
        mk(-1.6, rd * 1.35, 'allow', false, false), // through, outside
        mk(-2.35, rd * 0.62, 'allow', false, false), // mid-flight
        mk(refusedAt, rd, 'refuse', false, true), // refused at the boundary
        mk(redactedAt, rd * 1.22, 'redact', false, false), // sanitized
        mk(1.45, rd * 0.66, 'redact', true, false), // still carrying it
        mk(GAP_MID, rd * 1.3, 'unrouted', false, false), // never inspected
      );
      flashes.push(
        {
          radius: rd,
          angle: refusedAt,
          life: 16,
          maxLife: 22,
          color: palette.refuse,
        },
        {
          radius: rd,
          angle: redactedAt,
          life: 14,
          maxLife: 20,
          color: palette.redact,
        },
      );
      secrets.push({radius: rd, angle: redactedAt, life: 20, maxLife: 34});
      pushLabel('REFUSED BEFORE DIAL', refusedAt, rd, palette.refuse, 50);
      pushLabel('CREDENTIAL REDACTED', redactedAt, rd, palette.redact, 50);
      pushLabel('NOT INSPECTED', GAP_MID, rd, lineColor(0.7), 50);
    }

    /**
     * The boundary, drawn as an arc with the ungoverned corridor left open.
     * The gap is load-bearing: a closed ring would assert coverage the product
     * does not have.
     */
    function drawBoundary(rotation: number, alpha: number): void {
      const ecx = cx + parX;
      const ecy = cy + parY;
      const from = GAP_MID + GAP_HALF;
      const to = GAP_MID - GAP_HALF + Math.PI * 2;

      ctx!.beginPath();
      ctx!.setLineDash([]);
      ctx!.arc(ecx, ecy, rd, from, to);
      ctx!.strokeStyle = lineColor(alpha * 0.6);
      ctx!.lineWidth = 1.6;
      ctx!.stroke();

      ctx!.save();
      ctx!.translate(ecx, ecy);
      ctx!.rotate(rotation);
      ctx!.beginPath();
      ctx!.setLineDash([12, 8]);
      ctx!.arc(0, 0, rd, from, to);
      ctx!.strokeStyle = lineColor(alpha);
      ctx!.lineWidth = 2.1;
      ctx!.stroke();
      ctx!.setLineDash([]);
      ctx!.restore();

      // Tick the two open ends so the gap reads as deliberate, not as a
      // rendering artifact.
      for (const a of [from, to]) {
        const ix = ecx + Math.cos(a) * (rd - 7);
        const iy = ecy + Math.sin(a) * (rd - 7);
        const ox = ecx + Math.cos(a) * (rd + 7);
        const oy = ecy + Math.sin(a) * (rd + 7);
        ctx!.beginPath();
        ctx!.moveTo(ix, iy);
        ctx!.lineTo(ox, oy);
        ctx!.strokeStyle = lineColor(alpha * 0.8);
        ctx!.lineWidth = 1.4;
        ctx!.stroke();
      }
    }

    /** The world beyond. Faint, unlabelled as a control, because it is not one. */
    function drawOutsideCue(alpha: number): void {
      const ecx = cx + parX;
      const ecy = cy + parY;
      ctx!.beginPath();
      ctx!.setLineDash([2, 9]);
      ctx!.arc(ecx, ecy, rOut, 0, Math.PI * 2);
      ctx!.strokeStyle = lineColor(alpha * 0.4);
      ctx!.lineWidth = 1;
      ctx!.stroke();
      ctx!.setLineDash([]);
    }

    function boundaryLabel(): void {
      const ecx = cx + parX;
      const ecy = cy + parY;
      const lx = ecx + Math.cos(LABEL_ANGLE) * rd;
      const ly = ecy + Math.sin(LABEL_ANGLE) * rd;
      ctx!.beginPath();
      ctx!.arc(lx, ly, 2.8, 0, Math.PI * 2);
      ctx!.fillStyle = lineColor(0.95);
      ctx!.globalAlpha = 1;
      ctx!.fill();
      label({
        text: 'GOVERNED PATH',
        x: lx + 9,
        y: ly,
        color: lineColor(1),
        alpha: 1,
        size: 11,
        align: 'left',
        bold: true,
      });
    }

    function gapLabel(): void {
      const ecx = cx + parX;
      const ecy = cy + parY;
      // Pushed well clear of the boundary: the left flank is where the CTA
      // row ends and the terminal card begins, and a label sitting on the arc
      // lands underneath one of them.
      const lx = ecx + Math.cos(GAP_MID) * (rd + 96);
      const ly = ecy + Math.sin(GAP_MID) * (rd + 96);
      label({
        text: 'NOT ROUTED',
        x: lx,
        y: ly,
        color: lineColor(0.72),
        alpha: 1,
        size: 10,
        align: 'center',
        bold: true,
      });
    }

    function externalNode(name: string, angle: number): void {
      const ecx = cx + parX;
      const ecy = cy + parY;
      const rr = rOut + 54;
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

      // Faint radial guide tying the core to the boundary label.
      ctx!.beginPath();
      ctx!.setLineDash([2, 6]);
      ctx!.moveTo(
        ecx + Math.cos(LABEL_ANGLE) * (r0 + 6),
        ecy + Math.sin(LABEL_ANGLE) * (r0 + 6),
      );
      ctx!.lineTo(
        ecx + Math.cos(LABEL_ANGLE) * (rOut + 66),
        ecy + Math.sin(LABEL_ANGLE) * (rOut + 66),
      );
      ctx!.strokeStyle = lineColor(0.14);
      ctx!.lineWidth = 1;
      ctx!.stroke();
      ctx!.setLineDash([]);

      const base = palette.dark ? 0.4 : 0.58;
      drawOutsideCue(base);
      drawBoundary(rot, base);
      boundaryLabel();
      gapLabel();

      // Inside↔outside cue: OUTSIDE sits beyond the world circle on the ray.
      const ox = ecx + Math.cos(LABEL_ANGLE) * (rOut + 44);
      const oy = ecy + Math.sin(LABEL_ANGLE) * (rOut + 44);
      label({
        text: 'OUTSIDE',
        x: ox + 9,
        y: oy,
        color: lineColor(0.6),
        alpha: 1,
        size: 9.5,
        align: 'left',
      });

      externalNode('LLM', -1.15);
      externalNode('EXTERNAL API', 0.32);
      externalNode('SERVICES', 2.3);

      // Action particles (faded near the core so the headline stays calm).
      for (const p of particles) {
        const px = ecx + Math.cos(p.angle) * p.radius;
        const py = ecy + Math.sin(p.angle) * p.radius;
        const col = fateColor(p.fate);
        const near = Math.max(0, Math.min(1, (p.radius - r0) / (rd - r0)));
        const a = p.alpha * (0.18 + 0.82 * near);

        if (!p.blocked) {
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

        // Attached credential dot on a carrier that still holds it.
        if (p.secret) {
          const ox2 = Math.cos(p.angle + Math.PI / 2) * 4;
          const oy2 = Math.sin(p.angle + Math.PI / 2) * 4;
          ctx!.beginPath();
          ctx!.arc(px + ox2, py + oy2, 2.3, 0, Math.PI * 2);
          ctx!.fillStyle = palette.redact;
          ctx!.globalAlpha = a;
          ctx!.fill();
        }
      }
      ctx!.globalAlpha = 1;

      // Removed credentials dissolving at the boundary.
      for (const s of secrets) {
        const sx = ecx + Math.cos(s.angle) * s.radius;
        const sy = ecy + Math.sin(s.angle) * s.radius;
        const k = s.life / s.maxLife;
        ctx!.beginPath();
        ctx!.arc(sx, sy, 2.3 + (1 - k) * 3, 0, Math.PI * 2);
        ctx!.fillStyle = palette.redact;
        ctx!.globalAlpha = Math.max(0, k) * 0.9;
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;

      // Boundary flashes where an action was refused or a credential removed.
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

      // Ephemeral event text near each flash / crossing point.
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
          fate: 'allow',
          secret: false,
          blocked: false,
          life: 0,
          alpha: 0,
          size: 2,
        };
        respawn(p);
        // Pre-scatter across the field so it is populated at once.
        p.radius = r0 + Math.random() * (diag * 0.55); // NOSONAR - safe: visual only
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

    // Cursor parallax gives the field a subtle sense of depth.
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
      {/* Softer than the CSS default so the agent core + boundary read while
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
        ROUTED → DECIDED · NOT ROUTED → NOT INSPECTED
      </div>
    </div>
  );
}
