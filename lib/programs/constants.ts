import type { DevelopmentStage, DevelopmentStatus } from "./types";

export const developmentStages = [
  "Discovery",
  "Preclinical",
  "IND-enabling",
  "Phase 1",
  "Phase 2",
  "Phase 3",
  "Filed",
  "Approved",
  "Unknown",
] as const satisfies readonly DevelopmentStage[];

export const developmentStatuses = [
  "Planned",
  "Active",
  "On hold",
  "Discontinued",
  "Unknown",
] as const satisfies readonly DevelopmentStatus[];

export const developmentStageRank: Record<DevelopmentStage, number> = {
  Unknown: 0,
  Discovery: 1,
  Preclinical: 2,
  "IND-enabling": 3,
  "Phase 1": 4,
  "Phase 2": 5,
  "Phase 3": 6,
  Filed: 7,
  Approved: 8,
};

export const clinicalDevelopmentStages = [
  "Phase 1",
  "Phase 2",
  "Phase 3",
  "Filed",
] as const satisfies readonly DevelopmentStage[];
