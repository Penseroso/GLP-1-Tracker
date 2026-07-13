# Clinical Evidence Research Workflow

Reusable workflow for researching and updating the separate Clinical Evidence
data layer. The clinical-evidence route is **active** (ADR-0035), triggered only
by explicit clinical-evidence intent per
[`docs/research-routing.md`](./research-routing.md).

The workflow is subordinate to:

- [`docs/research-routing.md`](./research-routing.md) for routing state.
- [`docs/clinical-evidence/README.md`](./clinical-evidence/README.md) for the
  Clinical Evidence data contract.
- [`docs/data-protocol/README.md`](./data-protocol/README.md) for Scope v1.1 and
  existing Company/Pipeline identity rules.

## 1. Input And Execution Boundary

The only required input is a company name, represented as `<COMPANY_NAME>`.
Examples of explicit intent include:

- `<COMPANY_NAME> clinical evidence research`
- `<COMPANY_NAME> 임상 조사`
- `<COMPANY_NAME> 임상 업데이트`
- `<COMPANY_NAME> semaglutide 임상 조사` — naming an asset alongside the
  company does not change the required input or introduce asset-to-company
  resolution; the company name is still what is supplied.

The exact routing rule — the strong-trigger / contextual-broad-trigger split —
is authoritative in [`docs/research-routing.md`](./research-routing.md); this
document does not restate it.

Do not ask for or require a mode, asset list, date, write flag, or approval
parameter. The request wording does not decide whether the run is an initial
Clinical Evidence investigation or update; the existing Clinical Evidence source
data does.

Before external research, inspect:

- `data/companies/<company-id>/company.json`
- `data/companies/<company-id>/pipeline-programs.json`
- `data/companies/<company-id>/regimens.json`
- `data/clinical-evidence/<company-id>/`
- `data/generated/clinical-evidence.json`

**Company/Pipeline Research runs first, in the same execution**, per
[`docs/research-routing.md`](./research-routing.md) — an initial investigation
if the company is absent from `data/companies/`, or a refresh if present.
Company/Pipeline Research has no separate staleness flag; it performs a full
discovery-and-verify pass on every invocation, so running it first covers both
the absent case and any staleness in existing data. Clinical Evidence Research
may use only the resulting Company/Pipeline source data as the authoritative
list of current Scope v1.1 assets. If Company/Pipeline Research cannot complete
(for example, a source-access failure), stop before any Clinical Evidence
source-data changes and report the blocker.

Immediately after Company/Pipeline Research completes, build a concise
in-session handoff manifest from the updated operating records. Each entry
contains only:

- `assetId`.
- `programId`.
- canonical asset name (`assetName`).
- route (`route`).
- indication scope (`indications`).
- development stage (`development.stage`), status (`development.status`), and
  operational state (`development.stageOperationalState`).
- unresolved conflicts (`unresolvedConflicts`) surfaced by the Company/Pipeline
  run.

Keep this manifest in memory for the current execution only. Do not persist a
new file, ledger, cache, schema, or generated artifact. Clinical traversal uses
the updated Company/Pipeline operating records as the authoritative source and
this manifest as its traversal index; do not repeatedly reload or restate the
full Company/Pipeline source corpus unless a clinical conflict requires deeper
inspection.

Clinical Evidence Research must not silently modify Company/Pipeline records. If
clinical research reveals a material conflict with an existing asset, program,
regimen, stage, or status, report the discrepancy and recommend a separate
Company/Pipeline refresh.

## 2. Asset Traversal

Use the updated Company/Pipeline operating records and the in-session handoff
manifest to identify and traverse the company's current Scope v1.1 assets. For
every existing in-scope asset:

1. Read any existing Clinical Evidence source file for the asset.
2. Discover relevant human interventional clinical studies broadly.
3. Classify every discovered study as one of:
   - **entered** - result-bearing, in scope, and represented in source data.
   - **not entered: result-bearing but not selected for the major evidence set**
     - result-bearing and in scope, but intentionally not stored because it does
       not belong to the asset's major current evidence set.
   - **excluded: no result** - no publicly disclosed study-specific result.
   - **excluded: outside Scope v1.1** - not relevant to obesity or weight
     management under the Clinical Evidence contract.
   - **deferred** - identity, result, source, or conflict remains unresolved.
4. Store only entered studies in operating data. Result-bearing studies not
   selected for the major evidence set must be reported but not entered.

Do not treat one chronologically latest trial as sufficient. Build the asset's
major current evidence set.

## 3. Major Evidence-Set Selection

Include:

