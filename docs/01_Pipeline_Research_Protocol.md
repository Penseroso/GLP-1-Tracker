# GLP-1 Pipeline Tracker Research Protocol

**Version:** v0.2  
**Last updated:** 2026-05-21  
**Purpose:** GLP-1 및 관련 incretin 기반 대사질환 파이프라인을 AI-assisted research, automated extraction, QA, 승인 데이터셋 생성 기준에 따라 조사하고 관리하기 위한 운영 지침서

---

## 1. Purpose

GLP-1 Pipeline Tracker는 공개 자료 기반으로 GLP-1 및 관련 incretin 계열 파이프라인을 asset 단위로 정리하고, 회사별·기전별·적응증별·투여경로별·개발단계별로 검색 및 비교할 수 있도록 설계된 리서치 보드이다.

본 지침서는 **manual data entry guide**가 아니라 **research agent and QA protocol for GLP-1 pipeline extraction**이다. Codex, research agents, scrapers, QA reviewers는 이 문서를 기준으로 어떤 회사를 조사할지, 어떤 출처를 확인할지, 후보 데이터를 어떤 JSON 구조로 출력할지, 불확실성과 충돌 정보를 어떻게 QA할지 결정한다.

본 지침서는 다음 목적을 가진다.

- AI research agent와 scraper가 회사별 pipeline 정보를 동일한 기준으로 조사하도록 함
- 자동 추출 결과를 candidate JSON으로 구조화하고, QA 결과를 별도 JSON으로 기록하도록 함
- 승인된 데이터셋과 미승인 후보 데이터를 명확히 분리함
- 출처 신뢰도, 불확실성, 미공개 정보, 충돌 정보에 대한 QA 기준을 정의함
- 수동 CSV 편집은 primary source of truth가 아니라 override/fallback workflow로 제한함

자동 추출 데이터는 QA를 통과하거나 수동 승인되기 전까지 승인 데이터로 취급하지 않는다.

---

## 2. Scope

### 2.1 Included asset classes

다음 asset은 조사 대상에 포함한다.

- GLP-1 receptor agonist
- GLP-1/GIP dual agonist
- GLP-1/glucagon dual agonist
- GLP-1/GIP/glucagon triple agonist
- GLP-1/amylin 또는 incretin-related combination asset
- Oral GLP-1 계열
- Long-acting injectable GLP-1 계열
- Alternative delivery route GLP-1 asset
  - Intranasal
  - Transdermal
  - Microneedle
  - Implant/depot
  - Other non-conventional delivery systems
- GLP-1 기반 obesity, type 2 diabetes, MASH, cardiometabolic disease pipeline

### 2.2 Excluded assets

다음 asset은 원칙적으로 제외한다.

- GLP-1 또는 incretin 계열과 직접 관련이 없는 대사질환 치료제
- 단순 marketed product로서 개발 pipeline 정보가 없는 경우
- 출처가 불명확한 루머성 asset
- 회사 공식 자료, 임상 등록 정보, 규제 문서, 논문, 보도자료 등으로 확인되지 않는 asset
- 동일 asset의 중복 후보
  - 단, 적응증별 개발단계가 명확히 다른 경우 별도 candidate asset으로 분리 가능

---

## 3. Unit of Extraction

기본 추출 단위는 **company-level candidate file**이며, 그 안의 기본 데이터 단위는 **asset candidate**이다.

원칙적으로 `assets[]`의 각 항목은 하나의 asset candidate를 의미한다.

예외적으로 다음 경우에는 하나의 asset을 여러 asset candidate로 분리할 수 있다.

- 동일 asset이 적응증별로 개발단계가 명확히 다른 경우
- 동일 asset이 제형/투여경로별로 별도 개발되는 경우
- 동일 코드명이지만 formulation 또는 route가 달라 별도 전략적 의미가 있는 경우

예시:

| 상황 | 추출 방식 |
|---|---|
| 동일 GLP-1RA가 obesity와 T2D 모두 Phase 2 | 하나의 asset candidate, `indication`: `["Obesity", "Type 2 diabetes"]` |
| 동일 GLP-1RA가 obesity Phase 2, MASH Phase 1 | 적응증별 별도 asset candidate 가능 |
| 동일 asset의 SC injection과 oral tablet이 별도 개발 | route/formulation별 별도 asset candidate 권장 |

