/**
 * Install-command configuration for the landing-page install block.
 *
 * HORO-44 (Wave 2 Stage B) extends the HORO-42 scaffold from a single
 * `curl` one-liner to a tabbed picker over the closed vocabulary from
 * the event taxonomy §3.3: `curl`, `brew`, `docker`, `source`, `other`.
 *
 * The `command_type` string emitted alongside `copy_install_command`
 * MUST match one of the vocabulary tokens verbatim — GA4 silently
 * creates a new row for any typo, so we drive both the UI and the event
 * from this single source of truth.
 *
 * Content rule (from the HORO-40 IA plan §2.2 and the HORO-44 ticket):
 * every command shown here must be REAL — either genuinely runnable
 * today or clearly gated with an inline TODO explaining what is
 * pre-launch. No fake download URLs, no placeholder registry paths.
 */

/**
 * Closed vocabulary for the `command_type` GA4 event parameter
 * (event taxonomy §3.3). `other` is reserved for future variants; we
 * only surface the four production install paths in the UI today.
 */
export type InstallCommandType = 'curl' | 'brew' | 'docker' | 'source';

export interface InstallCommandOption {
  /** Vocabulary token — matches the GA4 `command_type` parameter. */
  readonly id: InstallCommandType;
  /** Short user-facing tab label. */
  readonly label: string;
  /** Optional one-line hint under the tab strip when the tab is active. */
  readonly hint: string;
  /**
   * The command string surfaced in the terminal frame and copied to
   * clipboard on click. Kept as the DOM text and never included in
   * the GA4 event payload (event taxonomy §3.3: encoding the command
   * bloats the payload and the closed vocabulary is enough to segment).
   */
  readonly command: string;
  /**
   * Optional cross-hostname docs link surfaced under the command when
   * a variant needs additional context (e.g. `source` points to the
   * core-repo README build instructions). Same-hostname anchors carry
   * NO UTM per HORO-47 §5.2 — this is only populated for cross-hostname
   * targets and the UTM is baked in by the config below.
   */
  readonly detailsUrl?: string;
  /** Anchor text for `detailsUrl`. */
  readonly detailsLabel?: string;
}

/**
 * `curl` — the canonical OSS install path. The script is served from
 * `agent-assembly.com/install.sh` (see `static/install.sh`); the URL is
 * the source of truth for the metadata drift check.
 */
const CURL: InstallCommandOption = {
  id: 'curl',
  label: 'curl',
  hint: 'macOS and Linux. The script is served from agent-assembly.com/install.sh — review it before piping to sh if you prefer.',
  command: 'curl -fsSL https://agent-assembly.com/install.sh | sh',
};

/**
 * `brew` — Homebrew tap for macOS / Linuxbrew. The tap repo
 * (`ai-agent-assembly/homebrew-tap`) is being provisioned as part of the
 * launch wave; until it is public, we still surface the real tap URL so
 * we don't ship a fake command, and the pre-launch QA (HORO-50) confirms
 * the tap is published before the block goes live.
 *
 * TODO(HORO-44): confirm the homebrew-tap repo is public before launch;
 * the tap install below fails today with `Error: Tap ai-agent-assembly/tap
 * does not exist` if the tap has not been pushed yet.
 */
const BREW: InstallCommandOption = {
  id: 'brew',
  label: 'brew',
  hint: 'Homebrew tap for macOS and Linuxbrew. Tap is being published as part of the launch wave.',
  command: 'brew install ai-agent-assembly/tap/aasm',
};

/**
 * `docker` — container image for CI / sandboxed evaluation. The image is
 * not published to a public registry yet; the command below uses the
 * canonical image name we intend to publish (`ai-agent-assembly/aasm`).
 * Until the image is published, the fallback path is the core-repo
 * README, which is linked from the `source` tab.
 *
 * TODO(HORO-44): confirm the container image is pushed (either GHCR at
 * `ghcr.io/ai-agent-assembly/aasm` or Docker Hub) before launch. If GHCR
 * ends up being the canonical registry, prefix the tag accordingly.
 */
const DOCKER: InstallCommandOption = {
  id: 'docker',
  label: 'docker',
  hint: 'Run the CLI in a container. Image is being published as part of the launch wave.',
  command: 'docker run --rm ai-agent-assembly/aasm:latest --help',
};

/**
 * `source` — build from source. There is no shell one-liner for the
 * source path; the accurate instruction is "clone the core repo and
 * follow the README build steps". The `command` string is the
 * `git clone` invocation that gets a developer to the point where the
 * README applies; the `detailsUrl` is the real place to read the build
 * steps. This is intentionally NOT a fake `make install` command.
 */
const SOURCE: InstallCommandOption = {
  id: 'source',
  label: 'source',
  hint: 'Clone and build from source — see the core repo README for the full build steps.',
  command: 'git clone https://github.com/ai-agent-assembly/agent-assembly.git',
  // Cross-hostname link: UTM applied per HORO-47 §5.2. `utm_content`
  // identifies the placement so this row is distinguishable from the
  // hero and trust-strip links to the same repo.
  detailsUrl:
    'https://github.com/ai-agent-assembly/agent-assembly#build-from-source?utm_source=product_site&utm_medium=referral&utm_campaign=oss_install&utm_content=install_source_readme',
  detailsLabel: 'Build instructions →',
};

/**
 * Order matters — the first entry is the default selected tab. `curl`
 * leads because it is the only command that works today with no extra
 * assumptions (see IA plan §4.5: trust-before-ask, HORO-44 §Acceptance:
 * OSS install/download path is real and visible).
 */
export const INSTALL_COMMANDS: readonly InstallCommandOption[] = [
  CURL,
  BREW,
  DOCKER,
  SOURCE,
];

/** Sanity: the default selection must be the first entry (`curl`). */
export const DEFAULT_INSTALL_COMMAND: InstallCommandType =
  INSTALL_COMMANDS[0].id;
