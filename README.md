# GLP-1 Pipeline Board

Frontend and data-model skeleton for tracking companies and development
programs related to GLP-1 receptor agonists and adjacent incretin therapies.

The project uses a minimal TPP-oriented dataset covering mechanism, platform,
indication, route, dosage form, dosing interval, development stage, and
development status. It is designed as a frontend foundation for future
source-based research and periodic updates.

The current dataset is empty: `data/pipeline-assets.json` contains `[]`.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Empty local JSON dataset

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
- Empty `data/pipeline-assets.json` ready for future source-based records

No scraping, authentication, backend, real database, alerts, or automation are
implemented in this skeleton.