JSON outputs에서는 복수값을 delimited string으로 만들지 않는다. 복수값은 배열로 출력한다.

---

## 4. Data Flow and File Roles

### 4.1 Primary research inputs

조사 대상 회사와 seed source는 다음 파일에서 관리한다.

```text
data/sources/companies.json
```

이 파일은 research agent와 scraper의 입력 큐 역할을 한다. 회사명, 공식 웹사이트, pipeline page 후보, investor relations page, known aliases, priority 등을 포함할 수 있다.

### 4.2 Candidate extraction outputs

회사별 자동 추출 후보는 다음 위치에 저장한다.

```text
data/candidates/*.pipeline.candidate.json
```

Candidate file은 자동 추출 결과이며 승인 데이터가 아니다. candidate file은 source coverage, extraction assumptions, unresolved questions를 함께 포함해야 한다.

### 4.3 QA outputs

QA 결과는 다음 위치에 저장한다.

```text
data/qa/*.pipeline.qa.json
```

QA file은 candidate asset별 검토 결과, rejection reason, required follow-up, approval decision을 기록한다.

### 4.4 Approved dataset

앱과 downstream analysis가 기준 데이터로 사용할 승인 데이터셋은 다음 파일이다.

```text
data/approved/pipeline-assets.json
```

이 파일에는 QA를 통과했거나 사람이 수동 승인한 asset만 포함한다. `data/candidates/*.pipeline.candidate.json`의 내용은 QA 또는 manual approval 없이 이 파일로 승격할 수 없다.

### 4.5 Manual override layer

수동 보정이 필요한 경우 다음 CSV를 optional override layer로 사용한다.

```text
data/manual/pipeline_assets_overrides.csv
```

Manual override는 자동 추출과 QA workflow를 대체하지 않는다. 사용 목적은 잘못 병합된 asset 수정, 표시명 보정, id 안정화, 일시적 sourceUrl pending 처리, reviewer decision 반영 등으로 제한한다.

권장 흐름:

```text
data/sources/companies.json
    -> research agent / scraper
    -> data/candidates/*.pipeline.candidate.json
    -> QA review
    -> data/qa/*.pipeline.qa.json
    -> approved merge
    -> data/approved/pipeline-assets.json
    -> optional manual overrides
    -> frontend / analysis
```

---

## 5. Candidate Output Schema

각 회사별 candidate file은 다음 구조를 따른다.

```json
{
  "company": "QL Biopharm",
  "sourceUrl": "https://www.qlbiopharm.com/en/pipelines.html",
  "checkedAt": "2026-05-21",
  "assets": [],
  "extractionNotes": [],
  "unresolvedQuestions": []
}
```

### 5.1 Company-level fields

| Field | Required | Definition | Example |
|---|---:|---|---|
| `company` | Yes | 조사 대상 회사명 | `QL Biopharm` |
| `sourceUrl` | Yes | 회사-level extraction의 primary source URL | `https://www.qlbiopharm.com/en/pipelines.html` |
| `checkedAt` | Yes | 회사 후보 파일을 생성하거나 갱신한 날짜 | `2026-05-21` |
| `assets` | Yes | 추출된 asset candidate 배열 | `[]` |
| `extractionNotes` | Yes | source coverage, parser limitation, image/PDF interpretation 등 추출 과정 메모 | `["Pipeline table parsed from company page"]` |
| `unresolvedQuestions` | Yes | QA reviewer 또는 다음 research pass가 해결해야 할 질문 | `["Confirm whether ZT002 obesity and T2D share the same stage"]` |

### 5.2 Asset candidate schema

각 `assets[]` 항목은 다음 필드를 포함한다.

