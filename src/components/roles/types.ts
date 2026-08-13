import type {ReactNode} from 'react';
import type {TargetProduct} from '@site/src/analytics/trackEvent';

/*
 * AAASM-5587 — the contract the four evaluator entry pages are built from.
 *
 * The shape is not a layout convenience. It is the mechanism that stops four
 * role pages from becoming four products, and every field below exists because
 * dropping it is how that happens.
 *
 * Source: `role-narratives.md` on the Docs Hub (AAASM-5584), which supplies the
 * four briefs and the sixteen-entry shared claim register they are written from.
 * ADR 0034 puts the hub above this site in the one-product-truth hierarchy, so
 * the copy here is taken from the register rather than written, and a page may
 * simplify what the register says but may never broaden it.
 *
 * Two invariants are encoded as required fields rather than left to review:
 *
 *   - `Claim.bound` is not optional. The register's Bound column is part of the
 *     claim, not context for it, and a claim rendered without its bound is the
 *     broadening ADR 0034 §2.3 forbids. Making it optional would let a layout
 *     pass drop it silently, which is the exact failure the brief's "what an
 *     implementer must not drop" list opens with.
 *   - `Claim.term` is not optional either. Every register entry carries one of
 *     ADR 0033 §6's eleven terms, and a capability sentence with no term is a
 *     bare assertion — the reader cannot tell a refusal from an observation.
 *     RC9 is the one entry that carries an ADR 0030 protection state instead,
 *     which is why the field is a ReactNode and not a union of the eleven.
 *
 * The seven fields of `RoleBrief` are the brief's own seven, in the brief's own
 * order, because the brief is judged on whether a reader can work through that
 * sequence — pain, trigger, intervention, outcome, proof, limitations, next.
 */

/**
 * One capability sentence, quoted from the shared claim register.
 *
 * `rc` is rendered. An evaluator who wants to check a sentence against its
 * evidence needs the entry number to look it up with, and the register is
 * published — so the number is a route to the evidence rather than an internal
 * reference leaking onto a page.
 */
export interface Claim {
  /** Register entry, e.g. `RC1`. Rendered beside the term. */
  readonly rc: string;
  /** The ADR 0033 §6 term the entry reaches. Never omitted. */
  readonly term: ReactNode;
  /** The claim in the register's own wording. Not a paraphrase. */
  readonly text: ReactNode;
  /** The register's Bound. Part of the claim; a card without one is broader. */
  readonly bound: ReactNode;
}

/** One route to evidence. A role page that asserts without one is a brochure. */
export interface ProofLink {
  readonly key: string;
  readonly text: ReactNode;
  readonly label: ReactNode;
  readonly href: string;
  /** Omitted for same-hostname destinations, which must not carry UTM. */
  readonly targetProduct?: TargetProduct;
  /** True for cross-hostname links, which open in a new tab. */
  readonly external?: boolean;
}

/**
 * One limitation, in the order this role hits it.
 *
 * `title` is separated from `text` so the limit is legible at a skim. The field
 * that decides whether a page survives contact with an evaluator is the one an
 * evaluator is most likely to skim, and an undifferentiated wall of prose is
 * read as a disclaimer rather than as content.
 */
export interface Limit {
  readonly key: string;
  readonly title: ReactNode;
  /** The brief's own framing, where it adds something the entry does not. */
  readonly text?: ReactNode;
  /**
   * The register entry this limitation IS, where it is one.
   *
   * Six entries — RC7, RC8, RC9, RC12, RC14, RC16 — are cited by the briefs
   * only from a Limitations section. Attaching the shared object here rather
   * than restating it in prose is what stops a limitation from becoming a
   * second, weaker copy of a register entry: it renders through the same path
   * as a claim card, so it carries the same term and the same bound. RC14
   * reached two different strengths on two pages before this field existed.
   */
  readonly entry?: Claim;
}

/** The two next steps. Two options is a decision; five is a menu. */
export interface NextStep {
  readonly text: ReactNode;
  readonly label: ReactNode;
  readonly href: string;
  readonly targetProduct?: TargetProduct;
  readonly external?: boolean;
}

export interface RoleBrief {
  /** Route slug under the shared `/roles` prefix. */
  readonly slug: string;
  /** Short name, used on the page and in the switcher. */
  readonly name: ReactNode;
  /**
   * The AAASM-5591 audience value this brief serves. Rendered, because it is
   * how a reader confirms in one glance that they are on their own page.
   */
  readonly audience: string;
  /** The decision this reader is trying to reach. */
  readonly job: ReactNode;
  /** Page `<title>`. A label, never a capability sentence — see RolePage. */
  readonly metaTitle: string;
  readonly pain: readonly ReactNode[];
  readonly trigger: ReactNode;
  readonly interventionLead: ReactNode;
  readonly claims: readonly Claim[];
  readonly outcome: readonly ReactNode[];
  readonly proof: readonly ProofLink[];
  readonly limitations: readonly Limit[];
  readonly next: readonly NextStep[];
}
