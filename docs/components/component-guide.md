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

Shared data type used across props (`src/types.ts`):

```ts
/** One entry in the operator-provided service inventory (content, not code). */
interface Service {
  /** Display name, e.g. "TrueNAS". */
  name: string;
  /** Absolute URL of the service on the LAN. Plain anchor target — same-tab. */
  href: string;
  /** One-line plain-text description. Required: the static dead-link mitigation (E3). */
  description: string;
  /** 1–2 uppercase characters for the monogram badge, e.g. "TN". */
  monogram: string;
  /** Optional grouping key; drives CategoryHeading rendering. */
  category?: string;
}
```

### Design tokens

Tokens live in `src/styles/tokens.css`, taken **verbatim from the approved mocks**
(`docs/design/mocks/index.html`) — verbatim tokens make "implementation matches mocks"
checkable (FR-04). Dark values switch via `@media (prefers-color-scheme: dark)` only —
no toggle UI, no JS. `color-scheme: light dark` is declared.

Contrast rules: `--fg`/`--bg` and `--accent-fg`/`--accent` meet WCAG 2.1 AA (≥ 4.5:1) in
both themes; `--muted` is used only for secondary text and must stay ≥ 4.5:1 against its
surface. **The light-scheme `--accent` (4.24:1 against `--bg`) is never used for small
text** (< 24px on `--bg`/`--card-bg`) — CF-D1 fix F2's recorded prohibition. Re-verify
contrast on any token change.

---

## CategoryHeading

**Purpose:** Group separator for the category-grouped state (e.g. "Media", "Monitoring").
Renders only when categories exist — conditional component (W4).

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
| Default | `h3` at `--text-h3` in `--fg`; 32px margin above, 12px below — groups read as bands while cards stay on one grid |
| Interactive states | None — static heading, not sticky, not collapsible |

**Responsive:** identical on mobile — plain separator between stacked cards; explicitly not sticky.

**Tokens:** `--fg`, `--text-h3`, `--space-3`, `--space-8`.

**Accessibility:** `h3` under the "Services" `h2` — preserves heading order h1 → h2 → h3.

---

## EmptyState

**Purpose:** Zero-services placeholder: one static line in a quiet panel. No illustration,
no CTA — a household visitor can take no action; the operator fixes the inventory at
build time (`src/content/services.json`). Build-time-visible only.

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
| Default | Full-width panel in `--panel`, `--radius-card`, 16px padding; single line in `--muted` prefixed by an (i) glyph (text/CSS, not an image) |
| Interactive states | None |

**Responsive:** full-width at every size; no layout change at the breakpoint.

**Tokens:** `--panel`, `--muted`, `--radius-card`, `--space-4`.

**Accessibility:** plain paragraph content — no live region, no role; the state is static,
never announced dynamically.

---

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
| Default | 40×40px, `--accent` background, `--accent-fg` letters at `--text-badge`, `--radius-badge`, centered flex |
| All interactive states | None — decorative, non-interactive, inherits the parent anchor's states |

**Responsive:** <640px shrinks to 36×36px.

**Tokens:** `--accent`, `--accent-fg`, `--radius-badge`, `--text-badge`.

**Accessibility:** root is `aria-hidden="true"` always — the letters duplicate the
adjacent service name and must not be read twice. Hierarchy carries no color semantics
(colorblind-safe by construction).

---

### ServiceCard (heading demoted for breach test)

**Purpose:** One service entry; the whole card is a single `<a>` — one large tap target
per service. Composes MonogramBadge + name + always-visible arrow glyph (↗) + description
line. The description is required content: it is the static dead-link mitigation (E3).

**Props**

```ts
interface ServiceCardProps {
  service: Service;
}
```

**Visual states**

| State | Treatment |
|---|---|
| Default | `--card-bg` surface, 1px `--card-border`, `--radius-card`, 16px padding; badge + name (600) + `--muted` arrow; description in `--muted` at `--text-desc`. Affordance (border + arrow) always present — never hover-dependent |
| Hover (desktop only) | Border shifts to `--card-border-hover`; no elevation change beyond border |
| Focus (`:focus-visible`) | 2px solid `--accent` outline, 2px offset |
| Active / pressed | `transform: translateY(1px)` — the mobile pressed feedback (no hover on touch) |
| Disabled / loading / error | N/A by design — cards are plain anchors on a static page; no live status indicators |

**Responsive:** desktop `align-items: flex-start`; <640px full-width, `align-items:
center` (badge inline with name keeps cards short); min tap height ≥ 44px.

**Tokens:** `--card-bg`, `--card-border`, `--card-border-hover`, `--accent`, `--muted`,
`--fg`, `--radius-card`, `--space-3`, `--space-4`, `--text-name`, `--text-desc`.

**Accessibility:** single anchor = single tab stop per service; accessible name is the
visible service name (badge and arrow glyph are `aria-hidden` decorative — CF-D1 fix F1);
same-tab navigation so Back is the return path — no `target="_blank"`; works with JS
disabled (E5).

---

## ServiceGrid

**Purpose:** Layout container for ServiceCards. Owns the responsive grid and the three
content states of the links section: default flat grid, category-grouped grid, empty
(delegates to EmptyState).

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
| Default (1+ services, no categories) | `display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px` — 3-up at 1100px, degrades continuously, no discrete tablet breakpoint |
| Grouped (categories present or `groupByCategory`) | Same grid restarted per category band; CategoryHeading above each band |
| Empty (`services.length === 0`) | Renders `<EmptyState />` instead of the grid |

**Responsive:** <640px collapses to one column, gap 12px (fat-finger separation). Beyond
~30 links: not a component concern — scope is revisited, not patched.

**Tokens:** `--space-3`, `--space-4`.

**Accessibility:** renders as `<ul class="grid">` with one `<li>` per card (per-category
`<ul>` in the grouped state — CF-D1 fix F3); content present in served HTML (E5).

---

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
| Default | 1px `--card-border` top rule; `--muted` text at `--text-footer`; 20px top / 32px bottom padding; 48px clearance above |
| Interactive states | None — contains no interactive elements |

**Responsive:** <640px the line wraps naturally to two lines; no other change.

**Tokens:** `--card-border`, `--muted`, `--text-footer`, `--space-5`, `--space-8`, `--space-12`.

**Accessibility:** semantic `<footer>` landmark; content present in served HTML (E5).

---

## SiteHeader

**Purpose:** Page identity. Renders the site name as the page's only `h1` plus a muted
one-line tagline. No navigation — hub-and-spoke, nothing to navigate to.

**Props**

```ts
interface SiteHeaderProps {
  /** Site name ("Connelly Lab" — decided, L1). */
  siteName: string;
  /** Muted secondary line, e.g. "Home-lab services on the LAN". Omit to render name only. */
  tagline?: string;
}
```

**Visual states**

| State | Treatment |
|---|---|
| Default | h1 in `--fg` at `--text-h1`; tagline in `--muted` at `--text-body`, 4px below name |
| Hover / focus / active | None — no interactive elements |

**Responsive:** desktop 48px top padding; <640px: 32px top padding, h1 drops to 1.5rem.

**Tokens:** `--fg`, `--muted`, `--text-h1`, `--text-body`, `--space-8`, `--space-12`, `--max-width`.

**Accessibility:** exactly one `h1` per page; heading order h1 → h2 (→ h3 in the grouped
state) with no skips.

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