```json
{
  "id": "qlbiopharm-zt002",
  "company": "QL Biopharm",
  "assetName": "Zovaglutide Injection",
  "codeName": "ZT002",
  "targetClass": "GLP-1 receptor agonist",
  "mechanism": "Long-acting GLP-1 receptor agonism",
  "indication": ["Obesity"],
  "route": ["Subcutaneous"],
  "dosageForm": "Injection",
  "dosingInterval": "Monthly",
  "stage": "Phase 2",
  "stageRaw": "Phase II",
  "differentiator": "Once-monthly GLP-1RA",
  "description": "Long-acting GLP-1 receptor agonist for obesity",
  "sourceType": "Pipeline page",
  "sourceUrl": "https://www.qlbiopharm.com/en/pipelines.html",
  "lastChecked": "2026-05-21",
  "confidence": "High",
  "status": "Active",
  "qaStatus": "Needs review",
  "notes": "Stage taken from company pipeline page."
}
```

### 5.3 Asset field definitions

| Field | Required | Definition | Example |
|---|---:|---|---|
| `id` | Yes | 앱 내부 고유 식별자. 화면 표시명이 아니라 데이터 추적용 키이며 한 번 정하면 변경하지 않음 | `qlbiopharm-zt002` |
| `company` | Yes | 개발 회사명 | `QL Biopharm` |
| `assetName` | Yes | 화면에 표시할 대표 asset명. 제품명, 공개 asset명, 또는 표시용 이름 | `Zovaglutide Injection` |
| `codeName` | No | 회사가 쓰는 개발 코드명 또는 프로젝트 코드. 표시용 이름과 다를 수 있음 | `ZT002` |
| `targetClass` | Yes | 표준화된 약물 계열 또는 target 조합 | `GLP-1 receptor agonist` |
| `mechanism` | No | 작용 기전의 상세 설명. targetClass보다 구체적으로 작성 | `Long-acting GLP-1 receptor agonism` |
| `indication` | Yes | 개발 적응증. JSON에서는 복수값을 배열로 입력 | `["Obesity", "Type 2 diabetes"]` |
| `route` | No | 투여경로. 복수값 가능성이 있으면 배열로 입력 | `["Subcutaneous"]` |
| `dosageForm` | No | 제형 | `Injection` |
| `dosingInterval` | No | 투여주기 | `Weekly` |
| `stage` | Yes | 정규화된 개발단계 | `Phase 2` |
| `stageRaw` | No | 원문에 기재된 개발단계 표현 | `Phase II clinical trial` |
| `differentiator` | No | 핵심 차별화 포인트 | `Once-monthly GLP-1RA` |
| `description` | No | 상세 설명 | `Long-acting GLP-1 receptor agonist for obesity` |
| `sourceType` | No | 근거 자료 유형 | `Pipeline page` |
| `sourceUrl` | Yes | asset-level 근거 URL | `https://...` |
| `lastChecked` | Yes | 최종 확인일 | `2026-05-21` |
| `confidence` | No | 근거 신뢰도 | `High` |
| `status` | No | 개발 상태 | `Active` |
| `qaStatus` | Yes | QA workflow 상태 | `Needs review` |
| `notes` | No | 내부 메모, 불확실성, 확인 필요 사항 | `Stage inferred from pipeline chart` |

---

## 6. Identifier Rules

### 6.1 `id`

`id`는 앱 내부에서 asset을 추적하기 위한 고유 키이다.

권장 형식:

```text
companyslug-codename
```

예시:

```text
qlbiopharm-zt002
structure-gsbr1290
viking-vk2735
amgen-amg133
```

규칙:

- 소문자 사용
- 공백 대신 하이픈 사용
- 특수문자 사용 금지
- 회사명 또는 asset명이 바뀌어도 `id`는 유지
- 동일 asset이 적응증별로 분리되는 경우 suffix 사용 가능
  - `company-asset-obesity`
  - `company-asset-mash`

### 6.2 `assetName` vs `codeName` vs `id`

| Field | Role | Example |
|---|---|---|
| `assetName` | 사용자가 화면에서 보는 대표 표시명. 제품명, 공개 asset명, 또는 코드 기반 표시명을 입력한다. | `Zovaglutide Injection` |
| `codeName` | 회사 내부 개발 코드, 임상 코드, 또는 프로젝트 코드. 공개 표시명과 별도로 추적할 때 사용한다. | `ZT002` |
| `id` | 앱 내부 고유 식별자. 표시용 값이 아니며 rename, 라이선스, 브랜드 변경이 있어도 안정적으로 유지한다. | `qlbiopharm-zt002` |

