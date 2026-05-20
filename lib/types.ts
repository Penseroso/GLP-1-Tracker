export type DevelopmentStage =
  | "Discovery"
  | "Preclinical"
  | "IND-enabling"
  | "Phase 1"
  | "Phase 2"
  | "Phase 3"
  | "Filed"
  | "Approved"
  | "Discontinued"
  | "Unknown";

export type PipelineAsset = {
  id: string;
  company: string;
  assetName: string;
  codeName?: string;
  targetClass: string;
  mechanism?: string;
  indication: string[];
  route?: string;
  dosageForm?: string;
  dosingInterval?: string;
  stage: DevelopmentStage;
  stageRaw?: string;
  differentiator?: string;
  description?: string;
  sourceUrl?: string;
  lastChecked?: string;
};

export type CompanySummary = {
  id: string;
  name: string;
  focusAreas: string[];
  assetCount: number;
  mostAdvancedStage?: DevelopmentStage;
  sourceUrl?: string;
  lastChecked?: string;
};

export type DevelopmentStageFilter = DevelopmentStage | "All";

export type AssetFilters = {
  company: string;
  targetClass: string;
  indication: string;
  route: string;
  stage: DevelopmentStageFilter;
  keyword: string;
};
