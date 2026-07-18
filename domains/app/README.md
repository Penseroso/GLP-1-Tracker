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
  `domains/app/components/`.
- Application configuration is canonical at `domains/app/config/program-table.ts`.
- Display formatting is canonical at `domains/app/lib/format.ts`.
- The Application read-model tier is canonical at
  `domains/app/lib/clinical-evidence/selectors.ts` (Clinical Evidence read
  model) and `domains/app/lib/company-detail/read-model.ts` (cross-domain
  company composition).
- The Company/Pipeline selector read model remains canonical under
  `domains/company-pipeline/lib/` (Module 5).
- Module 9 removed the legacy `components/`, `config/program-table.ts`,
  `lib/format.ts`, `lib/clinical-evidence/selectors.ts`,
  `lib/company-detail/read-model.ts`, and `@/lib/programs/*` compatibility
  shims; routes and this domain's files import the canonical paths directly.
  The Tailwind content boundary now scans `domains/app/**` for the canonical
  UI source.

## Ownership boundary

Application/UI presentation and interaction, application configuration, the
cross-domain read-model tier, and display formatting are owned under this root;
`app/` remains root-pinned for the current Next.js architecture. Clinical UI
belongs to this domain, not to Clinical Evidence. The domain-modularization
migration is complete; there is no pending relocation.

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
Module 9 removed that legacy `docs/ui/` redirect. Module 9 completed the
Application/UI migration: it repointed every route and domain consumer off the
legacy `components/`, `config/`, `lib/format.ts`, read-model, and
`@/lib/programs/*` compatibility shims to their canonical `domains/app/` (and
`domains/company-pipeline/lib/`) paths, deleted the shims, and — via a
prerequisite remediation — repointed the Tailwind `content` boundary from the
obsolete `./components/**` glob to `./domains/app/**`. No route or UI-behavior
change beyond the intended Tailwind content-boundary correction.

## Authority boundaries

This README does not define routes, read-model semantics, UI behavior, or
data contracts beyond what is stated above. It does not supersede the UI
Reference, `AGENTS.md`, or the Company/Pipeline and Clinical Evidence
authorities, and it does not authorize a later move of `app/`.