입력 원칙:

- 제품명 또는 공개 asset명이 있으면 `assetName`에 입력한다.
- 개발 코드가 별도로 있으면 `codeName`에 입력한다.
- 코드명만 공개된 경우 `assetName`과 `codeName`을 동일하게 입력해도 된다.
- `id`는 `assetName`이나 `codeName`을 그대로 복사하는 필드가 아니다. 중복 없이 안정적인 slug를 만들고, 이후 표시명이 바뀌어도 유지한다.
- 제형 정보가 asset 식별에 중요하면 `assetName`에 포함할 수 있다.
  - 예: `ZT006 Tablets`, `ZT001 Injection`

---

## 7. Standardized Vocabulary

### 7.1 Development stage

`stage`에는 아래 값 중 하나를 사용한다.

```text
Discovery
Preclinical
IND-enabling
Phase 1
Phase 2
Phase 3
Filed
Approved
Unknown
```

원문 표현은 `stageRaw`에 입력한다.

원문이 `Phase 2a`, `Phase 2b`, `Phase 1/2`, `Phase 2/3`처럼 세부 단계나 복합 단계를 제시하는 경우, `stageRaw`에는 원문 텍스트를 그대로 보존하고 `stage`에는 가장 가까운 정규화 단계를 입력한다. 복합 단계는 성숙도를 과대평가하지 않도록 낮은 단계로 매핑한다.

예시:

| stage | stageRaw |
|---|---|
| `Phase 2` | `Phase II` |
| `Phase 2` | `Phase 2a` |
| `Phase 2` | `Phase 2b` |
| `Phase 1` | `Phase 1/2` |
| `Phase 2` | `Phase 2/3` |
| `IND-enabling` | `IND-enabling studies` |
| `Preclinical` | `Preclinical candidate selected` |
| `Unknown` | `Pipeline chart only, no stage disclosed` |

### 7.2 Target class

권장 표현:

```text
GLP-1 receptor agonist
GLP-1/GIP dual agonist
GLP-1/glucagon dual agonist
GLP-1/GIP/glucagon triple agonist
GLP-1/amylin combination
Oral small-molecule GLP-1 receptor agonist
GLP-1-based combination therapy
Other incretin-related therapy
```

`targetClass`와 `mechanism`은 다음처럼 구분한다.

- `targetClass`는 asset을 분류하고 필터링하기 위한 표준 계열명이다. 가능한 한 위 권장 표현 중 하나를 사용한다.
- `mechanism`은 해당 asset이 어떻게 작용하는지 설명하는 상세 문구이다. 지속형, biased agonism, receptor agonism/antagonism, conjugate, combination 구성 등 분류명만으로 부족한 내용을 적는다.
- 예: `targetClass`는 `GLP-1/GIP dual agonist`, `mechanism`은 `Dual GLP-1 and GIP receptor agonism with once-weekly subcutaneous dosing`처럼 작성한다.

### 7.3 Indication

권장 표현:

```text
Obesity
Type 2 diabetes
MASH
MASLD
Cardiometabolic disease
Chronic weight management
Heart failure
Chronic kidney disease
Alzheimer's disease
Other
```

JSON outputs에서는 복수 적응증을 배열로 입력한다.

```json
["Obesity", "Type 2 diabetes"]
```

CSV/manual override files에서만 복수값을 semicolon `;`으로 구분한다.

```text
Obesity; Type 2 diabetes
```

Markdown 표 안에서는 pipe character `|`가 열 구분자로 해석되므로, 데이터 예시나 설명 문구의 복수값 구분에는 `|`를 사용하지 않는다.

### 7.4 Route

권장 표현:

```text
Oral
Subcutaneous
Intranasal
Transdermal
Intravenous
Implant
Microneedle
Unknown
```

JSON outputs에서 복수 route 가능성이 있으면 배열로 입력한다.

### 7.5 Dosage form

권장 표현:

```text
Injection
Prefilled pen
Autoinjector
Tablet
Capsule
Nasal spray
Microneedle patch
Depot
Implant
Unknown
```

