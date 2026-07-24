# Handover: Safety Endpoint Backfill (SAE / Nausea / Vomiting / Anti-drug antibodies)

Status as of 2026-07-24 (updated — batch-2 PDF sweep, items 1-12 of
`pdf-needed-links.md` done). This is a working handover note, not a contract or
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
- **GLORY-1 (NCT05607680)**: efficacy fix already committed (`93e4815`) —
  added the two missing co-primary efficacy endpoints (week-32 weight change,
  week-32 >=5% responder) from the NEJM full text
  (`https://doi.org/10.1056/NEJMoa2411528`). Safety backfill now done
  (2026-07-24, uncommitted): SAE, Nausea, Vomiting entered per-arm from
  Table 4 (Adverse Events, Safety Population); Anti-drug antibodies entered
  for the two mazdutide arms only (45.0% at 4 mg, 43.7% at 6 mg) from the
  Discussion — no placebo Outcome, since the paper reports no placebo figure
  and ADA is not meaningful for a placebo arm. All four Endpoints use
  `analysisPopulation: "Safety population (overall)"`, `maturity:
  "peer-reviewed publication"`. File:
  `domains/clinical-evidence/data/clinical-evidence/eli-lilly-and-company/ly3305677/clinical-evidence.json`.
  `data:generate` and all three `data:validate:clinical-evidence*` scripts
  pass.
- **SURMOUNT-MAINTAIN (NCT06047548)**: unrelated fix, already committed
  (`93e4815`) — corrected the primary-endpoint role. No safety work done.

### PDF-backed batch, 2026-07-24 — items 1-12 of `pdf-needed-links.md`, all DONE

User supplied PDFs for the paywalled papers directly into `.temp/`. For each
Study below, **both** steps were done in one pass (per the user's stated
workflow, to avoid fetching a paper twice): (a) efficacy Endpoints/Outcomes
were re-checked against the paper and corrected/added if missing or wrong,
and (b) the four safety facts were added wherever the paper reports a
per-arm breakdown. `data:generate` and all three `data:validate:clinical-evidence*`
scripts pass after every study below.

1. **AMG133 phase2 (amgen-maridebart-cafraglutide-amg133-phase2-nct05669599)** —
   NEJM `10.1056/NEJMoa2504214`. 11-arm study (2 cohorts). Added 9 missing
   treatment-policy weight outcomes, 11 new efficacy-estimand weight outcomes,
   and SAE/Nausea/Vomiting for all 11 arms (33 outcomes). ADA not reported.
2. **SURMOUNT-1 (eli-lilly-and-company-tirzepatide-surmount-1-nct04184622)** —
   NEJM `10.1056/NEJMoa2206038`. Efficacy already correct/peer-reviewed. Added
   SAE/Nausea/Vomiting for all 4 arms. ADA not reported.
3. **SURMOUNT-2 (…-surmount-2-nct04657003)** — Lancet
   `10.1016/S0140-6736(23)01200-X`. Efficacy already correct. Added
   SAE/Nausea/Vomiting for all 3 arms. ADA not reported.
4. **SURMOUNT-5 (…-surmount-5-nct05822830)** — NEJM `10.1056/NEJMoa2416394`.
   Efficacy already correct. Added SAE/Nausea/Vomiting for both arms. ADA not
   reported.
5. **SURMOUNT-MAINTAIN (…-surmount-maintain-nct06047548)** — Lancet
   `10.1016/S0140-6736(26)00656-2`. Efficacy already correct. Added
   SAE/Nausea/Vomiting for all 3 arms (weight-maintenance period). ADA not
   reported.
