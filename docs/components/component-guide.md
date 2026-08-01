# Component Guide

The UX/UI component guide required by FR-03: every UI component used by the site has an
entry with **purpose, props, and visual states**. Adapted to repo-resident form from the
approved design's component specification (`component-specs.md`, Design stage,
run-2026-07-31-hsite; CF-D4).

> **Heading contract:** `##` headings in this file are reserved for component entries —
> the CI docs-coverage gate (`scripts/check-docs-coverage.mjs`) treats every `## <Name>`
> heading as a documented component and requires exact set equality with the exports of
> `src/components/index.ts`. All non-component sections in this file use other heading
> levels on purpose.

### Maintenance rule (read first — M2, CI-enforced)

**New component ⇒ new entry, before merge.** Every React component exported from
`src/components/index.ts` (the barrel is the authoritative export list) must have a
`## <ComponentName>` entry in this guide with purpose, props, and visual states (FR-03).
This is CI-enforced per metric **M2 (Component Guide Coverage)**: the docs-coverage gate
matches exported component names against `##` headings — exact string match,
case-sensitive, **set equality in both directions** — and **fails the PR when coverage
< 100%**, naming the missing component(s) or stale heading(s) (matching rule pinned at
Plan, OQ-M3). Renaming or deleting a component updates or removes its entry **in the same
PR** (NFR-10). Development DoD review is the backstop for entry *quality* (CI can only
check presence).

### Component inventory

| Component | Level | Conditional? | Wireframe trace |
|---|---|---|---|
| `SiteHeader` | Organism | No | W1 (1), W2 |
| `ServiceGrid` | Organism | No | W1, W2, W4 |
| `ServiceCard` | Molecule | No | W1 (3)(4), W2 |
| `MonogramBadge` | Atom | No | W1 (3), W2 |
| `CategoryHeading` | Atom | Yes — only when categories are defined | W4 (6) |
| `EmptyState` | Molecule | Yes — only when zero services | W3 |
| `SiteFooter` | Organism | No | W1 (5), W2, W3 |


### Shared Data Type

```ts
/** One entry in the operator-provided service inventory (content, not code — NFR-5). */
interface Service {
  /** Display name, e.g. "TrueNAS". */
  name: string;
  /** Absolute URL of the service on the LAN. Plain anchor target — same-tab. */
  href: string;
  /** One-line plain-text description. Required: the E3 dead-link mitigation. */
  description: string;
  /** 1–2 uppercase characters for the monogram badge, e.g. "TN". */
  monogram: string;
  /** Optional grouping key; drives CategoryHeading rendering. */
  category?: string;
}
```

### Design Tokens

Implemented in `src/styles/tokens.css` as exactly nine color custom properties on `:root`
(light values), switched by `@media (prefers-color-scheme: dark)` — no toggle UI, no JS.
`color-scheme: light dark` is declared. Spacing, typography, and radii are literal values
copied from the mock CSS, not custom properties.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#f6f7f9` | `#14161a` | Page background |
| `--fg` | `#1b1e24` | `#e8eaee` | Primary text |
| `--muted` | `#5b6472` | `#9aa3b0` | Secondary text: tagline, descriptions, arrow glyph, footer, category headings |
| `--card-bg` | `#ffffff` | `#1d2026` | ServiceCard surface |
| `--card-border` | `#d9dde3` | `#2e333c` | Card border, footer top rule, EmptyState dashed border |
| `--card-border-hover` | `#9aa4b2` | `#4a5260` | Card border on hover |
| `--accent` | `#2f6fed` | `#5b8def` | MonogramBadge background, focus ring |
| `--accent-fg` | `#ffffff` | `#10131a` | Text on accent (badge letters) |
| `--panel` | `#eceef2` | `#1a1d23` | EmptyState quiet panel |

Binding token rules and recorded deltas:

- **F2 prohibition:** light `--accent` (`#2f6fed`) must never be used as text color below
  24px (18.66px bold) on `--bg` or `--card-bg` — 4.24:1, fails AA; enforced by
  `scripts/check-contrast.mjs` (AC-2 audit). Accent is background (badge) and focus ring only.
- **CF-D2 resolution:** mobile side padding is 16px per the component spec — a deliberate,
  documented delta vs the approved mock's 24px; recorded 2026-07-31.
- **CategoryHeading visual:** implemented per the approved max-content mock — 0.8rem
  uppercase muted — which supersedes the spec table's 1rem/`--fg` value; the mock is the
  approved visual truth.