### 7.6 Dosing interval

권장 표현:

```text
Daily
Weekly
Biweekly
Monthly
Quarterly
TBD
Unknown
```

### 7.7 Source type

권장 표현:

```text
Pipeline page
Investor deck
Press release
ClinicalTrials.gov
SEC filing
FDA document
EMA document
Peer-reviewed paper
Conference abstract
Article
Other
```

### 7.8 Confidence

권장 표현:

```text
High
Medium
Low
```

### 7.9 Status

권장 표현:

```text
Active
Marketed
Partnered
Suspended
Completed
Discontinued
Paused
Acquired
Licensed
No longer listed
Unknown
```

### 7.10 QA status

권장 표현:

```text
Auto-pass
Needs review
Rejected
Approved
```

의미:

| qaStatus | Meaning |
|---|---|
| `Auto-pass` | 자동 검사 기준을 통과했지만 아직 최종 승인 전인 상태 |
| `Needs review` | 출처, stage, id, 중복, 불확실성 중 하나 이상을 사람이 검토해야 하는 상태 |
| `Rejected` | asset 후보가 scope 밖이거나 근거 부족, 중복, 오류로 제외된 상태 |
| `Approved` | QA 또는 수동 승인 후 `data/approved/pipeline-assets.json`에 반영 가능한 상태 |

---

## 8. Source Hierarchy

### 8.1 Preferred source priority

정보 입력 시 가능한 한 아래 순서의 출처를 우선한다.

1. 회사 공식 pipeline page
2. 회사 investor presentation 또는 IR deck
3. 공식 press release
4. ClinicalTrials.gov 또는 주요 임상시험 등록 사이트
5. FDA/EMA 등 규제기관 문서
6. SEC filing 또는 annual report
7. peer-reviewed paper
8. conference abstract
9. 신뢰 가능한 산업/언론 기사
10. 기타 2차 출처

### 8.2 Source selection rules

- `sourceUrl`은 가능한 한 해당 정보가 직접 확인되는 URL을 입력한다.
- 임시로 `sourceUrl`을 확보하지 못한 경우에는 `sourceUrl`을 비워 둘 수 있으나, `confidence`는 반드시 `Low`로 입력하고 `notes`에 source pending 상태와 재확인 필요성을 설명한다.
- 홈페이지 메인 URL보다 pipeline page 또는 관련 발표자료 URL을 우선한다.
- PDF/IR deck 기반 정보는 가능하면 PDF URL을 입력한다.
- 정보가 여러 출처에 분산된 경우 가장 핵심 정보를 뒷받침하는 URL을 `sourceUrl`에 넣고, 보조 출처는 `notes` 또는 `extractionNotes`에 기록한다.
- stage, route, indication이 서로 다른 출처에서 확인되는 경우 `notes`에 출처별 근거를 요약한다.

### 8.3 Research agent instructions

Research agent 또는 scraper는 회사별로 다음을 수행한다.

- `data/sources/companies.json`에서 company seed와 source 후보를 읽는다.
- 공식 pipeline page, IR deck, press release, clinical registry를 우선 확인한다.
- asset name, code, target, indication, route, dosage form, dosing interval, stage, status, source evidence를 추출한다.
- 원문 단계 표현은 `stageRaw`에 보존하고, normalized stage는 `stage`에 입력한다.
- 표, PDF, 이미지 chart에서 추정한 정보는 `notes`와 `extractionNotes`에 명시한다.
- 충돌, 누락, 불확실성은 숨기지 말고 `unresolvedQuestions`에 기록한다.
- 자동 추출 결과의 기본 `qaStatus`는 `Needs review`로 둔다. 강한 구조 검증과 공식 출처 매칭을 통과한 경우에만 `Auto-pass`를 사용할 수 있다.

---

## 9. Confidence Scoring

### 9.1 High

다음 조건 중 하나를 만족하면 `High`로 분류한다.

- 회사 공식 pipeline page에서 직접 확인됨
- 회사 IR deck 또는 annual report에서 직접 확인됨
- 공식 press release에서 직접 확인됨
- ClinicalTrials.gov에 등록된 임상시험 정보로 확인됨
- FDA/EMA 등 규제기관 문서로 확인됨
- peer-reviewed paper에서 확인됨

