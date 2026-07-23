# Handover: Safety Endpoint Backfill (SAE / Nausea / Vomiting / Anti-drug antibodies)

Status as of 2026-07-23. This is a working handover note, not a contract or
decision record — current rules live in `domains/clinical-evidence/docs/README.md`
(ADR-0048) and `docs/workflow.md`. This file exists so a future session can
resume the backfill without re-deriving the plan.

## Goal

For every Study that already has result-bearing efficacy Endpoints, add the
four bounded safety Endpoints (ADR-0048) whenever a reachable, cited source
directly reports a per-arm breakdown:

- `role`/`domain: "safety"`, name exactly one of:
  `"Serious adverse events"`, `"Nausea"`, `"Vomiting"`, `"Anti-drug antibodies"`
- arm-level Outcomes, `analysisPopulation: "Safety population (overall)"`,
  `unit: "percent"`, `resultType: "arm-level"`
- This is a closed set of four facts — never add an Endpoint for any other
  AE term. Omit (don't enter) a fact the source doesn't report; never write
  "not reported" as a value.

## Corrected methodology (read this before resuming)

Source authority is judged **per fact**, not once per Study. `maturity` and
`metadata.sources` are recorded per Outcome, so a Study's efficacy data and
its safety data can legitimately cite different sources — there is no single
"one true source" the whole Study must stay on. What *does* apply per fact:
try that fact's own highest-priority available source first (peer-reviewed
publication > registry-posted result > conference/topline), and only fall
back to a lower-priority source for that specific fact when the top one is
inaccessible or silent on it. Don't skip straight to a lower-priority source
just because it's more convenient to fetch.

**Concrete lesson from retatrutide phase 2**: SAE/Nausea/Vomiting were first
entered from the ClinicalTrials.gov registry because the NEJM full text
returned 403. Once the user supplied the NEJM PDF, the registry-derived
numbers matched the paper exactly — but the registry had **no anti-drug-antibody
outcome measure at all**, while the NEJM paper's Table 3 ("Adverse events of
special interest") reports ADA incidence per arm. Relying on the registry
alone would have permanently missed ADA. **Always try to get the actual
highest-priority source's full text before concluding a fact isn't reported.**

Once a higher-priority source is obtained, re-derive the value from it and
match its own precision — don't keep a lower-priority source's decimal
precision once a higher-priority source (that only reports whole numbers,
say) is in hand and cited.

## Completed

- **Retatrutide phase 2 (NCT04881760)**: SAE, Nausea, Vomiting, Anti-drug
  antibodies all entered from the NEJM full text
  (`https://www.nejm.org/doi/full/10.1056/NEJMoa2301972`, PDF supplied by the
  user), `maturity: "peer-reviewed publication"`, values matched to the
  paper's own whole-number percentages. File:
  `domains/clinical-evidence/data/clinical-evidence/eli-lilly-and-company/ly3437943/clinical-evidence.json`.
  **Uncommitted as of this handover** (only this file + the generated
  aggregate are modified in the working tree).
- **GLORY-1 (NCT05607680)**: unrelated fix, already committed (`93e4815`) —
  added the two missing co-primary efficacy endpoints (week-32 weight change,
  week-32 >=5% responder) from the NEJM full text
  (`https://doi.org/10.1056/NEJMoa2411528`). Safety backfill for GLORY-1 is
  **not yet done**, but the same paper (already read this session; PDF at
  `.temp/NEJM-Mazdutide.pdf` if still present locally — `.temp/` is
  gitignored) has Table 4 (Adverse Events, Safety Population) with per-arm
  SAE/Nausea/Vomiting, and the Discussion states antimazdutide antibody
  incidence (45.0% at 4 mg, 43.7% at 6 mg; no placebo figure given — ADA is
  not meaningful for a placebo arm). This can be entered without re-fetching
  anything.
- **SURMOUNT-MAINTAIN (NCT06047548)**: unrelated fix, already committed
  (`93e4815`) — corrected the primary-endpoint role. No safety work done.

## Remaining scope

52 Studies have result-bearing efficacy data and no safety Endpoint yet
(GLORY-1 will drop off this list once its safety Endpoints are entered).
Each row is that Study's own current highest-priority cited source — try
this exact source first, per the methodology above.

### Peer-reviewed publication is the top source (try WebFetch; many are open-access; NEJM/Lancet usually need a user-supplied PDF)

