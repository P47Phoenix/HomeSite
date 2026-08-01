# HomeSite Architecture

**Scope of this document (FR-07 / A-3):** the site's build architecture and CI/CD pipeline —
the parts this repo owns. Cluster-side deployment (Helm chart, ingress, TLS, DNS, monitoring)
is owned by the **Containers repo** (`https://github.com/P47Phoenix/Containers`) and is only
summarized here in the [deploy hand-off](#3-deploy-hand-off-contract-two-repo-seam) section.

Adapted from the delivery pipeline's architecture document
(`Containers/.delivery/artifacts/04-architect/solution/architecture.md`, rev 5,
run-2026-07-31-hsite), sections §1 and §2, per its copy instruction.

## Decision state

Decisions already made are built on here, not reopened.

| Element | State | Where decided |
|---|---|---|
| React + TypeScript, static site, build-time prerender, no-JS graceful rendering | Decided | PRD FR-01; design stage ("SSG resolves no-JS") |
| Site = "Connelly Lab" landing page; 7-component inventory; design tokens from approved mocks | Decided | Operator decision 1; mocks approved (M3 gate) |
| `services.json` drives ServiceGrid; content-not-code; ships inside the image | Decided | Design board; A-6 |
| Two-repo seam: HomeSite builds/publishes, Containers deploys pinned tag | Decided | A-3 / OQ-R5 |
| GHCR **public** image; no pull secret anywhere | Decided | Operator decision 3 |
| TLS mechanism: ACME DNS-01 via cert-manager + Route53 | **Decided — ADR-001 (Accepted)** | [`adr/ADR-001-tls-mechanism.md`](adr/ADR-001-tls-mechanism.md) |
| Zero-JS build-time prerender (no hydration bundle) | Decided — ADR-003 | [`adr/ADR-003-zero-js-prerender.md`](adr/ADR-003-zero-js-prerender.md) |
| Hostname scheme: public DNS → private ingress VIP | Decided — ADR-004 | [`adr/ADR-004-hostname-scheme.md`](adr/ADR-004-hostname-scheme.md) |
| Shared-ingress hardening; secret bootstrap (sealed-secrets) | Decided — ADR-002 / ADR-005 | Containers repo (see [`adr/README.md`](adr/README.md) numbering note) |

## 1. Site build architecture

**Toolchain: Vite 6 + React 18 + TypeScript (strict).** Vite is the mainstream React+TS
toolchain with first-class static builds, content-hashed asset filenames out of the box
(FR-02), and trivial CI integration.

**SSG approach — build-time prerender, zero client JS by default** (ADR-003). The approved
design is seven presentational components with no state, no routing, no forms, and a hard
no-JS requirement (E5: all content in served HTML, anchors need no JS). Therefore:

- A build script (`scripts/prerender.tsx`, run after `vite build`) calls
  `ReactDOMServer.renderToStaticMarkup(<App services={services}/>)` and writes the complete
  HTML document into `dist/index.html`; CSS is extracted to a content-hashed file.
- **No hydration bundle is shipped.** React is a build-time templating engine; the served
  page is pure HTML+CSS. JS may be added later as progressive enhancement only, and the CI
  size gate applies from the first byte.
- This satisfies E5 by construction (a no-JS user gets 100% of the page) and makes NFR-5
  trivially green (initial JS ≈ 0 KB of the 250 KB budget).
- Rejected alternatives: Next.js static export (framework weight, server-runtime concepts
  unneeded for one page); vike/vite-plugin-ssr (extra dependency for routing we don't
  have); client-rendered SPA (violates E5).

**services.json config contract.** Canonical path `src/content/services.json`; TypeScript
type `Service` exactly as pinned in the component guide (`name`, `href`, `description`,
`monogram`, `category?`). Contract enforcement:

- A JSON Schema (`src/content/services.schema.json`) mirrors the `Service` type; the build
  fails on violation with the violating field named (missing description, monogram length
  > 2, non-absolute href).
- Imported at build time only — content bakes into the prerendered HTML (A-6; no ConfigMap
  split; the immutable image is the artifact under test).
- Content change workflow: edit JSON → PR → CI build → new image tag → tag bump in the
  Containers repo (FR-14 "one operation" is the Containers-side helm upgrade).

**Bundle budget enforcement (M10/NFR-5):** a CI step (`scripts/check-bundle-size.mjs`)
gzips the JS under `dist/` and fails when total gzipped JS > 250 KB, naming the measured
size. The threshold lives in this repo, versioned with code (M4 pattern).

**Cache policy (FR-02/F6):** `index.html` served `Cache-Control: no-cache`; `/assets/*`
(content-hashed) served `Cache-Control: public, max-age=31536000, immutable`. Set in the
serving nginx config inside the image (S6) so the policy is versioned with the site.

**Repo layout:**

```
HomeSite/
├── src/
│   ├── components/            # SiteHeader, ServiceGrid, ServiceCard, MonogramBadge,
│   │   └── index.ts           # CategoryHeading, EmptyState, SiteFooter — barrel is the
│   │                          # authoritative export list for the docs-coverage gate
│   ├── content/
│   │   ├── services.json      # operator-owned Service inventory
│   │   └── services.schema.json
│   ├── styles/tokens.css      # design tokens verbatim from approved mocks
│   └── App.tsx
├── scripts/
│   ├── prerender.tsx          # SSG entry (renderToStaticMarkup → dist/index.html)
│   ├── validate-content.ts    # services.json schema gate (build step)
│   └── check-*.{mjs,sh}       # CI gates: bundle size, docs coverage, docs presence,
│                              # workflow security
├── tests/
│   ├── unit/                  # Vitest + RTL (≥ 80% line coverage, config-enforced)
│   ├── integration/           # composed full-page assembly (not renamed unit tests)
│   ├── e2e/                   # Playwright vs `vite preview` of built dist/
│   └── fixtures/              # default / empty / max-content services fixtures (CF-D3)
├── docs/                      # FR-08 tree — see docs/README.md for conventions
│   ├── README.md
│   ├── components/component-guide.md    # FR-03/M2 — CI-enforced coverage
│   ├── architecture/architecture.md     # this document (FR-07)
│   ├── architecture/adr/                # ADRs (see adr/README.md numbering note)
│   └── design/mocks/          # approved design mocks (CF-D4)
├── .github/workflows/ci.yml   # test pyramid + gates (+ publish, S6)
├── .github/dependabot.yml     # npm / docker / github-actions ecosystems
└── package.json / tsconfig.json (strict) / vite.config.ts / vitest.config.ts
```

## 2. CI/CD

**This repo builds and publishes; it never deploys.** CI runs on GitHub-hosted x86_64
runners (`ubuntu-latest`) — deliberately independent of the cluster it deploys to (the
self-hosted ARM64 runners belong to the Containers repo and are not used here).

Pipeline stages (single workflow, fail-fast order — test pyramid below build/publish):

1. `npm ci` → `tsc --noEmit` (strict) → lint
2. Unit tests + coverage gate ≥ 80% line (threshold in `vitest.config.ts`, versioned with
   code, not CI YAML — M4)
3. Integration tests (composed full-page assembly)
4. Build (`vite build` + prerender) → bundle-size gate (M10) → docs-coverage gate (M2:
   barrel exports vs `## <ComponentName>` headings in the component guide, name-based
   set-equality rule — OQ-M3) → docs-presence check (M8a)
5. E2E (Playwright vs `vite preview` of the built `dist/`)
6. Secret scan (gitleaks — FR-15a) + workflow-security grep-asserts
7. **Multi-arch image build & publish** (main branch only, S6): QEMU + buildx,
   `platforms: linux/amd64,linux/arm64`, push to `ghcr.io/p47phoenix/homesite`
   (**public** — operator decision 3, no pull secret anywhere). The build stage is declared
   `FROM --platform=$BUILDPLATFORM node:<digest> AS build`, so the npm/vite build executes
   exactly once, natively on the amd64 runner; each per-platform runtime stage only COPYs
   `dist/` from it (avoids the QEMU-emulated build risk, R1).

**Public-image content disclosure (accepted with eyes open):** the public image contains
the prerendered HTML with the full `services.json` inventory baked in — service names,
descriptions, and RFC1918 `href`s. Anyone on the internet can pull it and read the
household's internal service map; gitleaks structurally cannot flag it (IPs/hostnames are
not credentials). Consequence of operator decision 3, recorded on the ADR-001 sign-off
checklist; the documented mitigation, if ever wanted, is a private image + GHCR pull
secret (deliberately not taken in v1). Keep `services.json` descriptions non-sensitive.

