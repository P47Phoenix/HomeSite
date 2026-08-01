# HomeSite Architecture (build + CI/CD)

> Scaffold placeholder (S3). At S5 this file receives, verbatim, sections §1 (site build
> architecture), §2 (CI/CD) and the deploy hand-off contract from the delivery pipeline's
> architecture document. Cluster-side deployment detail (Helm chart, TLS, DNS, monitoring)
> is owned by the Containers repo and is summarized there, not here.

## Summary (until S5 copy lands)

- **Toolchain:** Vite 6 + React 18 + TypeScript (strict). React is a build-time templating
  engine only: `scripts/prerender.tsx` renders the page with `renderToStaticMarkup` and the
  shipped artifact is pure HTML+CSS — **zero JavaScript** is emitted to `dist/`.
- **Content contract:** `src/content/services.json`, validated against
  `src/content/services.schema.json` at build time; violations fail the build by name.
- **CI (fail-fast order):** typecheck/lint → unit (coverage ≥ 80%, threshold in vitest
  config) → integration → build + gates (bundle ≤ 250 KB gzipped JS, docs coverage,
  docs presence) → e2e (Playwright vs `vite preview` of `dist/`) → secret scan +
  workflow-posture asserts.
- **Deploy hand-off:** CI publishes `ghcr.io/p47phoenix/homesite` images (S6); the
  Containers repo pins the image by tag **and** digest and owns the deployment.
