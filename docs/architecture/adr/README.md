# Architecture Decision Records

One entry per accepted decision. New ADRs: copy the section shape of an existing file
(Status / Context / Decision / Consequences / Alternatives considered), take the next
free number in the shared ledger below, and land the ADR in the same PR as the change it
governs (NFR-10).

## Cross-repo numbering note (read before adding an ADR)

The ADR **numbering is one shared number space across two repositories** — this repo
(HomeSite) and the Containers repo, which owns cluster-side deployment. The sequence
deliberately interleaves; the gaps in this directory's listing (no 002, no 005) are
**intentional, not missing files**, and nothing here is ever renumbered:

| ADR | Title | Lives in |
|---|---|---|
| ADR-001 | TLS mechanism — ACME DNS-01 via cert-manager + Route53 | **HomeSite** (`ADR-001-tls-mechanism.md`, copied verbatim from the pipeline artifact) |
| ADR-002 | Shared ingress-nginx + controller hardening | Containers repo docs |
| ADR-003 | Zero-JS build-time prerender | **HomeSite** (`ADR-003-zero-js-prerender.md`) |
| ADR-004 | Hostname scheme — public DNS → private ingress VIP | **HomeSite** (`ADR-004-hostname-scheme.md`) |
| ADR-005 | Secret bootstrap — sealed-secrets | Containers repo docs |

Source ledger: pipeline architecture document Follow-Up #3 (run-2026-07-31-hsite).