**CI security posture (SEC-06/SEC-07):** all workflows declare top-level
`permissions: contents: read`; only the publish job elevates to `packages: write`, gated
to `github.ref == 'refs/heads/main'` and `github.event_name != 'pull_request'`. No
`pull_request_target` trigger anywhere in the repo (CI grep-assert). All third-party
actions pinned to full commit SHAs, kept current by Dependabot's `github-actions`
ecosystem. Dependabot covers `npm`, `docker`, and `github-actions`; no auto-merge — every
bump PR runs the full CI pyramid and is operator-merged.

**Base-image freshness (FR-16 as amended, PA-1):** base images are digest-pinned in the
Dockerfile, so a scheduled rebuild lands zero CVE fixes by construction. FR-16 compliance
is therefore defined as: **a Dependabot base-image digest-bump PR is reviewed and merged
at least monthly whenever one is open**, followed by the normal Containers bump PR. Any
scheduled rebuild workflow is a build-health verification only, self-labeled as such.

**Image tagging (immutable, digest-pinned):** every publish tags `sha-<12-char-git-sha>`
(the deploy pin) plus a moving `main` tag for humans. Deploys reference only `sha-*` tags;
tags are never reused or force-pushed; `latest` is never deployed. Because registry tags
are mutable by convention only, the committed Helm values in the Containers repo pin the
image by **tag AND digest** (see hand-off contract below). The Dockerfile likewise pins
both `FROM` stages by digest; freshness arrives via reviewed Dependabot digest-bump PRs,
never silent tag drift (SEC-05).

