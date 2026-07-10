import type { ComponentReference, RecordMetadata } from "@/lib/programs/types";

export type ClinicalEvidenceAggregate = {
  studies: ClinicalStudyRecord[];
  arms: ClinicalArmRecord[];
  endpoints: ClinicalEndpointRecord[];
  outcomes: ClinicalOutcomeRecord[];
};

export type ClinicalRegistryIdentifier = {
  registry: string;
  id: string;
};

export type ClinicalStudyDesign = {
  randomization: string;
  masking: string;
  comparator: string;
  description?: string;
};

export type ClinicalStudyRecord = {
  id: string;
  companyId: string;
  assetId: string;
  programId?: string;
  regimenId?: string;
  officialTitle: string;
  acronym?: string;
  registryIdentifiers: ClinicalRegistryIdentifier[];
  protocolIdentifiers?: string[];
  phase: string;
  status: string;
  design: ClinicalStudyDesign;
  population: string;
  overallDuration?: string;
  followUpDuration?: string;
  safetySummary?: string;
  metadata: RecordMetadata;
};

export type ClinicalArmRole =
  | "experimental"
  | "placebo"
  | "active comparator"
  | "other";

export type ClinicalArmRecord = {
  id: string;
  studyId: string;
  role: ClinicalArmRole;
  label: string;
  intervention: string;
  linkedAsset?: ComponentReference;
  dose: string;
  titration?: string;
  route: string;
  dosingFrequency: string;
  treatmentDuration: string;
  plannedN?: number;
  analyzedN?: number;
};

export type ClinicalEndpointRecord = {
  id: string;
  studyId: string;
  name: string;
  classification: string;
  assessmentTimepoint: string;
};

export type ClinicalResultMaturity =
  | "interim"
  | "topline"
  | "final"
  | "registry result"
  | "conference result"
  | "peer-reviewed publication";

export type ClinicalReportedResult = {
  value: string;
  unit: string;
  resultType: "arm-level" | "between-arm";
  comparisonType?: string;
  confidenceInterval?: string;
  pValue?: string;
  responderThreshold?: string;
};

export type ClinicalOutcomeRecord = {
  id: string;
  studyId: string;
  endpointId: string;
  armIds: string[];
  analysisPopulation: string;
  estimand?: string;
  result: ClinicalReportedResult;
  maturity: ClinicalResultMaturity;
  metadata: RecordMetadata;
};