### 9.2 Medium

다음 조건에 해당하면 `Medium`으로 분류한다.

- 2차 기사이나 회사 발표 또는 공식 자료를 인용함
- conference abstract 또는 학회 발표자료 기반
- source는 있으나 stage, route, dosing interval 일부가 해석을 필요로 함
- 공식 자료와 2차 자료가 부분적으로 일치하지만 일부 필드가 불완전함

### 9.3 Low

다음 조건에 해당하면 `Low`로 분류한다.

- 원문 출처가 명확하지 않음
- 투자 커뮤니티, 블로그, 비공식 자료 기반
- pipeline chart 이미지만 있고 정확한 stage 확인이 어려움
- mechanism 또는 differentiator가 추정에 가까움
- 출처 간 정보가 충돌하며 아직 검증되지 않음
- `sourceUrl`이 아직 확보되지 않았고 출처 확인이 pending 상태임

---

## 10. Uncertainty and Missing Data Rules

### 10.1 Missing data labels

| Situation | Recommended value |
|---|---|
| 공개되지 않음 | `Not disclosed` |
| 확인 불가 | `Unclear` |
| 해당 없음 | `N/A` |
| 아직 결정되지 않음 | `TBD` |
| 추정 필요 | `Inferred` 또는 notes에 설명 |

### 10.2 Use of notes

`notes`에는 다음 내용을 기록한다.

- 원문에 명확하지 않은 stage 해석
- pipeline chart에서 위치를 보고 추정한 정보
- 복수 출처 간 불일치
- discontinued 여부가 불확실한 경우
- asset명과 codeName이 혼용되는 경우
- license-in/license-out, acquisition 등 개발 주체가 복잡한 경우
- 향후 재확인이 필요한 항목

예시:

```text
Stage inferred from company pipeline chart; no exact phase text disclosed.
```

### 10.3 Temporary missing source rule

`sourceUrl`은 원칙적으로 필수 필드이다. 단, 조사 중 임시로 URL이 아직 확보되지 않은 경우 다음 규칙을 적용한다.

- `confidence`는 반드시 `Low`로 입력한다.
- `qaStatus`는 `Needs review`로 입력한다.
- `notes`에는 `Source pending` 또는 이에 준하는 문구와 함께 어떤 출처를 확인할 예정인지 적는다.
- 해당 candidate는 QA 완료 전까지 승인 데이터로 승격할 수 없다.

---

## 11. QA Checklist

각 candidate file 또는 asset candidate를 검토할 때 아래 항목을 확인한다.

### 11.1 Candidate file check

- [ ] `company`가 `data/sources/companies.json`의 조사 대상과 일치하는가?
- [ ] `sourceUrl`과 `checkedAt`이 입력되어 있는가?
- [ ] `assets`가 배열인가?
- [ ] `extractionNotes`와 `unresolvedQuestions`가 배열인가?
- [ ] 자동 추출 결과가 승인 데이터로 직접 병합되지 않았는가?

### 11.2 Required field check

- [ ] `id`가 입력되어 있는가?
- [ ] `company`가 입력되어 있는가?
- [ ] `assetName`이 입력되어 있는가?
- [ ] `targetClass`가 입력되어 있는가?
- [ ] `indication`이 JSON 배열인가?
- [ ] `stage`가 표준값으로 입력되어 있는가?
- [ ] `sourceUrl`이 입력되어 있는가? 임시 누락이면 `confidence`가 `Low`, `qaStatus`가 `Needs review`, `notes`에 source pending 사유가 있는가?
- [ ] `lastChecked`가 `YYYY-MM-DD` 형식인가?
- [ ] `qaStatus`가 표준값으로 입력되어 있는가?

### 11.3 Consistency check

- [ ] 동일 `id`가 중복되지 않는가?
- [ ] 동일 asset이 불필요하게 중복 추출되지 않았는가?
- [ ] `assetName`, `codeName`, `id`가 서로 논리적으로 일치하는가?
- [ ] `stage`와 `stageRaw`가 모순되지 않는가?
- [ ] JSON 복수값은 delimited string이 아니라 배열인가?
- [ ] CSV/manual override 파일에서만 복수값이 `;`로 구분되는가?
- [ ] `route`, `dosageForm`, `dosingInterval`이 논리적으로 맞는가?

