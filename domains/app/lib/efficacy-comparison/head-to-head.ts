import type {
  ArmView,
  OutcomeView,
  StudyDetailView,
} from "@/domains/app/lib/clinical-evidence/selectors";
import {
  canonicalizeClinicalAnalysisPopulation,
  canonicalizeClinicalEstimand,
} from "@/domains/clinical-evidence/lib/clinical-term-canonicalization.mjs";
import type { ClinicalStudyRecord } from "@/domains/clinical-evidence/lib/types";
import type { EfficacyBetweenArmValue, EfficacyValue } from "./representative";

/**
 * Direct head-to-head detection.
 *
 * Arm co-presence never qualifies a pair. Two distinct entities appearing in one
 * Study says nothing about whether they were compared — the Outcome graph has to
 * show it, either as a stored between-arm estimate or as arm-level results the
 * source reported together in one comparison group.
 */

export type ComparisonEntity = {
  key: string;
  label: string;
  /** Present when the entity resolves to a registry asset. */
  companyId?: string;
  assetId?: string;
  /** True when only free text identifies it, so the UI can flag it. */
  unresolved: boolean;
};

/**
 * Resolves one Arm to a comparison entity.
 *
 * Order matters: an internal `linkedAsset` wins, then a focal experimental Arm falls
 * back to the Study's own unit, then an external comparator keeps its authored free
 * text as an unresolved entity.
 *
 * `arm.label` is deliberately **never** an identity. Labels carry dose ("Semaglutide
 * 2.4 mg" vs "Semaglutide 1.0 mg"), so using them would turn every dose-ranging
 * study into a fake head-to-head.
 */
export function resolveArmEntity(
  arm: ArmView,
  study: ClinicalStudyRecord,
): ComparisonEntity | null {
  if (arm.role === "placebo") return null;

  if (arm.linkedAssetRef) {
    const { companyId, assetId } = arm.linkedAssetRef;
    return {
      key: `asset:${companyId}/${assetId}`,
      label: arm.linkedAssetName ?? assetId,
      companyId,
      assetId,
      unresolved: false,
    };
  }

  if (arm.role === "experimental") {
    if (study.regimenId) {
      return {
        key: `regimen:${study.regimenId}`,
        label: study.regimenId,
        unresolved: false,
      };
    }
    return {
      key: `asset:${study.companyId}/${study.assetId}`,
      label: study.assetId,
      companyId: study.companyId,
      assetId: study.assetId,
      unresolved: false,
    };
  }

  // External or unresolved comparator: keep the authored text verbatim. Dropping it
  // would silently lose real head-to-head studies whose comparator was never linked.
  const label = arm.linkedAssetName ?? arm.intervention;
  return { key: `external:${label}`, label, unresolved: true };
}

/**
 * Both proof kinds are reported when both exist, never one hiding the other — the
 * same rule the cross-trial rows use for their arm-level metric and any stored
 * between-arm estimate. `armLevel` is the shared arm-level metric; `betweenArm` is
 * whatever direct estimate the source published for the same pair, alongside it.
 */
export type HeadToHeadEvidence = {
  armLevel: EfficacyValue[];
  betweenArm: EfficacyBetweenArmValue[];
};

export type HeadToHeadPair = {
  studyId: string;
  studyTitle: string;
  phase: string;
  population: string;
  duration: string | null;
  endpointName: string;
  assessmentTimepoint: string;
  left: ComparisonEntity;
  right: ComparisonEntity;
  evidence: HeadToHeadEvidence;
  href: string;
};

function pairKey(a: ComparisonEntity, b: ComparisonEntity): string {
  return [a.key, b.key].sort().join(" :: ");
}

function toValue(view: OutcomeView, armById: Map<string, ArmView>): EfficacyValue {
  const label = view.groupLabel
    ? view.groupLabel
    : (view.outcome.armIds ?? [])
        .map((armId) => armById.get(armId)?.label ?? armId)
        .join(" / ");
  return {
    value: view.outcome.result.value,
    unit: view.outcome.result.unit,
    label,
    armRole: armById.get((view.outcome.armIds ?? [])[0])?.role ?? "other",
    outcomeId: view.outcome.id,
    resultType: view.outcome.result.resultType,
    armIds: view.outcome.armIds,
    analysisGroupId: view.outcome.analysisGroupId,
    maturity: view.outcome.maturity,
  };
}

/**
 * Finds every entity pair this Study actually compared, proven from its body-weight
 * Outcomes.
 *
 * Two qualifying proofs, and nothing else:
 *   (a) a stored between-arm Outcome whose arms resolve to two distinct entities;
 *   (b) arm-level Outcomes for two distinct entities inside one endpoint and one
 *       canonicalized analysis population + estimand — i.e. results the source
 *       reported together.
 *
 * Arm-level results from different comparison groups are never combined, and the Arm
 * list is never enumerated pairwise.
 */
