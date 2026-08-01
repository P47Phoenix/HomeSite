# HomeSite Documentation

Conventions — what goes where (FR-08):

| Path | Contents |
|---|---|
| `docs/components/component-guide.md` | One `## <ComponentName>` section per component exported from `src/components/index.ts`. The CI docs-coverage gate enforces exact set equality between barrel exports and guide headings (OQ-M3, name-based rule). |
| `docs/architecture/architecture.md` | Build + CI/CD architecture and the deploy hand-off contract (copied from the delivery pipeline's architecture document; cluster-side detail lives in the Containers repo). |
| `docs/architecture/adr/` | Architecture Decision Records for future decisions in this repo. |

## Behavior-change label convention (M8b)

Any PR that changes rendered output, build output, serving config, or cluster behavior
must carry the `behavior-change` label, applied at PR creation time by the author.
A labeled PR must update docs in the same PR (NFR-10). Docs-only, test-only,
comment-only, and CI-cosmetic PRs are excluded. Full convention detail lands with S5.
