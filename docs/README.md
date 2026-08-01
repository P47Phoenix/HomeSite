# HomeSite Documentation

## Conventions — what goes where (FR-08)

| Path | Contents |
|---|---|
| [`docs/components/component-guide.md`](components/component-guide.md) | One `## <ComponentName>` entry per component exported from `src/components/index.ts` — purpose, props, visual states. The CI docs-coverage gate enforces exact set equality between barrel exports and guide headings (M2, OQ-M3 name-based rule). |
| [`docs/architecture/architecture.md`](architecture/architecture.md) | Build + CI/CD architecture and the deploy hand-off contract (this repo builds/publishes the image; the Containers repo pins the tag and deploys). Cluster-side detail lives in the Containers repo. |
| [`docs/architecture/adr/`](architecture/adr/) | Architecture Decision Records. Numbering is a shared space across the HomeSite and Containers repos — see [`adr/README.md`](architecture/adr/README.md) before adding one; gaps in the local listing are intentional. |
| [`docs/design/mocks/`](design/mocks/) | The approved design mocks (`index.html`, `empty-state.html`, `max-content.html`), copied byte-identical from the design stage (CF-D4). They are the reference for the mock-fidelity check and the verbatim source of `src/styles/tokens.css` tokens — never edit them; a design change means new approved mocks. |

New documentation goes in the closest matching location above; if none fits, add the new
path to this table in the same PR that introduces it.

## Docs-with-code rule (NFR-10)

**Docs change in the same PR as the code they describe.** A PR that changes behavior,
components, build output, or serving/deploy config updates the affected docs in that
same PR — never in a follow-up. CI backs this with the docs-presence check (M8a) and the
component docs-coverage gate (M2); Dev DoD review backs the parts CI cannot check
(entry quality, architecture-doc accuracy).

## `behavior-change` PR label convention (OQ-M2 / M8b)

- **Label name:** exactly `behavior-change`.
- **Applies to:** any PR that changes **rendered output, build output, serving config, or
  cluster behavior**.
- **Excluded:** docs-only, test-only, comment-only, and CI-cosmetic PRs.
- **When:** applied **at PR creation time by the PR author** — this prospectively defines
  the M8b measurement denominator; reconstructing it later is prohibited.
- **Dev DoD checklist items:** (a) label applied if the PR is behavior-changing;
  (b) if labeled, docs are updated in the same PR (NFR-10). A labeled PR without a docs
  diff fails Dev DoD.
- **Verification (M8b, at UAT):** `prs_with_docs_change / behavior_changing_prs` over all
  `behavior-change`-labeled PRs must equal 100%; unlabeled merged PRs are spot-audited
  for missed labels.