export function findHeadToHeadPairs(detail: StudyDetailView): HeadToHeadPair[] {
  const { study, arms } = detail;
  const armById = new Map(arms.map((arm) => [arm.id, arm]));
  const entityByArmId = new Map<string, ComparisonEntity>();
  for (const arm of arms) {
    const entity = resolveArmEntity(arm, study);
    if (entity) entityByArmId.set(arm.id, entity);
  }

  const pairs = new Map<string, HeadToHeadPair>();

  for (const endpointGroup of detail.endpointGroups) {
    if (endpointGroup.endpoint.domain !== "body weight") continue;

    const base = {
      studyId: study.id,
      studyTitle: study.acronym?.trim() || study.officialTitle,
      phase: study.phase,
      population: study.population,
      duration: study.overallDuration ?? null,
      endpointName: endpointGroup.endpoint.name,
      assessmentTimepoint: endpointGroup.endpoint.assessmentTimepoint,
      href: `/studies/${study.id}`,
    };

    // (a) stored direct estimates, grouped by the pair each proves.
    //
    // A between-arm Outcome is ONE reported comparison, so it proves exactly one
    // pair. Enumerating its arms pairwise would copy a single stored number onto
    // several pairs and assert comparisons the source never made.
    const betweenArmByPair = new Map<
      string,
      { entities: [ComparisonEntity, ComparisonEntity]; values: EfficacyBetweenArmValue[] }
    >();
    for (const view of endpointGroup.outcomes) {
      if (view.outcome.result.resultType !== "between-arm") continue;
      const entities = Array.from(
        new Map(
          (view.outcome.armIds ?? [])
            .map((armId) => entityByArmId.get(armId))
            .filter((entity): entity is ComparisonEntity => Boolean(entity))
            .map((entity) => [entity.key, entity]),
        ).values(),
      );

      // Fewer than two entities: a dose comparison within one entity, or an
      // estimate anchored on placebo. Neither is a head-to-head.
      if (entities.length < 2) continue;

      if (entities.length > 2) {
        throw new Error(
          `Efficacy Comparison: between-arm Outcome "${view.outcome.id}" in study "${study.id}" ` +
            `resolves ${entities.length} distinct comparison entities ` +
            `(${entities.map((entity) => entity.key).join(", ")}); a single stored estimate ` +
            `cannot be attributed to more than one entity pair`,
        );
      }

      const key = pairKey(entities[0], entities[1]);
      const bucket = betweenArmByPair.get(key) ?? {
        entities: [entities[0], entities[1]] as [ComparisonEntity, ComparisonEntity],
        values: [],
      };
      bucket.values.push({
        ...toValue(view, armById),
        effectMeasure: view.outcome.result.effectMeasure,
        comparisonType: view.outcome.result.comparisonType,
        confidenceInterval: view.outcome.result.confidenceInterval,
        pValue: view.outcome.result.pValue,
      });
      betweenArmByPair.set(key, bucket);
    }

    // (b) arm-level results the source reported together, grouped by the pair.
    const coReported = new Map<string, OutcomeView[]>();
    for (const view of endpointGroup.outcomes) {
      if (view.outcome.result.resultType !== "arm-level") continue;
      const key = [
        endpointGroup.endpoint.id,
        canonicalizeClinicalAnalysisPopulation(view.outcome.analysisPopulation),
        canonicalizeClinicalEstimand(view.outcome.estimand),
      ].join("|");
      const list = coReported.get(key);
      if (list) list.push(view);
      else coReported.set(key, [view]);
    }

    const armLevelByPair = new Map<
      string,
      { entities: [ComparisonEntity, ComparisonEntity]; values: EfficacyValue[] }
    >();
    for (const group of coReported.values()) {
      const byEntity = new Map<string, { entity: ComparisonEntity; views: OutcomeView[] }>();
      for (const view of group) {
        for (const armId of view.outcome.armIds ?? []) {
          const entity = entityByArmId.get(armId);
          if (!entity) continue;
          const bucket = byEntity.get(entity.key);
          if (bucket) bucket.views.push(view);
          else byEntity.set(entity.key, { entity, views: [view] });
        }
      }

      const entries = [...byEntity.values()];
      for (let i = 0; i < entries.length; i += 1) {
        for (let j = i + 1; j < entries.length; j += 1) {
          const key = pairKey(entries[i].entity, entries[j].entity);
          const bucket = armLevelByPair.get(key) ?? {
            entities: [entries[i].entity, entries[j].entity] as [ComparisonEntity, ComparisonEntity],
            values: [],
          };
          bucket.values.push(
            ...[...entries[i].views, ...entries[j].views].map((view) => toValue(view, armById)),
          );
          armLevelByPair.set(key, bucket);
        }
      }
    }

    // Merge: a pair proven by either proof is reported once, carrying whichever
    // evidence kinds this endpointGroup actually found for it. Arm-level is the
    // shared metric; a stored between-arm estimate rides alongside it rather than
    // replacing it. A pair already set by an earlier endpointGroup is left alone —
    // dedup stays scoped to the first proof encountered, same as before.
    const pairKeysHere = new Set([...betweenArmByPair.keys(), ...armLevelByPair.keys()]);
    for (const key of pairKeysHere) {
      if (pairs.has(key)) continue;
      const betweenArm = betweenArmByPair.get(key);
      const armLevel = armLevelByPair.get(key);
      const entities = armLevel?.entities ?? betweenArm!.entities;
      pairs.set(key, {
        ...base,
        left: entities[0],
        right: entities[1],
        evidence: {
          armLevel: armLevel?.values ?? [],
          betweenArm: betweenArm?.values ?? [],
        },
      });
    }
  }

  return [...pairs.values()];
}
