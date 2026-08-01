# HomeSite

Zero-JS prerendered landing page for home-lab services. React + TypeScript are
build-time tooling only — the shipped artifact is pure HTML+CSS built by
`vite build` + `scripts/prerender.tsx`.

## Commands

| Command | What it does |
|---|---|
| `npm ci` | Install pinned dependencies |
| `npm run build` | Validate `services.json` against its schema, build, prerender to zero-JS `dist/` |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run lint` | ESLint |
| `npm run test:unit` | Vitest unit suite with the ≥ 80% line-coverage gate (threshold in `vitest.config.ts`) |
| `npm run test:integration` | Composed-page integration suite |
| `npm run test:e2e` | Playwright journey against `vite preview` of built `dist/` (run `npm run build` first) |
| `npm run check:bundle` | Bundle budget gate — fails when gzipped JS anywhere under `dist/` > 250 KB |
| `npm run check:docs-coverage` | Docs-coverage gate — barrel exports vs `##` headings in the component guide |
| `npm run check:docs-presence` | Docs-presence gate — required docs files exist |
| `npm run check:workflows` | Workflow security grep-asserts (permissions, no `pull_request_target`, SHA pins) |

## Content

Edit `src/content/services.json` (contract: `src/content/services.schema.json`),
open a PR, let CI gate it. Content bakes into the prerendered HTML at build time.

## Docs

- [`docs/README.md`](docs/README.md) — documentation conventions (what goes where), the
  NFR-10 same-PR docs rule, and the `behavior-change` PR label convention
- [`docs/architecture/architecture.md`](docs/architecture/architecture.md) — build + CI/CD
  architecture and the deploy hand-off contract (Containers repo pins the image tag)
- [`docs/architecture/adr/`](docs/architecture/adr/README.md) — Architecture Decision
  Records (ADR-001 TLS, ADR-003 zero-JS prerender, ADR-004 hostname scheme; cross-repo
  numbering note)
- [`docs/components/component-guide.md`](docs/components/component-guide.md) — the
  seven-component guide (CI-enforced coverage, M2)
- [`docs/design/mocks/`](docs/design/mocks) — approved design mocks (CF-D4)

<!-- S3 scaffold CI verification PR marker -->