- Motion: none. Zero `transition`/`animation` rules (AC-13); the only movement is
  `.card:active { transform: translateY(1px); }`.

---

## CategoryHeading

**Purpose:** Group separator for the grouped (max-content) state: "Media", "Monitoring",
etc. Renders only when categories exist (or grouping is forced) — conditional component.

**Props**

```ts
interface CategoryHeadingProps {
  /** Category label, e.g. "Home Automation". */
  title: string;
}
```

**Visual states**

| State | Treatment |
|---|---|
| Default | `h3`, 0.8rem/600 uppercase, letter-spacing 0.06em, `--muted`; 32px margin above, 12px below; first-of-type margin-top 0 (per approved max-content mock) |
| Interactive states | None — static heading, not sticky, not collapsible |

**Responsive:** mobile margin-top 28px; otherwise identical — plain separator between
stacked cards.

**Tokens:** `--muted`.

**Accessibility:** `h3` under the "Services" `h2` — preserves heading order h1 → h2 → h3.

## EmptyState

**Purpose:** Zero-services placeholder: one static line in a quiet panel. No illustration,
no CTA — a household visitor can take no action; the operator fixes inventory at build
time. Build-time-visible only.

**Props**

```ts
interface EmptyStateProps {
  /** Override the default line. Default: "No services listed yet." */
  message?: string;
}
```

**Visual states**

| State | Treatment |
|---|---|
| Default | Full-width `.empty` panel: `--panel` background, 1px dashed `--card-border`, 10px radius, 24px padding; single line in `--muted` at 0.95rem |
| Interactive states | None |

**Responsive:** full-width at every size; no layout change at the breakpoint.

**Tokens:** `--panel`, `--card-border`, `--muted`.

**Accessibility:** plain paragraph content — no live region, no role; the state is static,
never announced dynamically.

## MonogramBadge

**Purpose:** Decorative 1–2-letter monogram identifying a service at a glance. Pure CSS —
no images or icon fonts, keeping the page asset-free.

**Props**

```ts
interface MonogramBadgeProps {
  /** 1–2 uppercase characters, e.g. "HA". Longer strings are a content error; clamp at 2. */
  label: string;
}
```

**Visual states**

| State | Treatment |
|---|---|
| Default | 40×40px `.badge`, `--accent` background, `--accent-fg` letters at 0.85rem/700, 8px radius, centered flex |
| All interactive states | None — decorative, non-interactive, inherits the parent anchor's states |

**Responsive:** below 640px shrinks to 36×36px.

**Tokens:** `--accent`, `--accent-fg`.

**Accessibility:** `aria-hidden="true"` always — the letters duplicate the adjacent
service name and must not be read twice. Rendering clamps the label at 2 characters.

## ServiceCard

**Purpose:** One service entry; the whole card is a single `<a class="card">` — one large
tap target per service. Composes MonogramBadge + name + always-visible arrow glyph (↗) +
description line. The description is required content: it is the E3 static dead-link
mitigation.

**Props**

```ts
interface ServiceCardProps {
  service: Service;
}
```

**Visual states**

| State | Treatment |
|---|---|
| Default | `--card-bg` surface, 1px `--card-border`, 10px radius, 16px padding; badge + name (600) + `--muted` arrow; description in `--muted` at 0.875rem. Affordance (border + arrow) always present — never hover-dependent |
| Hover (desktop only) | Border shifts to `--card-border-hover`; no elevation change beyond border |
| Focus (`:focus-visible`) | 2px solid `--accent` outline, 2px offset |
| Active / pressed | `transform: translateY(1px)` — the mobile pressed feedback |
| Disabled / loading / error | N/A by design — cards are plain anchors on a static page; no live status indicators |

**Responsive:** desktop `align-items: flex-start`; below 640px full-width,
`align-items: center`, min tap height ≥ 44px (min-height 44px + padding comfortably
exceeds it).

**Tokens:** `--card-bg`, `--card-border`, `--card-border-hover`, `--accent`, `--muted`,
`--fg`.

**Accessibility:** single anchor = single tab stop per service; accessible name is the
visible service name plus description (badge and arrow are `aria-hidden="true"` — F1);
same-tab navigation so Back is the return path — no `target="_blank"`; works with JS
disabled. Renders as an `<li>` inside the grid list (F3).

## ServiceGrid

**Purpose:** Layout container for ServiceCards. Owns the responsive grid and the three
content states: default flat grid, category-grouped grid, empty (delegates to EmptyState).