6. **SUMMIT (eli-lilly-and-company-tirzepatide-summit-nct04847557)** — NEJM
   `10.1056/NEJMoa2410027`. **Efficacy gap found and fixed**: the study had
   only the worsening-HF-event co-primary Endpoint; the KCCQ-CSS co-primary
   Endpoint and the body-weight key-secondary Endpoint were entirely missing.
   Both added with their Outcomes. SAE/Nausea/Vomiting/ADA: the accessible
   main text gives only aggregate GI-discontinuation and "serious adverse
   events appeared similar between groups" — no per-arm SAE/Nausea/Vomiting
   table (that's in Table S6, inaccessible). None of the four safety facts
   could be entered; documented in `safetySummary` instead.
7. **ATTAIN-1 (eli-lilly-and-company-orforglipron-attain-1-nct05869903)** —
   NEJM `10.1056/NEJMoa2511774`. Efficacy already correct. Table 4 gives
   per-arm SAE (added, 4 arms); Nausea/Vomiting have no per-arm breakdown in
   the accessible main text (only aggregate "most frequent AEs were nausea…").
   ADA not applicable (small molecule).
8. **ATTAIN-2 (…-attain-2-nct05872620)** — Lancet
   `10.1016/S0140-6736(25)02165-8)`. Efficacy already correct. Added
   SAE/Nausea/Vomiting for all 4 arms from Table 4. ADA not applicable.
9. **eloralintide phase 2 (eli-lilly-and-company-eloralintide-phase-2-nct06230523)** —
   Lancet `10.1016/S0140-6736(25)02155-5`. Efficacy already correct
   (7-arm dose-ranging design). Added SAE/Nausea/Vomiting for all 7 arms from
   Table 3. ADA mentioned as collected but not reported with per-arm figures
   in the main text — omitted.
10. **amycretin oral phase1 (novo-nordisk-amycretin-oral-phase1-nct05369390)** —
    Lancet `10.1016/S0140-6736(25)01176-6)`. **Efficacy gap found and fixed**:
    only the 2×50 mg arm and placebo were entered; the 50 mg and 2×25 mg arms
    (Part C1/D) were missing entirely — added both, with weight Outcomes.
    Added SAE/Nausea/Vomiting for all 4 arms from Table 2. ADA reported only
    as a study-wide aggregate (8/111, 7%) across all four parts (A-D), not
    per-arm for Part C/D specifically — could not be entered as an Outcome,
    noted in `safetySummary` instead.
11. **amycretin sc phase1b2a (novo-nordisk-amycretin-sc-phase1b2a-nct06064006)** —
    Lancet `10.1016/S0140-6736(25)01185-7)`. **Efficacy gap found and fixed**:
    only the 60 mg (Part B) arm and its placebo were entered; Parts C (20 mg),
    D (5 mg), and E (1.25 mg) — each with their own separate placebo arm, since
    placebo was *not* pooled across parts in this study — were missing
    entirely. Added all 3 missing dose arms + 3 separate placebo arms, with
    weight Outcomes. Added SAE/Nausea/Vomiting for all 8 arms from Table 2.
    **ADA was reported per-arm here** (unlike most other studies in this
    batch) — added for Part B/C/D active arms (29%, 21%, 38% respectively);
    not reported for Part E or any placebo arm.
12. **cagrilintide phase2 (novo-nordisk-cagrilintide-phase2-nct03856047)** —
    Lancet `10.1016/S0140-6736(21)01751-7)`. **Efficacy gap found and fixed**:
    only the 4.5 mg dose, liraglutide 3.0 mg comparator, and pooled placebo
    arms were entered; the 0.3/0.6/1.2/2.4 mg dose arms were missing entirely
    — added all 4, with weight Outcomes. Added SAE/Nausea/Vomiting for all 7
    arms from Table 3. ADA reported only as a range across doses (46-73% by
    week 26, increasing with dose) with no exact per-arm percentage in the
    accessible main text — omitted, noted in `safetySummary`.

Net effect on `pdf-needed-links.md`: items 1-12 all marked done there with a
one-line note on what was found. Items 13-24 (REDEFINE 1/2, SCALE Obesity/
Teens/Kids, STEP 1/2/UP/UP T2D, OASIS 4, STEP HFpEF DM, CT-388-101) plus the
2 abstract-only and 3 open-access-not-yet-fetched studies remain untouched.

## Remaining scope

Originally 52 Studies had result-bearing efficacy data and no safety Endpoint.
GLORY-1, the 11 "trial registry" rows (really 10 peer-reviewed + 1 registry,
see correction above), and items 1-12 of the PDF-backed batch above are now
done, leaving 28. Each row below is that Study's
own current highest-priority cited source — try this exact source first, per
the methodology above. **Given the registry-vs-paper mismatch found on
2026-07-24, re-check each row's classification against PubMed/the journal
before trusting it — the original sweep that produced this table appears to
have been unreliable for several entries.**

### Peer-reviewed publication is the top source (try WebFetch; many are open-access; NEJM/Lancet usually need a user-supplied PDF)

**Fetch sweep done 2026-07-24 — status per study below.** Useful trick found
this session: for a JAMA-family article, `https://jamanetwork.com/journals/jama/fullarticle/<DOI>`
(or `/journals/jamainternalmedicine/fullarticle/<DOI>` for JAMA Internal
Medicine) often renders even when the PubMed "full text" link 403s — try this
before asking for a PDF on any `jama.*` or `jamainternmed.*` DOI.
`europepmc.org/article/med/<pmid>` did **not** work (JS-rendered shell only,
WebFetch can't execute it) — don't retry that pattern.

- **Done this session** (fetched, efficacy cross-checked, all 4 safety facts
  checked, `data:generate`/validate all green):
  - SURMOUNT-4 (nct04660643) — JAMA, via jamanetwork.com DOI URL. Efficacy
    already matched the paper exactly. Added SAE/Nausea/Vomiting (ADA not
    reported in the accessible text).
  - SURMOUNT-CN (nct05024032) — JAMA, via jamanetwork.com DOI URL. Efficacy
    already matched. Added SAE/Nausea/Vomiting (ADA not reported).
  - SCALE Diabetes (nct01272232) — JAMA, via jamanetwork.com DOI URL.
    **Efficacy corrected**: liraglutide 3.0 mg was stored as -5.9%, paper's
    own Table 2 says -6.0% — fixed. Added the missing 1.8 mg arm-level
    outcome (-4.7%, was never entered). Added SAE/Nausea/Vomiting for all
    three arms (ADA not reported).
  - AMG133 phase2, SURMOUNT-1, SURMOUNT-2, SURMOUNT-5, SURMOUNT-MAINTAIN,
    SUMMIT, ATTAIN-1, ATTAIN-2, eloralintide phase 2, amycretin oral phase1,
    amycretin sc phase1b2a, cagrilintide phase2 — **see the "PDF-backed
    batch, 2026-07-24" section above** for the full per-study breakdown
    (several of these had missing efficacy arms/Endpoints fixed too, not
    just safety).
- **Open access, confirmed but not yet entered** (re-fetch when resuming —
  don't need a PDF):
  - SURMOUNT-3 (nct04657016) — Nature Medicine, DOI 10.1038/s41591-023-02597-w,
    PMC-free per PubMed. Direct PMC URL not found this session (try
    `pubmed.ncbi.nlm.nih.gov/37840095/` and follow the "Free PMC article"
    link manually, or ask the user for the PMC ID).
  - STEP 5 (nct03693430) — Nature Medicine, DOI 10.1038/s41591-022-02026-4,
    PMC-free. Same follow-up needed.
  - STEP TEENS (nct04102189) — NEJM, DOI 10.1056/NEJMoa2208601, PMC-free per
    PubMed despite NEJM.org itself 403ing. Same follow-up needed.
- **Abstract only, need PDF for the full safety table**:
  - GLORY-2 (nct06164873) — JAMA DOI 10.1001/jama.2026.8142, jamanetwork.com
    URL trick did not unlock it this time (too recent, likely still
    embargoed). Abstract-level weight change already known
    (-16.65% vs -1.50%, matches what's already in the file) and abstract-level
    Nausea/Vomiting; SAE/ADA need the PDF.
  - OASIS 2 (nct05132088) — JAMA Internal Medicine DOI
    10.1001/jamainternmed.2025.3599, same jamanetwork.com trick paywalled.
    Abstract has efficacy (-14.3% vs -1.3%) and a combined GI-events figure
    but no per-fact SAE/Nausea/Vomiting/ADA breakdown.
- **Confirmed paywalled, still need a user-supplied PDF** (all others in the
  table below): REDEFINE 1, REDEFINE 2, SCALE Obesity, SCALE Teens,
  SCALE Kids, STEP 1, STEP 2, STEP UP, STEP UP T2D, OASIS 4, STEP HFpEF DM
  (efficacy already entered from this source — only safety needs the PDF),
  CT-388-101 (Molecular Metabolism, Elsevier redirect chain didn't resolve to
  readable content — worth one more direct try before asking for a PDF, it
  may genuinely be open access).

| Study | Source |
| --- | --- |
| eli-lilly-and-company-tirzepatide-surmount-3-nct04657016 (SURMOUNT-3) | https://pubmed.ncbi.nlm.nih.gov/37840095/ |
| eli-lilly-and-company-mazdutide-glory-1-nct05607680 (GLORY-1) | https://doi.org/10.1056/NEJMoa2411528 — **already in hand, see Completed** |
| eli-lilly-and-company-mazdutide-glory-2-nct06164873 (GLORY-2) | https://pubmed.ncbi.nlm.nih.gov/42251595/ |
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

### Trial registry result is the top source — CORRECTED 2026-07-24, all now DONE

**Important correction to this handover**: on 2026-07-24 the user asked to double-check
whether these 11 studies really had no peer-reviewed publication. 10 of the 11 in fact
had one (the original classification was wrong — likely stale from when the registry
was the only available source). Only STEP 12 genuinely has the registry as its
top source (completed May 2025, no publication yet). All 11 are now fully backfilled —
efficacy outcomes re-derived from the papers where a paper existed (values, CIs, and
maturity corrected from `registry result` to `peer-reviewed publication`; estimand
labels renamed to match each paper's own terminology), plus the four safety facts
added per the process below. STEP 9, STEP 10, and SELECT used **targeted/selective
safety data collection** (explicitly stated in their methods) — only Serious adverse
events could be extracted; Nausea/Vomiting/ADA were not systematically recorded in
those three trials and are correctly absent, not omitted by oversight.

| Study | Top source used |
| --- | --- |
| novo-nordisk-semaglutide-step-3-nct03611582 (STEP 3) | JAMA 2021;325:1403-13 |
| novo-nordisk-semaglutide-step-4-nct03548987 (STEP 4) | JAMA 2021;325:1414-25 |
| novo-nordisk-semaglutide-step-6-nct03811574 (STEP 6) | Lancet Diabetes Endocrinol 2022;10:193-206 |
| novo-nordisk-semaglutide-step-7-nct04251156 (STEP7) | Lancet Diabetes Endocrinol 2024;12:184-95 |
| novo-nordisk-semaglutide-step-8-nct04074161 (STEP 8) | JAMA 2022;327:138-50 |
| novo-nordisk-semaglutide-step-9-nct05064735 (STEP 9) | NEJM 2024;391:1573-83 (SAE only — selective safety collection) |
| novo-nordisk-semaglutide-step-10-nct05040971 (STEP 10) | Lancet Diabetes Endocrinol 2024;12:631-42 (SAE only — selective safety collection) |
| novo-nordisk-semaglutide-step-12-nct06041217 (STEP12) | NCT06041217 (registry — genuinely no publication yet) |
| novo-nordisk-semaglutide-step-hfpef-nct04788511 (STEP-HFpEF) | NEJM 2023;389:1069-84 (SAE only — no Nausea/Vomiting/ADA in the paper) |
| novo-nordisk-semaglutide-oasis-1-nct05035095 (OASIS 1) | Lancet 2023;402:705-19 |
| novo-nordisk-semaglutide-select-nct03574597 (SELECT) | NEJM 2023;389:2221-32 (SAE only — selective safety collection) |

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

## Schema boundary report

- **`DEFERRED_SCHEMA_CASE` — STEP 6 (novo-nordisk-semaglutide-step-6-nct03811574),
  arm-vs-pooled-placebo treatment difference for the primary weight endpoint
  (`step6-weight-week68`).** The Lancet Diabetes & Endocrinology paper
  (`https://doi.org/10.1016/S2213-8587(22)00008-0`, Table 2) directly reports
  two estimated treatment differences against the pooled placebo group:
  semaglutide 2.4 mg vs pooled placebo, −11.06 percentage points (95% CI −12.88
  to −9.24, p<0.0001); semaglutide 1.7 mg vs pooled placebo, −7.52 percentage
  points (95% CI −9.62 to −5.43, p<0.0001). Both were initially entered as
  `between-arm` Outcomes with `armIds: [semaglutide arm, one placebo sub-arm]`,
  which misattributes a group-level statistic to a two-arm pair that was never
  the actual comparison — the source's own comparator is the pooled group
  (`step6-pooled-placebo`), not either individual placebo sub-arm. Removed on
  2026-07-24. Unsupported structure: an Outcome anchors to exactly one
  `analysisGroupId` and an analysis-group Outcome carries only an arm-level
  (single-unit) result — group-vs-arm and group-vs-group effect estimates have
  no representation under schema v2.0/ADR-0037 (documented generally in
  `domains/company-pipeline/docs/edge-cases.md`, row "Clinical Evidence:
  comparison between analysis groups"). Information lost: the two ETDs above,
  plus their CIs and p-values. Partial canonical record retained: the three
  arm-level values the same table reports (`step6-weight-treatment-policy-semaglutide-24mg`
  -13.2%, `-17mg` -9.6%, `step6-weight-treatment-policy-pooled-placebo` -2.1%),
  all correctly sourced to the same paper. Re-entry trigger: a schema
  extension that allows an Outcome to anchor `armIds` on one side and
  `analysisGroupId` on the other (or an equivalent group-vs-arm comparison
  type) — replay this exact case first since the source values are already
  transcribed here.

## Reference

- Schema/contract: ADR-0048, `domains/clinical-evidence/docs/README.md`
  ("Exactly four named safety facts...")
- Workflow: `domains/clinical-evidence/docs/workflow.md` (Section 4 safety
  paragraph; completion-check item 7 in Section 6 also covers these facts for
  Studies touched in a given research run)
