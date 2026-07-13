# Research Routing

Authoritative routing boundary for research requests. This document decides
which research workflow a natural-language request may enter. It does not define
the Company/Pipeline Research protocol or the Clinical Evidence Research
protocol. Two research workflows are currently executable: Company/Pipeline
Research (the default) and Clinical Evidence Research (explicit-intent only,
activated by ADR-0035 after the Preflight A and Preflight B readiness gates).

## Current executable routes

**Company/Pipeline Research**, implemented by
[`../prompts/research-company.md`](../prompts/research-company.md) and governed
by [`research-workflow.md`](./research-workflow.md) and the data protocol, is
the default route for any generic company request.

Generic company requests route to Company/Pipeline Research, including:

- `<COMPANY_NAME> 조사`
- `<COMPANY_NAME> 업데이트`
- `<COMPANY_NAME> refresh`
- natural-language equivalents such as research, investigate, review, update,
  or refresh a named company.

The existing Company/Pipeline Research behavior is unchanged. A generic company
request must not automatically expand into detailed clinical-trial design,
endpoint, result, efficacy, or safety extraction.

## Clinical Evidence route

Requests with explicit clinical-evidence intent route to **Clinical Evidence
Research**, implemented by
[`../prompts/research-clinical-evidence.md`](../prompts/research-clinical-evidence.md)
and governed by
[`clinical-evidence-workflow.md`](./clinical-evidence-workflow.md) and the
semantic contract at
[`clinical-evidence/README.md`](./clinical-evidence/README.md). This route is
**active**. Activation is recorded in ADR-0035, contingent on the Preflight A
(`docs/clinical-evidence/architecture-preflight-a.md`) and Preflight B
(ADR-0034) readiness gates, both of which concluded no schema, validator, or
contract change was required to begin.

Explicit clinical-evidence intent is determined by two tiers of terms, not a
flat list (ADR-0035 correction):

**Strong triggers** — any one of these, present anywhere in the request, is
explicit clinical-evidence intent on its own:

- `임상`
- `임상시험`
- `clinical`
- `clinical trial`
- `trial`
- `endpoint`
- `NCT` (an NCT registry identifier such as `NCT12345678`, or the bare token)

**Contextual (broad) triggers** — these terms are ambiguous by themselves and
trigger clinical-evidence intent only when the same request also contains a
strong trigger, or one of `study`, `efficacy`, or `safety`:

- `시험`
- `results`
- `결과`

A broad term with no clinical context does **not** trigger Clinical Evidence
Research. This keeps non-clinical business language on the Company/Pipeline
route: `실적`/`결과` (earnings/results) and `시험` (test, e.g. a manufacturing
or production test) are common outside clinical contexts and must not
misroute a request by themselves.

Examples that trigger Clinical Evidence Research (Company/Pipeline Research
runs first in each case, per the combined order below):

- `Novo Nordisk 임상 조사`
- `Novo Nordisk semaglutide 임상 조사` — naming an asset alongside the company
  does not change the required input or introduce asset-to-company
  resolution; the company name (`Novo Nordisk`) is still what is supplied.
- `Novo Nordisk 주요 임상시험 조사`
- `Novo Nordisk clinical trial results`

Examples that do **not** trigger Clinical Evidence Research (route to
Company/Pipeline Research only, per the ambiguous-input default below):

- `Novo Nordisk 분기 실적 결과 검토` (quarterly earnings results review —
  `결과` with no clinical context)
- `Novo Nordisk 시험 생산 결과 조사` (manufacturing test-production results
  research — `시험`/`결과` with no clinical context)

Routing rules for the active route:

- do not route explicit clinical-evidence requests to
  [`../prompts/research-company.md`](../prompts/research-company.md) as a
  substitute for Clinical Evidence Research; the Company/Pipeline Research
  portion of the combined order below still uses that workflow.
- do not claim Clinical Evidence Research was completed unless the full
  [`../prompts/research-clinical-evidence.md`](../prompts/research-clinical-evidence.md)
  workflow — including validation and reporting — actually ran to completion.
- do not create study, arm, endpoint, outcome, efficacy, or safety schemas as
  part of routing; routing decides which workflow runs, it does not modify the
  Clinical Evidence contract.

## Combined company and clinical intent

An explicit clinical-evidence request always also names a company (the
Clinical Evidence workflow's only required input), so this order is the normal
case for that route, not an edge case:

1. **Company/Pipeline Research runs first**, in the same execution, via
   [`../prompts/research-company.md`](../prompts/research-company.md) —
   an initial investigation when the company is absent from
   `data/companies/`, or a refresh when present. Company/Pipeline Research has
   no separate staleness flag: it performs a full discovery-and-verify pass on
   every invocation, so running it first is how both the absent case and any
   staleness in existing data are covered before Clinical Evidence Research
   depends on that data as its authoritative asset list.
2. **Clinical Evidence Research runs second**, via
   [`../prompts/research-clinical-evidence.md`](../prompts/research-clinical-evidence.md),
   using the now-current Company/Pipeline data.

Clinical Evidence Research must never silently edit Company/Pipeline data. A
material conflict discovered during clinical research is reported and
recommended for a separate Company/Pipeline refresh, not written directly to
Company/Pipeline records (`docs/clinical-evidence-workflow.md` §1, §6).

Failure handling is sequential, matching the execution order above — not a
single all-or-nothing gate (ADR-0035 correction):

- If Company/Pipeline Research cannot access required sources, the run stops
  before any operating-data change — neither Company/Pipeline nor Clinical
  Evidence data is modified — and reports the access failure.
- If Company/Pipeline Research completes and makes valid Company/Pipeline
  changes, but Clinical Evidence source access then fails, the already-
  completed Company/Pipeline changes are **retained**, no Clinical Evidence
  data is changed, and the run is reported as **partially completed**: the
  Company/Pipeline portion done, the Clinical Evidence portion not completed.
  A later Clinical Evidence access failure never rolls back completed
  Company/Pipeline changes.

In both cases, do not claim the Clinical Evidence portion was completed unless
it actually ran to completion.

## Ambiguous input default

When clinical-evidence intent is not explicit, route ambiguous research,
investigation, review, refresh, or update requests for a named company to
Company/Pipeline Research.

Never infer Clinical Evidence Research from a generic company request.
