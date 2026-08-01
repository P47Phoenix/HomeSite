# ADR-003: Ship zero-JS build-time prerendered HTML (React as a build-time templating engine)

## Status

Accepted — 2026-07-31 (decided at Architecture, run-2026-07-31-hsite; authored into this
repo at S5 per the ADR ledger, architecture Follow-Up #3).

## Context

The PRD requires that the page work fully without JavaScript (E5: 100% of content and
anchor navigation must function with JS disabled) and caps shipped JS at 250 KB gzipped
(NFR-5, CI-gated as M10). The approved design is seven purely presentational components
with no state, no routing, and no forms. The team wants React + TypeScript as the
authoring toolchain (FR-01, decided), but nothing about the page requires a client
runtime.

## Decision

Prerender the entire page at build time and ship **zero JavaScript**:

- `scripts/prerender.tsx` calls `ReactDOMServer.renderToStaticMarkup(<App .../>)` after
  `vite build` and writes the complete HTML document to `dist/index.html`; CSS is
  extracted to a content-hashed file.
- No hydration bundle is emitted. React and TypeScript are build-time tooling only; the
  served artifact is pure HTML+CSS.
- JavaScript may be added later **only as progressive enhancement**, in a PR that carries
  the `behavior-change` label; the CI bundle-size gate applies from the first byte, and
  the serving CSP gains `script-src 'self'` in the same PR (NFR-10 same-PR docs rule
  covers the documentation).

## Consequences

### Positive

- E5 is satisfied by construction: the no-JS user gets 100% of the page, because there is
  no JS user.
- NFR-5 is trivially green (initial JS ≈ 0 KB of the 250 KB budget); the M10 gate exists
  to catch future regressions, not today's build.
- Smallest possible attack and maintenance surface for a household-facing page; the CSP
  can be maximally strict (`default-src 'none'`-based).
- Tests target the real artifact: unit/integration test the build-time templating path,
  e2e tests the served static output.

### Negative

- A custom ~50-line prerender script is owned by this repo (documented, tested) instead of
  a framework convention.
- Any future interactive feature requires deliberately introducing a JS entry point and
  revisiting the CSP — a speed bump by design, not an accident.

## Alternatives considered

| Alternative | Reason rejected |
|---|---|
| Next.js static export | Framework weight and server-runtime concepts unneeded for one page |
| vike / vite-plugin-ssr | Extra dependency for routing the site does not have |
| Client-rendered SPA | Violates E5 outright (empty HTML shell without JS) |

## Related

- ADR-001 (TLS mechanism, this directory); ADR-004 (hostname scheme, this directory).
- ADR numbering is shared across two repos — see this directory's `README.md` numbering note.
