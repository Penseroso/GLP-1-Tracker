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

export type DevelopmentStatus =
  | "Planned"
  | "Active"
  | "On hold"
  | "Completed"
  | "Discontinued"
  | "Approved"
  | "Unknown";

export type CompanyInfo = {
  name: string;
  country: string;
};

export type SourceReference = {
  url: string;
  title?: string;
  sourceType?: string;
  publishedAt?: string;
  checkedAt: string;
};

export type TppProfile = {
  targetClass: string;
  mechanism?: string;
  platform?: string;
  indications: string[];
  routes: string[];
  dosageForms: string[];
  dosingInterval?: string;
};

export type DevelopmentProfile = {
  stage: DevelopmentStage;
  status: DevelopmentStatus;
};

export type RecordMetadata = {
  lastVerifiedAt: string;
  updatedAt: string;
  sources: SourceReference[];
};

export type PipelineProgram = {
  id: string;
  assetId: string;
  company: CompanyInfo;
  assetName: string;
  codeName?: string;
  tpp: TppProfile;
  development: DevelopmentProfile;
  metadata: RecordMetadata;
};

export type CompanySummary = {
  id: string;
  name: string;
  focusAreas: string[];
  programCount: number;
  mostAdvancedStage?: DevelopmentStage;
  lastUpdated?: string;
};

export type DevelopmentStageFilter = DevelopmentStage | "All";
export type DevelopmentStatusFilter = DevelopmentStatus | "All";

export type ProgramFilters = {
  company: string;
  targetClass: string;
  indication: string;
  route: string;
  stage: DevelopmentStageFilter;
  status: DevelopmentStatusFilter;
  keyword: string;
};
