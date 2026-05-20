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
  stage: string;
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
  mostAdvancedStage?: string;
  sourceUrl?: string;
  lastChecked?: string;
};

export type AssetFilters = {
  company: string;
  targetClass: string;
  indication: string;
  route: string;
  stage: string;
  keyword: string;
};
