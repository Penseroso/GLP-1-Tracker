---
role: company-pipeline-migration-entrypoint
status: active
authority: non-authoritative
update-boundary: Update only when Company/Pipeline migration ownership or status changes.
---

# Company/Pipeline Domain

This README is a **non-authoritative migration entrypoint**. Current authority
remains at the canonical repository paths linked below; temporary compatibility
entrypoints remain at the legacy paths until a later migration module removes
them.

## Current ownership

- Company/Pipeline scope and contract ownership are canonical in the
  [Data Protocol](./docs/README.md).
- Research execution is canonical in the
  [Company/Pipeline Research Workflow](./docs/research-workflow.md).
- Company/Pipeline types, loaders, filters, portfolio logic, constants, and the
  selector read model are canonical under `domains/company-pipeline/lib/`. Their
  legacy `lib/programs/` paths are temporary compatibility shims.
- `asset-alias-types.json` remains in `lib/programs/` pending the separate D3
  boundary.
- Editable Company/Pipeline data (`data/companies/`), the controlled
  vocabularies (`data/registries/`), the synthetic fixtures
  (`data/validation-fixtures/synthetic/`), and the Company/Pipeline generated
  aggregates (`data/generated/{companies,pipeline-programs,regimens}.json`) are
  Company/Pipeline-owned (Module 7, D4). They are **temporarily retained** at
  their existing `data/` paths: physical relocation depends on the D3
  generator/validator restructure and on the shared multi-domain
  `data/generated/` sink, and is deferred to a post-Module-8 execution module.

## Intended future ownership

Later migration modules may place remaining settled Company/Pipeline code,
editable data, fixtures, and domain-owned generated artifacts under this root.
Each relocation requires its own approved module and validation boundary.

## Migration status

Module 1 created this entrypoint. Module 2 resolved D2: `ComponentReference`
remains Company/Pipeline-owned, while `RecordMetadata` and `SourceReference`
are shared provenance types. Module 3 moved the settled authoritative
documentation and the types, loaders, filters, portfolio logic, and constants
while preserving legacy import and documentation entrypoints. Module 5 resolved
D5 for Company/Pipeline: the selector read model moved into
`domains/company-pipeline/lib/` byte-identically behind a compatibility shim,
with no data, validator, generator, or generated-output change. Module 6
resolved D6 (Application/UI phase): `app/` is root-pinned for the current
Next.js architecture and this migration program, not relocatable under a
domain root. Module 7 decision-resolved D4: it assigned semantic domain
ownership of source data, registries, fixtures, and generated outputs (see
Current ownership) but moved no file. Data has no compatibility-shim mechanism
(it is read by filesystem path in `scripts/data-registry.mjs`), so physical
relocation cannot precede the D3 generator/validator restructure and the split
of the shared `data/generated/` sink; D4 physical execution is therefore
deferred to a post-Module-8 execution module. D3 remains unresolved (Module 8).

## Authority boundaries

This README does not define or change Company/Pipeline Contract, Scope, schema,
or projection versions. It does not supersede the Data Protocol, the research
workflow, `AGENTS.md`, or any authority linked from them, and it does not
authorize a later move.
