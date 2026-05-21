# Run 02 Company Refresh

Execute `docs/02_Company_Refresh_Protocol.md`.

Required input:
- `company` or `companyId`

If `company` or `companyId` is missing, return only:

```text
02_Company_Refresh_Protocol은 특정 회사 단위 refresh 프로토콜입니다. 조사할 기업명을 입력해 주세요. 예: `02 실행: QL Biopharm`
```

If `company` or `companyId` is provided:
- Research only that company.
- Resolve company metadata from `data/sources/companies.json` when available.
- Compare findings against `data/approved/pipeline-assets.json`.
- Generate candidate JSON only at `data/candidates/{companyId}.pipeline.refresh.candidate.json`.
- Record diffs, extraction notes, and unresolved questions.

Rules:
- Candidate data is not approved data.
- Do not modify `data/approved/pipeline-assets.json`.
- Do not modify frontend code.
- Do not add a database, GitHub API integration, authentication, or production persistence.
- CSV/manual files are fallback or override tools, not the primary source of truth.
