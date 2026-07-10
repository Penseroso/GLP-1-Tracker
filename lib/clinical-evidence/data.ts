import clinicalEvidenceData from "@/data/generated/clinical-evidence.json";
import type { ClinicalEvidenceAggregate } from "./types";

export const clinicalEvidence = clinicalEvidenceData as ClinicalEvidenceAggregate;
export const clinicalStudies = clinicalEvidence.studies;
export const clinicalArms = clinicalEvidence.arms;
export const clinicalEndpoints = clinicalEvidence.endpoints;
export const clinicalOutcomes = clinicalEvidence.outcomes;
