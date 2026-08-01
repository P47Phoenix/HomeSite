# Component Guide

Scaffold-level guide (S3). The full per-component specification is copied here from
the approved design's `component-specs.md` at S5 (CF-D4). Headings below are the
docs-coverage gate's contract surface — one per exported component, exact name match.

## CategoryHeading

Category section heading (`h3`) rendered inside the grouped service grid.

## EmptyState

Zero-inventory branch: explains that `src/content/services.json` is empty and how to populate it.

## MonogramBadge

Decorative 1–2 character badge, `aria-hidden="true"` — the card name carries the accessible meaning.


One inventory entry: monogram + name + description; the whole card is a plain anchor to the service.

## ServiceGrid

Inventory grid. Empty array renders EmptyState; renders flat list, or category sections when any service carries a category.

## SiteFooter

Page footer (`contentinfo` landmark).

## SiteHeader

Page banner: the single `h1` plus anchor navigation to `#services`.
