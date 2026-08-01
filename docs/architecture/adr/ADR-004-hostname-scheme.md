# ADR-004: Public DNS name resolving to the private ingress VIP (Route53 A record)

## Status

Accepted — 2026-07-31 (decided at Architecture §5, run-2026-07-31-hsite; authored into
this repo at S5 per the ADR ledger). The exact label (`homesite.` vs `lab.` vs
`www.home.`) is an operator sign-off item on the ADR-001 checklist;
`homesite.home.theconnellyfamily.info` is the **working placeholder** in all artifacts
until then — a different choice is a find-and-replace before first certificate issuance,
with no design impact.

## Context

The site needs one stable hostname that resolves for LAN clients **regardless of
configured resolver** (PRD F13) — including devices pinned to public DNS (8.8.8.8 etc.)
and routers with DNS-rebind protection at default settings. Additionally, the TLS
decision (ADR-001, ACME DNS-01) requires a real public-DNS domain. The Route53 zone
`theconnellyfamily.info` already exists, is paid for, and carries live DDNS automation —
no new SaaS or cost.

## Decision

Create a public **A record** `homesite.home.theconnellyfamily.info` (placeholder label) →
the ingress controller's MetalLB VIP (RFC1918 address), TTL 300, in the existing Route53
zone.

- Committed representation: the record (with the label + apex CAA records from ADR-001)
  lives in the Containers repo at `dns/homesite-records.json` as one documented
  `aws route53 change-resource-record-sets` change-batch — zone state rebuilds from git,
  not memory. It is created with the operator's own credentials, never the sealed
  cert-manager key (whose IAM conditions forbid A-record writes by design).
- Expected router accommodation: UniFi rebind protection drops RFC1918 answers in
  forwarded responses by default, so the reachability drill (M6) is planned as "will need
  the documented UniFi allow-list exception", re-verified after router firmware updates or
  factory resets (event-triggered, not scheduled).

## Consequences

### Positive

- Resolver-agnostic (F13): public-resolver clients never touch the router; router-DNS
  clients forward upstream (with the rebind exception applied).
- Enables ACME DNS-01 issuance (ADR-001) with no additional DNS constraint.
- One stable address for the site regardless of cluster-internal changes; the VIP itself
  is pinned in the committed ingress values (Containers repo).

### Negative

- The hostname and its RFC1918 address become permanent public records in DNS and
  Certificate Transparency logs — informational disclosure only (LAN-only service, no
  inbound path); an ADR-001 operator sign-off item. Wildcard certificate is the
  documented mitigation if the label should later be hidden from CT logs.
- **WAN-down availability exclusion:** public Route53 is the only resolution path — during
  a WAN/ISP outage, LAN clients lose resolution after their cached record's TTL (300 s)
  expires, even though every serving component is healthy. Accepted as a documented
  exclusion; WAN-caused failures are annotated as excluded from the LAN-only availability
  SLO. Optional degraded path: a UniFi local DNS record for router-DNS clients, which must
  never diverge from the public record.

## Alternatives considered

| Alternative | Reason rejected |
|---|---|
| Split-horizon: LAN-only DNS zone | Devices pinned to public DNS never resolve it — fails F13 outright |
| Raw IP, no hostname | Rejects host-routed ingress and any ACME path |

## Related

- ADR-001 (TLS mechanism — requires this scheme; owns the CAA records and the disclosure
  sign-off items); ADR-003 (zero-JS prerender).
- ADR numbering is shared across two repos — see this directory's `README.md` numbering note.
