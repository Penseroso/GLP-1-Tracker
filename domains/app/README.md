---
role: application-ui-migration-entrypoint
status: active
authority: non-authoritative
update-boundary: Update only when Application/UI migration ownership or status changes.
---

# Application/UI Domain

This README is a **non-authoritative migration entrypoint**. Current authority
remains at the paths linked below; see the
[UI Reference](../../domains/app/docs/README.md) for routes, read-model
boundaries, and user-visible data semantics.

## Current ownership

- Routes, read-model boundaries, and user-visible data semantics are defined
  in the [UI Reference](docs/README.md) (moved here in Module 6).
- Routing and page composition remain in `app/`. Module 6 resolved D6:
  Next.js App Router only resolves `app/` at the repository root or under
  `src/`; there is no config option to relocate it under a domain root.
  `app/` is root-pinned for the current Next.js architecture and for the
  remainder of this migration program. A future framework-level restructure
  (e.g. adopting `src/`) may revisit this; no later move-only module may
  relocate it.
- Presentation and interaction, including clinical UI, are canonical under
  `domains/app/components/`. The legacy `components/` paths are
  compatibility shims.
- Application configuration is canonical at `domains/app/config/program-table.ts`;
  the legacy `config/program-table.ts` is a compatibility shim.
- Display formatting is canonical at `domains/app/lib/format.ts`; the legacy
  `lib/format.ts` is a compatibility shim.
- The Application read-model tier is canonical at
  `domains/app/lib/clinical-evidence/selectors.ts` (Clinical Evidence read
  model) and `domains/app/lib/company-detail/read-model.ts` (cross-domain
  company composition). Their legacy `lib/clinical-evidence/selectors.ts`
  and `lib/company-detail/read-model.ts` paths are compatibility shims.
- The Company/Pipeline selector read model remains canonical under
  `domains/company-pipeline/lib/` (Module 5); this domain's files still
  import it through the legacy `@/lib/programs/*` shim paths, deferred to
  Module 9 cleanup.

## Intended future ownership

Later migration modules may place additional settled presentation,
interaction, and application configuration under this root. Clinical UI
belongs to this domain, not to Clinical Evidence.

## Migration status

Module 1 created this entrypoint. Module 2 recorded Application/UI ownership
of `lib/format.ts` without moving it. Module 5 resolved D5's ownership
question — Company/Pipeline's selector read model moved to its domain
library, while `lib/clinical-evidence/selectors.ts` and
`lib/company-detail/read-model.ts` were classified Application/UI-owned but
deferred to M6. Module 6 physically moved `components/**`,
`config/program-table.ts`, `lib/format.ts`, and both deferred read-model
files to `domains/app/`, leaving compatibility shims at every legacy path,
and resolved D6: `app/` is root-pinned for the current architecture and
program, not relocatable under a domain root without a framework
restructure. `docs/ui/README.md` moved to `docs/README.md` under this root;
the old path is now a compatibility redirect.

## Authority boundaries

This README does not define routes, read-model semantics, UI behavior, or
data contracts beyond what is stated above. It does not supersede the UI
Reference, `AGENTS.md`, or the Company/Pipeline and Clinical Evidence
authorities, and it does not authorize a later move of `app/`.
