# Agent Entry Instructions

This file routes natural-language requests to the correct workflow. It is a
router only - it does not restate the research protocol. The authoritative
routing boundary is [`docs/research-routing.md`](docs/research-routing.md).

## Company research router

Any natural-language request whose intent is to **research, investigate,
review, refresh, or update** a named company must execute the complete
workflow in [`prompts/research-company.md`](prompts/research-company.md), unless
the request contains explicit clinical-evidence intent routed by
[`docs/research-routing.md`](docs/research-routing.md) to the Clinical Evidence
router below.

This applies to variations such as:

- `Research Zealand Pharma.`
- `Investigate Zealand Pharma.`
- `Update Zealand Pharma.`
- equivalent natural-language requests in other languages.

When such a request is received:

- The company name is the only required input. Do not ask for or expect any
  other parameter.
- The agent decides automatically whether to perform an initial investigation
  or a refresh, based on the existing data - not on the request wording.
- Executing the workflow includes external research, operating-record creation
  or update, aggregate regeneration, the required validation, and final
  reporting.
- The detailed rules remain authoritative in
  [`prompts/research-company.md`](prompts/research-company.md) and its
  referenced documents ([`docs/data-protocol/README.md`](docs/data-protocol/README.md)
  and [`docs/research-workflow.md`](docs/research-workflow.md)). Follow those; do
  not reimplement the workflow from this router.

## Clinical Evidence research router

Any natural-language request whose intent is to **research, investigate,
review, refresh, or update** a named company's clinical trial evidence must
execute the complete workflow in
[`prompts/research-clinical-evidence.md`](prompts/research-clinical-evidence.md).
This route is active; the readiness gate (Preflight A and Preflight B) is
satisfied and recorded in ADR-0035.

The route triggers only on **explicit clinical-evidence intent** accompanying
a company name: a strong trigger (`임상`, `임상시험`, `clinical`,
`clinical trial`, `trial`, `endpoint`, `NCT`) alone, or a broad term (`시험`,
`results`, `결과`) only when it co-occurs with clinical context (a strong
trigger, or `study`, `efficacy`, `safety`). A broad term with no clinical
context — an earnings-results review, a manufacturing test-production report —
does not trigger this route. The exact two-tier rule and worked non-triggering
examples are authoritative in
[`docs/research-routing.md`](docs/research-routing.md) (ADR-0027, ADR-0035).
This applies to variations such as:

- `<COMPANY_NAME> clinical trial research.`
- `<COMPANY_NAME> 임상 조사.`
- `<COMPANY_NAME> 임상 업데이트.`
- `<COMPANY_NAME> semaglutide 임상 조사.` — naming an asset alongside the
  company does not change the required input or introduce asset-to-company
  resolution.
- equivalent natural-language requests in other languages.

Ambiguous company-research requests with no explicit clinical-evidence intent
always default to the Company research router above. A generic company
request never automatically expands into Clinical Evidence Research.

When an explicit clinical-evidence request is received:

- The company name is the only required input. Do not ask for or expect any
  other parameter.
- **Company/Pipeline Research runs first, in the same execution**, via
  [`prompts/research-company.md`](prompts/research-company.md): an initial
  investigation if the company is absent from `data/companies/`, or a refresh
  if present. This protocol has no separate staleness flag — Company/Pipeline
  Research performs a full discovery-and-verify pass on every invocation, so
  running it first is how both the absent and the stale case are covered.
  Clinical Evidence Research then proceeds using the resulting Company/Pipeline
  data as the authoritative asset list.
- Clinical Evidence Research **never silently edits Company/Pipeline data**. A
  material conflict discovered during clinical research is reported, not
  written to Company/Pipeline records.
- The agent decides automatically whether the Clinical Evidence portion is an
  initial investigation or an update, based on existing Clinical Evidence
  source data - not on the request wording.
- Failure handling is sequential, not a single all-or-nothing gate: if
  Company/Pipeline Research itself cannot access required sources, the run
  stops before any operating-data change (neither Company/Pipeline nor
  Clinical Evidence data is modified). If Company/Pipeline Research completes
  with valid changes but Clinical Evidence source access then fails, those
  completed Company/Pipeline changes are **retained** — not rolled back — no
  Clinical Evidence data is changed, and the run is reported as **partially
  completed**.
- Executing the workflow includes external research, operating-record creation
  or update, aggregate regeneration, the required validation, and final
  reporting, per
  [`prompts/research-clinical-evidence.md`](prompts/research-clinical-evidence.md)
  and [`docs/clinical-evidence-workflow.md`](docs/clinical-evidence-workflow.md).
  Follow those; do not reimplement the workflow from this router.