- distinct result-bearing pivotal or confirmatory studies.
- the latest result-bearing study when no later-stage result exists.
- an earlier study that uniquely represents a route, formulation, regimen, dose
  strategy, or population.

Exclude:

- duplicate publications of the same study result.
- routine subanalyses.
- extension studies unless they add a distinct core endpoint, population, or
  treatment configuration.
- registered, planned, recruiting, or completed studies without disclosed
  study-specific results.
- protocol-only or design-only disclosures.
- studies outside the Clinical Evidence obesity/weight-management scope.

## 4. Sources And Updates

Default result-source priority:

1. peer-reviewed publication.
2. registry-posted results, including ClinicalTrials.gov.
3. conference presentation, poster, or abstract.
4. official company topline release.

Apply authority and recency together. An explicit correction or updated
authoritative result supersedes the prior value.

Outcome maturity follows the strongest source that directly supports the exact
recorded result, not the strongest source available for the Study generally.
Company-only results remain `topline`; a peer-reviewed Study publication upgrades
only the Outcomes whose exact values it supports. A maturity change does not
authorize filling statistical details that the supporting source does not report.

For the same semantic outcome:

- keep only the latest authoritative value in operating data.
- update the existing Study, Endpoint, and Outcome rather than creating a
  duplicate version.
- preserve useful historical source references for traceability.
- do not calculate derived efficacy values or fill unpublished statistical
  details.
- store adjusted or comparative values only when directly reported for the exact
  Arm set, analysis population, estimand, and timepoint.

When sources conflict and the hierarchy does not resolve the discrepancy, defer
the affected Outcome and report the conflict.

## 5. Extraction Rules

Populate the implemented `Study`, `Arm`, `Endpoint`, and `Outcome` structures in
`data/clinical-evidence/<company-id>/<asset-id>/clinical-evidence.json`.

- Store experimental, placebo, and active-comparator groups as parallel Arms.
- Store treatment and comparator arms using the same structure.
- Treat an Arm as a treatment configuration **within one study**, not a cohort or
  sub-study. If a platform trial's "cohort" is effectively a distinct sub-study
  (own population, endpoints, or focal asset), model it as its own Study —
  **provided that sub-study has its own distinct registry identity**. A master
  protocol that shares one registry identifier across multiple sub-studies, or
  covers multiple focal assets under one identifier, is **not representable** and is
  deferred (do not invent surrogate registry ids); see the README study-grouping
  note and ADR-0034.
- Capture required background or concomitant therapy in free text on
  `arm.intervention` / `arm.label` and `study.population`; it is not a structured
  field. A protocol-required standard-of-care background is not promoted to a
  regimen or a separate asset (ADR-0033).
- Model the same measure at different timepoints as **distinct Endpoint records**,
  one per timepoint — not one Endpoint with multiple Outcomes (`assessmentTimepoint`
  is excluded from the outcome semantic key).
- Set `analysisPopulation` to the actual analysis set used for the result. ITT,
  modified ITT, FAS, EAS, per-protocol, and safety populations are examples, not a
  whitelist; preserve other source-reported analysis-set terminology. Author the
  analysis set first and any subgroup second in parentheses. Never use an estimand
  label such as "Treatment-regimen estimand population" or "Efficacy estimand
  population" as the analysis population.
- Store the separately source-reported estimand or intercurrent-event strategy in
  `estimand`, including treatment-policy, treatment-regimen, modified
  treatment-regimen, efficacy, hypothetical, or other directly reported wording.
  This is not a closed vocabulary. Do not infer an estimand absent from the source.
- When a source directly reports multiple estimands for the same Study, Endpoint,
  protocol-defined Arm set, and timepoint, create a separate Outcome for each.
  Source-supported differences in `estimand` or `analysisPopulation` are not
  duplicates.
