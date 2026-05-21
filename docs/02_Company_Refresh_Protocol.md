# GLP-1 Pipeline Tracker Company Refresh Protocol

**Version:** v0.1  
**Last updated:** 2026-05-21  
**Purpose:** Known company 단위로 GLP-1 및 incretin pipeline 정보를 재조사하고, 기존 approved dataset 대비 변경 후보와 QA 대상 diff를 생성하기 위한 local-first refresh protocol

---

## 1. Relationship To 01

`01_Pipeline_Research_Protocol.md`는 broad initial screening / universe building protocol이다. GLP-1 및 관련 incretin pipeline universe를 넓게 찾고 회사별 candidate JSON을 만드는 데 사용한다.

`02_Company_Refresh_Protocol.md`는 single-company refresh / update / diff generation protocol이다. 이미 알고 있는 특정 회사 하나만 대상으로 최신 source를 확인하고, 기존 approved dataset과 비교해 candidate refresh JSON을 만든다.

02는 approved data를 직접 수정하지 않는다. 모든 결과는 local QA workflow에서 검토되어야 하며, 승인 전까지 candidate data로만 취급한다.

---

## 2. Required Input Gate

02는 특정 회사 단위 refresh protocol이다. 실행 요청에 `company` 또는 `companyId`가 반드시 포함되어야 한다.

사용자가 “02 실행”, “Run 02”, “Execute 02”처럼 회사명이나 `companyId` 없이 요청하면 agent는 즉시 중단하고 아래 문장만 반환한다.

```text
02_Company_Refresh_Protocol은 특정 회사 단위 refresh 프로토콜입니다. 조사할 기업명을 입력해 주세요. 예: `02 실행: QL Biopharm`
```

이 경우 agent는 다음 행동을 해서는 안 된다.

- web research
- local file creation
- candidate file update
- approved data modification
- frontend code modification

---

## 3. Required Inputs

회사명 또는 `companyId`가 제공되면 다음 입력을 사용한다.

| Input | Required | Description | Example |
|---|---:|---|---|
| `company` | One of company/companyId | 조사 대상 회사명 | `QL Biopharm` |
| `companyId` | One of company/companyId | local source registry의 회사 id | `qlbiopharm` |
| `refreshReason` | No | refresh 사유 | `monthly check`, `press release follow-up` |

---

## 4. Source Resolution

1. `data/sources/companies.json`에서 `companyId`, `company`, aliases를 기준으로 회사를 찾는다.
2. registry entry가 있으면 `officialWebsite`, `pipelineUrl`, `aliases`, `priority`, `notes`를 source seed로 사용한다.
3. registry entry가 없으면 사용자가 제공한 회사명을 그대로 사용하되, `extractionNotes`에 registry miss를 기록한다.
4. refresh 대상은 반드시 하나의 회사로 제한한다. 다른 회사 asset은 deal, partnership, comparator context로만 언급하고 별도 asset candidate로 만들지 않는다.

---

## 5. Research Scope

Research agent 또는 scraper는 대상 회사에 대해서만 다음 source를 확인한다.

1. 회사 공식 pipeline page
2. 회사 investor presentation 또는 IR deck
3. 공식 press release
4. ClinicalTrials.gov 또는 주요 임상시험 등록 사이트
5. FDA/EMA 등 규제기관 문서
6. SEC filing 또는 annual report
7. peer-reviewed paper
8. conference abstract
9. 신뢰 가능한 산업/언론 기사

source priority와 field vocabulary는 `docs/01_Pipeline_Research_Protocol.md`의 기준을 따른다.

---

## 6. Comparison Base

Refresh 결과는 다음 approved dataset과 비교한다.

```text
data/approved/pipeline-assets.json
```

비교는 대상 회사 asset만 대상으로 한다. 비교 시 확인할 항목:

- new asset candidate
- removed or no longer listed asset
- stage change
- indication change
- route, dosageForm, dosingInterval change
- status change
- sourceUrl change
- confidence or uncertainty change
- assetName/codeName/id mismatch

---

## 7. Candidate Output

02 refresh 결과는 다음 파일에만 저장한다.

```text
data/candidates/{companyId}.pipeline.refresh.candidate.json
```

예:

```text
data/candidates/qlbiopharm.pipeline.refresh.candidate.json
```

이 파일은 approved data가 아니다. Local QA page가 이 candidate file을 표시하고, 사용자가 승인한 asset만 `data/approved/pipeline-assets.json`으로 반영할 수 있다.

---

## 8. Candidate Schema

Refresh candidate file은 다음 구조를 따른다.

```json
{
  "company": "QL Biopharm",
  "companyId": "qlbiopharm",
  "sourceUrl": "https://www.qlbiopharm.com/en/pipelines.html",
  "checkedAt": "2026-05-21",
  "refreshMode": "single-company",
  "comparisonBase": "data/approved/pipeline-assets.json",
  "summary": {
    "status": "Needs review",
    "newAssets": 0,
    "updatedAssets": 0,
    "removedOrNoLongerListedAssets": 0,
    "unchangedAssets": 0,
    "notes": ""
  },
  "assets": [],
  "diffs": [],
  "extractionNotes": [],
  "unresolvedQuestions": []
}
```

### 8.1 Asset candidates

`assets[]`는 `docs/01_Pipeline_Research_Protocol.md`의 asset candidate schema와 field vocabulary를 따른다. 자동 추출된 asset의 기본 `qaStatus`는 `Needs review`이다. 강한 구조 검증과 공식 출처 매칭을 통과한 경우에만 `Auto-pass`를 사용할 수 있다.

### 8.2 Diff records

`diffs[]`는 approved dataset 대비 변경 후보를 기록한다.

```json
{
  "type": "updated",
  "assetId": "qlbiopharm-zt002",
  "field": "stage",
  "approvedValue": "Phase 1",
  "candidateValue": "Phase 2",
  "sourceUrl": "https://www.qlbiopharm.com/en/pipelines.html",
  "confidence": "High",
  "qaStatus": "Needs review",
  "notes": "Stage changed on company pipeline page."
}
```

Recommended diff `type` values:

```text
new
updated
unchanged
removed
no-longer-listed
conflict
```

---

## 9. QA Rules

- Automatically extracted refresh data must not be treated as approved until it passes QA or is manually approved.
- `data/approved/pipeline-assets.json` must not be modified by the research step.
- `Needs review` and `Rejected` candidates must not appear in approved data.
- `Auto-pass` means automated checks passed, not final approval.
- If `sourceUrl` is unavailable, `confidence` must be `Low`, `qaStatus` must be `Needs review`, and `notes` must explain that the source is pending.
- If a company no longer lists an approved asset, do not delete it directly. Emit a `no-longer-listed` diff and set the candidate status to `No longer listed` when appropriate.

---

## 10. Output Constraints

During 02 execution, the agent may create or update only the target company refresh candidate file under `data/candidates/`.

The agent must not:

- modify `data/approved/pipeline-assets.json`
- modify frontend UI code
- add a database
- call GitHub APIs for persistence
- add authentication
- create production persistence
- research unrelated companies as separate targets

---

## 11. Local QA Workflow

Expected local-first workflow:

1. Agent generates `data/candidates/{companyId}.pipeline.refresh.candidate.json`.
2. Local QA page displays candidate assets and diffs.
3. User approves or rejects candidates locally.
4. Approved assets are written into `data/approved/pipeline-assets.json`.
5. Normal Assets page displays only approved data.

Manual CSV files remain fallback or override tools, not the primary source of truth.

---

## 12. Revision Log

| Version | Date | Changes |
|---|---|---|
| v0.1 | 2026-05-21 | Initial single-company refresh protocol |