### 11.4 Evidence check

- [ ] `sourceUrl`에서 해당 정보가 직접 확인되는가?
- [ ] 공식 출처인지 2차 출처인지 구분했는가?
- [ ] 불확실한 정보는 `confidence`, `qaStatus`, `notes`, `unresolvedQuestions`에 반영했는가?
- [ ] 출처가 오래된 경우 최신 자료와 충돌하지 않는가?
- [ ] 임상 단계 정보는 가능한 경우 임상 등록 정보와 대조했는가?

### 11.5 Approval check

- [ ] `Rejected` 후보가 approved dataset에 포함되지 않았는가?
- [ ] `Needs review` 후보가 승인 없이 approved dataset에 포함되지 않았는가?
- [ ] `Auto-pass` 후보는 자동 검증 기준만 통과한 상태이며, 최종 승인 조건을 별도로 만족하는가?
- [ ] `Approved` 후보만 `data/approved/pipeline-assets.json`에 반영되는가?

---

## 12. Manual Override Policy

Manual CSV editing은 primary source of truth가 아니라 override/fallback workflow이다. 자동 추출과 QA 결과를 보완해야 할 때만 사용한다.

### 12.1 File path

```text
data/manual/pipeline_assets_overrides.csv
```

### 12.2 Allowed use cases

- 안정적인 `id`를 수동 지정하거나 유지해야 하는 경우
- 자동 추출이 assetName 또는 codeName을 잘못 병합한 경우
- display-friendly `assetName`, `description`, `differentiator`를 보정해야 하는 경우
- source가 일시적으로 pending인 항목을 추적해야 하는 경우
- QA reviewer가 승인, reject, correction decision을 명시해야 하는 경우

### 12.3 Header order

`pipeline_assets_overrides.csv`의 권장 헤더는 다음과 같다.

```tsv
id	company	assetName	codeName	targetClass	mechanism	indication	route	dosageForm	dosingInterval	stage	stageRaw	differentiator	description	sourceType	sourceUrl	lastChecked	confidence	status	qaStatus	notes
```

### 12.4 CSV override rules

- A1 셀부터 헤더를 입력한다.
- 1행은 반드시 고정 헤더로 사용한다.
- 2행부터 override 데이터를 입력한다.
- 병합 셀을 사용하지 않는다.
- 중간 빈 행을 만들지 않는다.
- CSV/manual override 파일에서만 복수값은 semicolon `;`으로 구분한다.
- JSON outputs에서는 복수값을 배열로 유지한다.
- Markdown 표 안에서는 pipe character `|`가 열 구분자로 해석되므로, 데이터 예시나 설명 문구의 복수값 구분에는 `|`를 사용하지 않는다.
- 날짜는 `YYYY-MM-DD` 형식으로 입력한다.
- 값이 불확실하면 추정값을 단정적으로 입력하지 않고 `notes`, `confidence`, `qaStatus`에 반영한다.

### 12.5 Override examples

Single-indication override:

```tsv
qlbiopharm-zt002	QL Biopharm	Zovaglutide Injection	ZT002	GLP-1 receptor agonist	Long-acting GLP-1 receptor agonism	Obesity	Subcutaneous	Injection	Monthly	Phase 2	Phase II	Once-monthly GLP-1RA	Long-acting GLP-1 receptor agonist for obesity	Pipeline page	https://www.qlbiopharm.com/en/pipelines.html	2026-05-21	High	Active	Approved	
```

Multi-indication override:

```tsv
example-asset-001	Company A	Asset A	CA-001	GLP-1/GIP dual agonist	Dual incretin receptor agonism	Obesity; Type 2 diabetes	Subcutaneous	Injection	Weekly	Phase 2	Phase II	Weekly dual agonist for cardiometabolic disease	Sample description	Pipeline page	https://example.com	2026-05-21	High	Active	Approved	
```

Code-only override:

```tsv
company-abc123	Company B	ABC123	ABC123	Oral small-molecule GLP-1 receptor agonist	Small-molecule GLP-1 receptor agonism	Obesity	Oral	Tablet	Daily	Phase 1	Phase I	Oral GLP-1 receptor agonist	Only code name disclosed	Investor deck	https://example.com	2026-05-21	Medium	Active	Needs review	Asset name not separately disclosed; codeName used as display name.
```

---

## 13. Update Frequency

권장 업데이트 주기는 다음과 같다.

| Update type | Frequency | Scope |
|---|---|---|
| Full extraction refresh | Monthly | 전체 회사 및 asset candidate 재조사 |
| Key company check | Weekly | 주요 관심 회사 pipeline page, IR deck, press release |
| Event-driven extraction | As needed | press release, clinical update, deal, discontinuation |
| QA review | Monthly or before release | source, confidence, stage consistency, approval status |

---

## 14. Automation and Approval Policy

자동 수집 기능은 다음 원칙을 따른다.

- scraper output은 즉시 truth로 사용하지 않는다.
- 자동 수집 데이터는 `data/candidates/*.pipeline.candidate.json`에 candidate로 보관한다.
- 자동 추출 후보는 QA를 통과하거나 수동 승인되기 전까지 `data/approved/pipeline-assets.json`에 반영하지 않는다.
- `data/approved/pipeline-assets.json`이 downstream truth source이다.
- `data/manual/pipeline_assets_overrides.csv`는 optional override layer이며 primary source of truth가 아니다.
- 자동 수집은 신규 asset 탐지, stage 변경 후보 탐지, source update 감지에 우선 사용한다.
- stage, differentiator, mechanism은 자동 추정보다 source-grounded extraction과 QA review를 우선한다.

---

## 15. App Display Rules

### 15.1 Asset table

표에는 정보 밀도와 가독성을 고려하여 핵심 필드만 표시한다.

권장 표시 필드:

```text
Company
Asset
Target Class
Indication
Route
Dosing Interval
Stage
Differentiator
Source
```

### 15.2 Asset detail drawer

상세 패널에는 다음 정보를 표시한다.

```text
Asset name
Code name
Company
Target class
Mechanism
Indication
Route
Dosage form
Dosing interval
Stage
Stage raw
Differentiator
Description
Source type
Source URL
Last checked
Confidence
Status
QA status
Notes
```

### 15.3 Display principles

- 비어 있는 optional field는 `—`로 표시한다.
- 추정 정보는 가능한 경우 `notes`에 근거를 남긴다.
- confidence가 낮거나 `qaStatus`가 `Needs review`인 정보는 향후 UI에서 badge 또는 warning 형태로 표시할 수 있다.
- source link는 항상 외부 링크로 열리게 한다.

---

## 16. Minimum Viable Dataset

초기 approved dataset 생성을 위한 최소 asset 기준은 다음과 같다.

```text
id
company
assetName
targetClass
indication
stage
sourceUrl
lastChecked
confidence
qaStatus
```

실무형 최소 asset 기준은 다음과 같다.

```text
id
company
assetName
codeName
targetClass
mechanism
indication
route
dosageForm
dosingInterval
stage
stageRaw
differentiator
sourceType
sourceUrl
lastChecked
confidence
status
qaStatus
notes
```

---

## 17. Recommended First Extraction Set

초기 extraction과 QA workflow 검증용으로 다음 범위를 권장한다.

```text
1. QL Biopharm
2. Structure Therapeutics
3. Viking Therapeutics
```

각 회사에서 1~5개 asset만 우선 추출하여 다음을 검증한다.

- `data/sources/companies.json` seed 품질
- candidate JSON schema 안정성
- company-level `extractionNotes`와 `unresolvedQuestions` 운영 가능성
- QA file 생성과 `qaStatus` 전환
- approved dataset merge
- optional manual override 적용
- detail drawer 표시
- sourceUrl linkage
- confidence/notes 운영 가능성

---

## 18. Revision Log

| Version | Date | Changes |
|---|---|---|
| v0.2 | 2026-05-21 | Reframed protocol for AI-assisted research, candidate extraction, QA approval workflow, and optional manual overrides |
| v0.1 | 2026-05-20 | Initial research protocol draft |
