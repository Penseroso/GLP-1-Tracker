# Run 01 Initial Screening

Execute `docs/01_Pipeline_Research_Protocol.md`.

Purpose:
- Run broad GLP-1 / incretin pipeline universe screening.
- Discover relevant companies and candidate assets.
- Generate candidate JSON files only.

Rules:
- Use `data/sources/companies.json` as the local seed list when available.
- Write research outputs only to `data/candidates/*.pipeline.candidate.json`.
- Candidate data is not approved data.
- Do not modify `data/approved/pipeline-assets.json`.
- Do not modify frontend code.
- Do not add a database, GitHub API integration, authentication, or production persistence.
- CSV/manual files are fallback or override tools, not the primary source of truth.

Expected output:
- Candidate JSON files that follow the schema in `docs/01_Pipeline_Research_Protocol.md`.
- `extractionNotes` and `unresolvedQuestions` must capture uncertainty and follow-up needs.
