# Homepage design record — v1 (AAASM-4143)

This directory is the **versioned design record** for the AAASM-4143 homepage
redesign of [agent-assembly.com](https://agent-assembly.com). It preserves the
raw design exploration the implementation was derived from, plus the decisions
that shaped the shipped result.

## Chosen directions: **2a + 2c, merged**

The exploration (`homepage-directions/Horonomy Homepage Directions.dc.html`)
presented several hero background directions. Two were selected and **merged**,
following the document's own "Try next" note — _"combine 2a particles with 2c
parallax"_:

- **2a "Governed Field"** — a full-bleed `<canvas>` particle field of ~90
  "agent" particles that physically obey an invisible boundary around the
  centered reading zone. Allowed agents are escorted through an aperture toward
  the CTA; denied agents deflect away. Bottom-left mono telemetry strip:
  `FIELD: 90 AGENTS · BOUNDARY: ACTIVE · APERTURE: CTA`.
- **2c "Depth Atlas"** — three cursor-parallax depth layers of dashed/dotted
  concentric orbit rings, labeled nodes (a cyan pulsing
  `AI AGENT ASSEMBLY / IN DEVELOPMENT` node, an amber blinking `FUTURE SYSTEMS`
  node), and a center radial **vignette** that keeps the reading zone calm.

The merge renders 2a's governed particle field **on top of** 2c's three parallax
depth layers, keeps 2c's center vignette, and reuses the site's existing
centered hero/CTA copy verbatim (restyled, not rewritten).

## Security-model background rationale (allow / review / deny)

The core requirement is that the background is not decorative — it **literally
depicts Agent Assembly's business-logic security model**: governed agent
requests hitting a policy boundary and being classified **ALLOWED / REVIEWED /
DENIED** by the policy engine, expressing the three-layer interception model
(SDK → proxy → eBPF, all gated by the gateway).

Each particle is a governed agent request with a verdict, driven by the design's
`hn-allow` / `hn-review` / `hn-deny` semantics:

| Verdict     | Color | Behavior at the boundary                                                              |
| ----------- | ----- | ------------------------------------------------------------------------------------- |
| **ALLOWED** | teal  | Escorted through the aperture toward the CTA and passes through.                      |
| **REVIEWED**| amber | Held at the checkpoint on the boundary (decelerates + blinks), then released to pass. |
| **DENIED**  | red   | Deflected off the boundary normal — bounced away, never enters the reading zone.      |

The invisible boundary is an ellipse around the centered hero copy; the aperture
is the gap at the bottom of that ellipse, aimed at the primary CTA.

## Color tokens

The design's Horonomy palette (graphite `#0F1115` base, signal cyan `#00B2FF`,
amber `#F5A623`) was **adapted to this site's existing brand** rather than
copied. The site keeps its own wordmark ("AI Agent Assembly"), logo, and teal
brand:

| Role            | This site (dark)            | This site (light)           | Horonomy source |
| --------------- | --------------------------- | --------------------------- | --------------- |
| Allowed / brand | `--aa-accent` `#2dd4bf`     | `--aa-accent` `#0d9488`     | `#00B2FF` cyan  |
| Reviewed        | amber `#f5a623`             | amber `#d18616`             | `#F5A623` amber |
| Denied          | red `#f87171`               | red `#e5484d`               | `#F5A623`/deflect |
| Base / rings    | `--aa-bg` / `--aa-text-dim` | `--aa-bg` / `--aa-text-dim` | `#0F1115` / grey |

Signal color is reserved for the "active boundary" semantics only, matching the
source's discipline.

## Fonts

The site keeps its existing type system (`system-ui` base,
`--ifm-font-family-monospace` for the telemetry strip / node labels). The
Horonomy source used Space Grotesk + IBM Plex Mono; those are **not** imported —
the mono telemetry aesthetic is reproduced with the site's existing monospace
stack to avoid a webfont dependency.

## Merge & implementation decisions

- The animated background lives in `src/components/home/GovernedField.tsx` and is
  rendered behind the hero content (`aria-hidden`, `pointer-events: none`).
- **GPU-friendly & subtle:** a single 2D canvas (~90 particles), CSS-transform
  parallax on three layers, no per-frame layout. It sits behind the reading zone
  and is dimmed by the vignette.
- **`prefers-reduced-motion`:** particle animation and ring spin are stopped and
  the field renders a single static frame; cursor parallax is disabled.
- **No product-message change:** the hero copy, CTAs, and all downstream sections
  keep their existing positioning (monitor/manage + policy control plane;
  attaches to agents where they run; does not host/deploy agents).

## Revision — concept change: concentric 3-layer governance membrane

The background concept above (2a "Governed Field" particles deflecting off a flat,
invisible boundary, merged with 2c parallax rings) was **redesigned** into a
**concentric 3-layer governance membrane** that depicts the product's real
three-layer interception model directly, in one continuous outward geometry.

The file, component name (`GovernedField`), props, `styles.field` root,
`aria-hidden`, `prefers-reduced-motion` handling, DPR-aware resize, theme-palette
reactivity, and cleanup are all **preserved** — only the visual concept changed.

**What it now renders:**

- **Center — the agent.** A small labeled `AGENT` core node. Requests originate
  here and travel radially **outward**.
- **Three concentric rings** (slow counter-rotating dashed membranes), inner→outer,
  each labeled along an upper-right cross-section ray:
  - **SDK** (inner) — in-process identity + pre-exec allow/deny.
  - **PROXY** (mid) — egress policy + secret redaction.
  - **eBPF** (outer) — kernel enforcement / bypass catch.
- **External zone** — faint labeled nodes outside the outer ring: `LLM`,
  `EXTERNAL API`, `SERVICES`.
- **Request particles** emitted from the core, each with a fate decided at the rings:
  - **ALLOWED** (teal) — passes through all three rings into the external zone.
  - **DENIED** (red) — absorbed with a brief ring flash at the layer it violates;
    never reaches outside.
  - **REDACTED** (teal carrier + amber secret dot) — passes, but the secret is
    **stripped at the PROXY ring**: the amber dot detaches and dissolves while the
    sanitized request continues outward without it.

**Why:** the earlier flat-boundary metaphor read as a single generic checkpoint.
The membrane makes the actual architecture literal — `AGENT → SDK → PROXY → eBPF →
external` — and makes the security guarantee visible: **outside only ever receives
allowed, sanitized requests, and secrets never cross the outer ring.** Denied
requests and stripped secrets visibly stop/dissolve at the rings.

The `allow=teal / review(secret)=amber / deny=red` palette tokens and the
light/dark `readPalette()` reactivity are unchanged. The rings are now drawn on
the single canvas (rotating dashed arcs + on-canvas labels) rather than as SVG
parallax layers; cursor parallax is retained as a subtle whole-scene offset. The
telemetry strip now reads `LAYERS: SDK · PROXY · eBPF · SECRETS: CONTAINED`.

## Scope

This is the versioned design record for **AAASM-4143** only. Validation assets
(hero screenshot + animated-background GIF) are under
`screenshots/aaasm-4143/`.
