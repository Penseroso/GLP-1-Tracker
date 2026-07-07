# GLP-1 Pipeline Board

Frontend and data-model skeleton for tracking companies and development
programs related to GLP-1 receptor agonists and adjacent incretin therapies.

The project uses a minimal TPP-oriented dataset covering mechanism, platform,
indication, route, dosage form, dosing interval, development stage, and
development status. It is designed as a frontend foundation for future
source-based research and periodic updates.

The current dataset is empty:

- `data/companies.json` contains `[]`
- `data/pipeline-programs.json` contains `[]`

## Program Row Rule

- One program record represents one asset with one route, one dosage form, one development stage, and one development status.
- Programs with different routes, dosage forms, stages, or statuses must use separate records.
- Multiple indications may share one record only when their stage and status are the same.
- Records for the same asset share the same `assetId` and use different program `id` values.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Empty local JSON datasets

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Scope

- Overview dashboard
- Searchable and filterable pipeline program register
- Program detail drawer
- Empty company and program JSON files ready for future source-based records

No scraping, authentication, backend, real database, alerts, or automation are
implemented in this skeleton.
