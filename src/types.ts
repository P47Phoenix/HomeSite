/**
 * Service inventory entry — pinned verbatim from the approved design
 * (component-specs.md, "Service" contract). services.schema.json enforces
 * this shape on src/content/services.json at build time.
 */
export interface Service {
  /** Display name, e.g. "TrueNAS". */
  name: string;
  /** Absolute URL of the service on the LAN. Plain anchor target — same-tab (Flow 1 decision). */
  href: string;
  /** One-line plain-text description, e.g. "NAS — files & backups". Required: this is the E3 dead-link mitigation (W1 annotation 4), not decoration. */
  description: string;
  /** 1–2 uppercase characters for the monogram badge, e.g. "TN". */
  monogram: string;
  /** Optional grouping key; drives CategoryHeading rendering in the max-content state (W4). */
  category?: string;
}
