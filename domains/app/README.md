---
role: application-ui-migration-entrypoint
status: active
authority: non-authoritative
update-boundary: Update only when Application/UI migration ownership or status changes.
---

# Application/UI Domain

This README is a **non-authoritative migration entrypoint**. Current authority
remains at the existing repository paths linked below until a later migration
module completes.

## Current ownership

- Routes, read-model boundaries, and user-visible data semantics remain in the
  [UI Reference](../../docs/ui/README.md).
- Routing and page composition remain in `app/`.
- Presentation and interaction, including clinical UI, remain in `components/`.
- Application configuration remains in `config/`.
- The Company/Pipeline selector read model is canonical under
  `domains/company-pipeline/lib/` (Module 5). The Application read-model tier —
  `lib/clinical-evidence/selectors.ts` and `lib/company-detail/read-model.ts` —
  is Application/UI-owned and remains at its existing `lib/` paths, moving in the
  Application/UI phase (M6).
- Display formatting remains at `lib/format.ts`. Module 2 identifies it as
  Application/UI-owned but defers its physical move and compatibility shim to
  the Application/UI phase.

## Intended future ownership

Later migration modules may place settled presentation, interaction, and
application configuration under this root. Clinical UI belongs to this domain,
not to Clinical Evidence.

## Migration status

Module 1 created this entrypoint. Module 2 recorded Application/UI ownership of
`lib/format.ts` without moving it or changing its consumers; at that stage, no
route, selector, read model, loader, data consumer, or configuration moved.
Module 5 resolved D5: the Company/Pipeline selector read model moved to its domain
library, while `lib/clinical-evidence/selectors.ts` (Clinical Evidence read
model) and `lib/company-detail/read-model.ts` (cross-domain company composition)
are Application/UI-owned and deferred to M6. The framework-pinned `app/`
destination (D6) remains unresolved.

## Authority boundaries

This README does not define routes, read-model semantics, UI behavior, or data
contracts. It does not supersede the UI Reference, `AGENTS.md`, or the
Company/Pipeline and Clinical Evidence authorities, and it does not authorize a
later move.