- For a `between-arm` Outcome, reference every compared protocol-defined Arm, use
  `resultType: between-arm`, and populate `comparisonType` with both the effect
  measure and reference direction (e.g. "Least-squares mean difference, treatment
  minus placebo"). Preserve a result sign consistent with that direction. Include
  confidence intervals or p-values only when directly reported for that exact
  comparison. Arm-array order does not carry direction and does not make a distinct
  Outcome.
- Capture only directly source-reported arm-level or between-arm values. Do not
  calculate treatment differences from arm-level values, infer confidence intervals
  or p-values, transcribe values visually from charts, distribute pooled results
  across Arms, or attach subgroup results to broader Arms that do not faithfully
  represent the subgroup.
- Store only endpoints with disclosed results.
- Keep efficacy outcomes source-reported.
- Store only a concise study-level safety summary covering major adverse-event
  patterns, serious adverse events, discontinuation, or notable safety signals
  when reported.
- Do not reproduce exhaustive adverse-event tables.
- Do not enter a Study unless it has at least one Arm, Endpoint, and Outcome.
- Do not enter an Endpoint unless at least one Outcome is available.

### 5.1 Unrepresentable results and deferred structure

If pooled analysis groups, starting-dose subgroups, substudy/cohort structure, or
ambiguous multi-asset anchoring cannot be represented without changing the meaning,
omit the result. Do not create artificial Arms, calculate or redistribute values,
or force a subgroup or focal-asset mapping. Record the limitation in the execution
report and classify it as a deferred schema decision rather than an operating-data
defect.

The unresolved candidates are documented separately in
`docs/data-protocol/edge-cases.md` and ADR-0036:

- substudy and cohort representation.
- protocol-defined Arm versus pooled or derived analysis group.
- multi-focal or external-asset study anchoring.

These candidates require a future contract decision; this workflow does not
prescribe or implement a schema shape.

## 6. Record Creation And Replacement

Create asset-level source files only under:

```text
data/clinical-evidence/<company-id>/<asset-id>/clinical-evidence.json
```

Use stable IDs. Reuse existing Study, Arm, Endpoint, and Outcome IDs when
updating a previously entered study or semantic outcome. Do not create parallel
Outcome records for superseded result versions.

Deduplicate Arms and Endpoints **before** creating them: if an existing Arm already
describes the same real-world treatment configuration, or an existing Endpoint the
same measure at the same timepoint, reuse its id rather than minting a second
surrogate id. Semantically duplicate Arm/Endpoint records under different ids
silently defeat outcome duplicate detection; the validator blocks only the obvious
identical case, so reuse is the primary control.

Outcome semantic identity comprises `studyId`, `endpointId`, the order-insensitive
protocol-defined Arm set, `analysisPopulation`, `estimand`, `resultType`, and
comparison direction when applicable via `comparisonType`. Do not use Arm array
ordering as direction. Replace a result in place only when this full semantic
identity is unchanged and the newer source supersedes the recorded value.

When a value changes:

- update the relevant record's verification metadata.
- add or update supporting source references.
- preserve useful prior source references.

When a study is rechecked without value changes:

- keep stable IDs.
- update verification metadata only where the source was actually rechecked.

## 7. Required Completion

Each execution must:

1. inspect existing company and Clinical Evidence source data.
2. research all in-scope assets.
3. update company/asset Clinical Evidence source files when valid evidence is
   found.
4. run `npm run data:generate`.
5. run:
   - `npm run data:validate:clinical-evidence`
   - `npm run data:validate:clinical-evidence:generated`
   - `npm run data:validate:clinical-evidence:synthetic`
   - `npm run data:validate:generated`
6. report entered, updated, not-entered result-bearing, excluded, deferred, and
   conflicting studies.

If current external sources cannot be accessed, do not claim Clinical Evidence
Research was completed and do not modify Clinical Evidence source data. If
Company/Pipeline Research (§1) already completed with valid changes earlier in
this execution, retain those changes — a Clinical Evidence source-access
failure never rolls back completed Company/Pipeline changes — and report the
run as partially completed: the Company/Pipeline portion done, the Clinical
Evidence portion not completed.

## 8. Final Reporting

The final response must communicate:

- whether this was treated as an initial Clinical Evidence investigation or an
  update.
- the company and assets traversed.
- studies entered or updated.
- result-bearing studies not entered because they were not selected for the
  major evidence set.
- studies excluded for no result.
- studies excluded as outside Scope v1.1.
- studies deferred, with reasons.
- omitted results and deferred schema limitations, distinguished from operating-data
  defects.
- pipeline discrepancies or conflicts requiring Company/Pipeline refresh.
- generated aggregate and validation results.
- blockers or evidence-access failures.
- whether the run is fully completed or partially completed (Company/Pipeline
  portion done, Clinical Evidence portion blocked by a source-access failure).

There is no rigid table format. Choose a concise form appropriate to the
company and asset complexity.

## 9. Non-Goals

This workflow does not introduce:

- routing logic beyond what `AGENTS.md` and
  [`docs/research-routing.md`](./research-routing.md) already define; this
  document governs Clinical Evidence extraction and entry, not routing rules.
- Company/Pipeline record edits — the Company/Pipeline Research step that runs
  first follows its own workflow and edit rules, not this one.
- schema, type, validator, source-layout, or aggregate-shape changes.
- UI or comparison logic.
- real clinical evidence collection by documentation alone.
