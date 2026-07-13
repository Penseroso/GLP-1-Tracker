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

The route triggers only on **explicit clinical-evidence intent** — terms such
as `임상`, `clinical`, `trial`, `시험`, `endpoint`, `results`, or `결과`
accompanying a company name — per the exact rules in
[`docs/research-routing.md`](docs/research-routing.md) (ADR-0027). This applies
to variations such as:

- `<COMPANY_NAME> clinical trial research.`
- `<COMPANY_NAME> 임상 조사.`
- `<COMPANY_NAME> 임상 업데이트.`
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
- If external sources for either portion cannot be accessed, the run stops
  before any operating-data changes and reports the access failure; do not
  claim research was completed.
- Executing the workflow includes external research, operating-record creation
  or update, aggregate regeneration, the required validation, and final
  reporting, per
  [`prompts/research-clinical-evidence.md`](prompts/research-clinical-evidence.md)
  and [`docs/clinical-evidence-workflow.md`](docs/clinical-evidence-workflow.md).
  Follow those; do not reimplement the workflow from this router.