| Study | Source |
| --- | --- |
| amgen-maridebart-cafraglutide-amg133-phase2-nct05669599 | https://www.nejm.org/doi/10.1056/NEJMoa2504214 |
| eli-lilly-and-company-tirzepatide-surmount-1-nct04184622 (SURMOUNT-1) | https://pubmed.ncbi.nlm.nih.gov/35658024/ |
| eli-lilly-and-company-tirzepatide-surmount-2-nct04657003 (SURMOUNT-2) | https://pubmed.ncbi.nlm.nih.gov/37385275/ |
| eli-lilly-and-company-tirzepatide-surmount-3-nct04657016 (SURMOUNT-3) | https://pubmed.ncbi.nlm.nih.gov/37840095/ |
| eli-lilly-and-company-tirzepatide-surmount-4-nct04660643 (SURMOUNT-4) | https://pubmed.ncbi.nlm.nih.gov/38078870/ |
| eli-lilly-and-company-tirzepatide-surmount-5-nct05822830 (SURMOUNT-5) | https://pubmed.ncbi.nlm.nih.gov/40353578/ |
| eli-lilly-and-company-tirzepatide-surmount-maintain-nct06047548 (SURMOUNT-MAINTAIN) | https://pubmed.ncbi.nlm.nih.gov/42119587/ |
| eli-lilly-and-company-tirzepatide-summit-nct04847557 (SUMMIT) | https://pubmed.ncbi.nlm.nih.gov/39555826/ |
| eli-lilly-and-company-tirzepatide-surmount-cn-nct05024032 (SURMOUNT-CN) | https://pubmed.ncbi.nlm.nih.gov/38819983/ |
| eli-lilly-and-company-mazdutide-glory-1-nct05607680 (GLORY-1) | https://doi.org/10.1056/NEJMoa2411528 — **already in hand, see Completed** |
| eli-lilly-and-company-mazdutide-glory-2-nct06164873 (GLORY-2) | https://pubmed.ncbi.nlm.nih.gov/42251595/ |
| eli-lilly-and-company-orforglipron-attain-1-nct05869903 (ATTAIN-1) | https://pubmed.ncbi.nlm.nih.gov/40960239/ |
| eli-lilly-and-company-orforglipron-attain-2-nct05872620 (ATTAIN-2) | https://pubmed.ncbi.nlm.nih.gov/41275875/ |
| eli-lilly-and-company-eloralintide-phase-2-nct06230523 | https://pubmed.ncbi.nlm.nih.gov/41207310/ |
| novo-nordisk-amycretin-oral-phase1-nct05369390 | https://pubmed.ncbi.nlm.nih.gov/40550229/ |
| novo-nordisk-amycretin-sc-phase1b2a-nct06064006 | https://pubmed.ncbi.nlm.nih.gov/40550231/ |
| novo-nordisk-cagrilintide-phase2-nct03856047 | https://pubmed.ncbi.nlm.nih.gov/34798060/ |
| novo-nordisk-cagrisema-redefine-1-nct05567796 (REDEFINE 1) | https://www.nejm.org/doi/10.1056/NEJMoa2502081 |
| novo-nordisk-cagrisema-redefine-2-nct05394519 (REDEFINE 2) | https://pubmed.ncbi.nlm.nih.gov/40544432/ |
| novo-nordisk-liraglutide-scale-obesity-nct01272219 (SCALE Obesity and Prediabetes) | https://pubmed.ncbi.nlm.nih.gov/26132939/ |
| novo-nordisk-liraglutide-scale-diabetes-nct01272232 (SCALE Diabetes) | https://pubmed.ncbi.nlm.nih.gov/26284720/ |
| novo-nordisk-liraglutide-scale-teens-nct02918279 (SCALE Teens) | https://pubmed.ncbi.nlm.nih.gov/32233338/ |
| novo-nordisk-liraglutide-scale-kids-nct04775082 (SCALE Kids) | https://pubmed.ncbi.nlm.nih.gov/39258838/ |
| novo-nordisk-semaglutide-step-1-nct03548935 (STEP 1) | https://pubmed.ncbi.nlm.nih.gov/33567185/ |
| novo-nordisk-semaglutide-step-2-nct03552757 (STEP 2) | https://pubmed.ncbi.nlm.nih.gov/33667417/ |
| novo-nordisk-semaglutide-step-5-nct03693430 (STEP 5) | https://pubmed.ncbi.nlm.nih.gov/36216945/ |
| novo-nordisk-semaglutide-step-teens-nct04102189 (STEP TEENS) | https://pubmed.ncbi.nlm.nih.gov/36322838/ |
| novo-nordisk-semaglutide-step-up-nct05646706 (STEP UP) | https://pubmed.ncbi.nlm.nih.gov/40961952/ |
| novo-nordisk-semaglutide-step-up-t2d-nct05649137 (STEP UP T2D) | https://pubmed.ncbi.nlm.nih.gov/40961953/ |
| novo-nordisk-semaglutide-oasis-4-nct05564117 (OASIS 4) | https://www.nejm.org/doi/10.1056/NEJMoa2500969 |
| novo-nordisk-semaglutide-step-hfpef-dm-nct04916470 (STEP HFpEF DM) | https://pubmed.ncbi.nlm.nih.gov/38587233/ |
| novo-nordisk-semaglutide-oasis-2-nct05132088 (OASIS 2) | https://pubmed.ncbi.nlm.nih.gov/40758358/ |
| roche-enicepatide-ct388-101-nct04838405 (CT-388-101) | https://doi.org/10.1016/j.molmet.2025.102291 |