**Props**

```ts
interface ServiceGridProps {
  /** Operator-provided inventory. Empty array renders EmptyState. */
  services: Service[];
  /** Force category grouping even when few services. Default: group only when any service has a category. */
  groupByCategory?: boolean;
}
```

**Visual states**

| State | Treatment |
|---|---|
| Default (1+ services, no categories) | `ul.grid`: `display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px` — 3-up at 1100px, degrades continuously, no discrete tablet breakpoint |
| Grouped (categories present or `groupByCategory`) | One `ul.grid` per category band, CategoryHeading above each; bands are siblings so the h3 spacing rules apply |
| Empty (`services.length === 0`) | Renders `<EmptyState />` instead of the grid |

**Responsive:** below 640px collapses to one column, gap 12px. Beyond ~30 links: scope is
revisited, not patched (A-1).

**Tokens:** none directly — spacing is literal grid CSS; children consume the color tokens.

**Accessibility:** the grid is a semantic list — `<ul class="grid">` with one `<li>` per
card (F3): screen readers announce "list, N items". Services are sorted by display name;
DOM order equals visual order. Content is present in served HTML (zero-JS posture).

## SiteFooter

**Purpose:** Identity + scope statement ("Connelly Lab · LAN only · served from the Talos
cluster"). Muted small text, no links — nothing to link to.

**Props**

```ts
interface SiteFooterProps {
  /** Footer line; interpunct-separated segments recommended. */
  text: string;
}
```

**Visual states**

| State | Treatment |
|---|---|
| Default | 1px `--card-border` top rule; `--muted` text at 0.8rem; 20px top / 32px bottom padding; 48px clearance above from main's bottom padding |
| Interactive states | None — contains no interactive elements |

**Responsive:** below 640px the line wraps naturally to two lines; no other change.

**Tokens:** `--card-border`, `--muted`.

**Accessibility:** semantic `<footer>` landmark (contentinfo); content present in served
HTML.

## SiteHeader

**Purpose:** Page identity. Renders the site name as the page's only `h1` plus a muted
one-line tagline. No navigation — hub-and-spoke, nothing to navigate to.

**Props**

```ts
interface SiteHeaderProps {
  /** Site name (decided at Checkpoint 1). */
  siteName: string;
  /** Muted secondary line, e.g. "Home-lab services on the LAN". Omit to render name only. */
  tagline?: string;
}
```

**Visual states**

| State | Treatment |
|---|---|
| Default | h1 in `--fg` at 1.75rem/700; tagline in `--muted` at 0.95rem, 4px below name |
| Hover / focus / active | None — no interactive elements |

**Responsive:** desktop 48px top padding; below 640px: 32px top padding, h1 drops to
1.5rem.

**Tokens:** `--fg`, `--muted`.

**Accessibility:** exactly one `h1` per page; heading order h1 → h2 (→ h3 in the grouped
state) with no skips; semantic `<header>` landmark (banner).

---

### Accessibility summary (page-level, all components)

| Requirement | Implementation | WCAG 2.1 criterion |
|---|---|---|
| Contrast ≥ 4.5:1 both themes | Token pairs validated; re-check on any token change; light-accent small-text prohibition (F2) | 1.4.3 |
| Keyboard operability | Cards are anchors — natural tab order, no custom key handling | 2.1.1 |
| Visible focus | `:focus-visible` 2px `--accent` ring, 2px offset, on every card | 2.4.7 |
| Heading hierarchy | Single h1 → h2 → conditional h3; card names are non-heading spans | 1.3.1, 2.4.6 |
| Target size | Whole-card anchors ≥ 44px tall at all widths | 2.5.5 |
| No hover-only affordance | Border + arrow always visible; pressed state via `:active` on touch | 1.4.13-adjacent |
| Works without JS | All content in served HTML; anchors need no JS (E5) | Robustness posture |
| Dark mode | `prefers-color-scheme` token swap; both themes AA-verified | 1.4.3 (both themes) |

### Design rationale (recorded scope decisions)

- Seven small, mostly presentational components — surface proportional to a static
  landing page; keeps M2 coverage trivial to hold at 100%.
- Props are data-in only, no callbacks — no interactivity beyond native anchor navigation.
- `Service` as the single shared type — inventory is content, not code.
- **No disabled/loading/error card states — deliberate scope decision, not an omission**
  (no live status, no async, no forms); recorded here so DoD review does not flag missing
  states.
