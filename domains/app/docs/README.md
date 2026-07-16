---
role: ui-reference
status: active
authority: authoritative
update-boundary: Update when routes, read-model boundaries, user-visible data semantics, or standing UI validation requirements change; not for routine styling edits.
---

# UI Reference

Canonical reference for the current UI surface and its data-consumption
boundaries. Historical UI audits are not part of the implementation path.

## Routes and ownership

| Route | Primary responsibility |
| --- | --- |
| `/` | Portfolio overview and summary views |
| `/assets` | Searchable/filterable program register |
| `/companies/[companyId]` | Company detail and associated clinical inventory |
| `/assets/[companyId]/[assetId]` | Focal and linked studies for an asset |
| `/studies/[studyId]` | Study, arms, endpoints, outcomes, and source detail |

`app/` owns routing and page composition; it is root-pinned for the current
Next.js architecture and this migration program (Module 6 resolved D6 — the
App Router only resolves `app/` at the repository root or under `src/`, and
no config repoints it under a domain root; a future framework-level
restructure could revisit this, but no later move-only module may relocate
`app/`). `domains/app/components/` owns presentation and interaction
(`components/*` legacy paths are compatibility shims). `domains/company-pipeline/lib/`
owns the Company/Pipeline read model (`lib/programs/selectors.ts` is a
compatibility shim); `domains/clinical-evidence/lib/` owns Clinical Evidence
types and loading. The Application read-model tier —
`domains/app/lib/company-detail/read-model.ts` (cross-domain company
composition) and `domains/app/lib/clinical-evidence/selectors.ts` (Clinical
Evidence read model) — moved here in Module 6; their legacy `lib/company-detail/`
and `lib/clinical-evidence/selectors.ts` paths are now compatibility shims.
`domains/app/config/program-table.ts` and `domains/app/lib/format.ts` are
likewise canonical, with `config/program-table.ts` and `lib/format.ts` as
shims. Components must not read editable source JSON directly.

Within `domains/app/`, files import each other and the read-model tier
through canonical `@/domains/app/...` paths. Imports into
Company/Pipeline-owned code (`@/lib/programs/*`) still go through their
legacy shim paths pending Module 9 cleanup; `domains/app/lib/clinical-evidence/selectors.ts`
temporarily reads through the legacy `@/lib/clinical-evidence/data`
compatibility entrypoint to preserve the current `eslint.config.mjs`
import boundary. Module 9 must repoint this dependency and remove or
update the carve-out when compatibility shims are cleaned up.

## Data boundaries

- UI reads generated artifacts through typed loaders and selectors.
- Program-specific clinical retrieval uses explicit `Study.programId`; it does
  not infer a relationship from asset, indication, title, or source URL.
- Asset views may use the generated focal/linked asset-study projection.
- Missing optional values render through shared formatting; `N/A` is never
  stored in source data.
- Outcome existence alone determines whether a Study has recorded results.
  User-facing empty copy is **“No recorded outcomes.”** It does not claim that
  no public result exists.
- Clinical stage and regulatory milestone presentation must preserve the
  distinctions supplied by the Company/Pipeline contract.

## Change boundary

Update this reference for a new/removed route, a changed read-model owner, a
new inference rule, or changed user-visible meaning. Do not update it for local
spacing, color, or component refactors that preserve those boundaries.

Validate UI changes with `npm run lint`, `npm run build`, and relevant data
validators when data consumption changes.