## 3. Deploy hand-off contract (two-repo seam)

**HomeSite publishes; the Containers repo pins the tag and owns the deployment.**

| Contract element | Value |
|---|---|
| Image | `ghcr.io/p47phoenix/homesite` (public GHCR, no pull secret) |
| Deploy pin | `sha-<12-char-git-sha>@sha256:<digest>` — the digest is the cryptographic pin, the tag is for humans |
| Pin location | `helm/charts/homesite/values.yaml` in the Containers repo (one values line) |
| Hand-off mechanism | Manual bump PR by the operator against the Containers repo; the CI publish job summary prints tag + digest for copy-paste |
| Bump-PR guard | Containers CI required status check on a GitHub-hosted runner: `crane digest ghcr.io/p47phoenix/homesite:sha-<gitsha>` must equal the committed digest — a mismatch blocks the merge (paste-error guard, F-10) |
| Deploy operation | Operator-run `helm upgrade --install homesite ./helm/charts/homesite -n homesite --create-namespace` from the Containers repo — no CD, no cross-repo automation token |
| Rollback | One invocation of the Containers repo's `helm/charts/homesite/rollback.sh` (revert bump commit + helm rerun + push/PR, with a loud `UNPUSHED REVERT DEPLOYED` marker on push failure) |
| Never deployed | `latest`, bare `main`, any tag without its digest |

**Cluster-side detail lives in the Containers repo, not here.** Summary for orientation
only: the site runs as a 2-replica Deployment (hostname topology spread, PDB) in namespace
`homesite` on the Talos ARM64 cluster, served through the shared ingress-nginx controller
behind a pinned MetalLB L2 VIP; TLS is issued by cert-manager via ACME DNS-01 with Route53
(ADR-001) at the hostname decided in ADR-004; dual-vantage blackbox probes + Prometheus
alerting watch it. For the Helm chart, ingress/MetalLB values, DNS records, secrets, and
monitoring manifests, see the Containers repo (`helm/charts/homesite`, `helm/releases/`,
`dns/`, `monitoring/`).