### Trial registry result is the top source (fetch directly via CT.gov API, e.g. `https://clinicaltrials.gov/api/v2/studies/<NCT>?fields=resultsSection.adverseEventsModule`)

| Study | Source |
| --- | --- |
| novo-nordisk-semaglutide-step-3-nct03611582 (STEP 3) | NCT03611582 |
| novo-nordisk-semaglutide-step-4-nct03548987 (STEP 4) | NCT03548987 |
| novo-nordisk-semaglutide-step-6-nct03811574 (STEP 6) | NCT03811574 |
| novo-nordisk-semaglutide-step-7-nct04251156 (STEP7) | NCT04251156 |
| novo-nordisk-semaglutide-step-8-nct04074161 (STEP 8) | NCT04074161 |
| novo-nordisk-semaglutide-step-9-nct05064735 (STEP 9) | NCT05064735 |
| novo-nordisk-semaglutide-step-10-nct05040971 (STEP 10) | NCT05040971 |
| novo-nordisk-semaglutide-step-12-nct06041217 (STEP12) | NCT06041217 |
| novo-nordisk-semaglutide-step-hfpef-nct04788511 (STEP-HFpEF) | NCT04788511 |
| novo-nordisk-semaglutide-oasis-1-nct05035095 (OASIS 1) | NCT05035095 |
| novo-nordisk-semaglutide-select-nct03574597 (SELECT) | NCT03574597 |

### Conference/topline is the top source (least likely to have full per-arm AE tables; check anyway before skipping)

| Study | Source |
| --- | --- |
| ascletis-pharma-asc30-nct07002905 | https://www.ascletis.com/data/upload/pdf/ASC30%20Phase%202%20%40%20ADA%202026%20-%2020250518%20-%20final.pdf |
| ascletis-pharma-asc30-nct06679959 | https://www.ascletis.com/news_detail/200/id/1352.html |
| ascletis-pharma-asc30-nct06680440 | https://www.ascletis.com/data/upload/ueditor/20251030/Poster_ASC30_tablets_obesity_week.pdf |
| eli-lilly-and-company-retatrutide-triumph-4-nct05931367 (TRIUMPH-4) | https://investor.lilly.com/news-releases/news-release-details/lillys-triple-agonist-retatrutide-delivered-weight-loss-average |
| novo-nordisk-cagrisema-redefine-4-nct06131437 (REDEFINE 4) | https://www.novonordisk.com/content/nncorp/global/en/news-and-media/news-and-ir-materials/news-details.html?id=916501 |
| novo-nordisk-ubt251-china-phase2-nct07177469 | https://www.novonordisk.com/news-and-media/news-and-ir-materials/news-details.html?id=916503 |
| roche-ct-996-201-nct05814107 (CT-996-201) | https://assets.roche.com/f/176343/x/fd3ea522a9/easd_final_to-share-130924.pdf |
| roche-enicepatide-ct388-103-nct06525935 (CT388-103) | https://assets.roche.com/f/176343/x/20033a15c4/ada-ir-event_08-june-2026_final.pdf |

Note: `roche-ct-996-201-nct05814107` and `roche-enicepatide-ct388-101-nct04838405`
(Phase 1 safety/PK studies, see the earlier primary/secondary sweep) already
have SAE data reachable via the registry even though efficacy there is
sourced elsewhere — worth checking the registry directly for these
Phase 1 studies regardless of the table above.

## Process for each Study

1. Identify the Study's own highest-priority cited source (tables above).
2. Fetch it — WebFetch first (many Diabetes Care / EClinicalMedicine / JAMA /
   Lancet Diabetes & Endocrinology articles are open-access); NEJM/Lancet
   main journal usually return 403 and need a user-supplied PDF (ask the user
   to drop it in `.temp/`, which is gitignored).
3. Extract, if reported: SAE incidence, Nausea incidence, Vomiting incidence
   (kept separate — never combine into one endpoint), Anti-drug antibody
   incidence — each per arm, at the source's own precision.
4. For each fact actually reported with a per-arm breakdown: add one Endpoint
   (`role`/`domain: "safety"`, one of the four fixed names) + one arm-level
   Outcome per arm, citing the source that actually supplied the value.
5. Omit any of the four facts the source doesn't report — no Endpoint, no
   placeholder value.
6. `npm run data:generate && npm run data:validate:clinical-evidence && npm run data:validate:clinical-evidence:generated && npm run data:validate:clinical-evidence:synthetic`.

## Reference

- Schema/contract: ADR-0048, `domains/clinical-evidence/docs/README.md`
  ("Exactly four named safety facts...")
- Workflow: `domains/clinical-evidence/docs/workflow.md` (Section 4 safety
  paragraph; completion-check item 7 in Section 6 also covers these facts for
  Studies touched in a given research run)
