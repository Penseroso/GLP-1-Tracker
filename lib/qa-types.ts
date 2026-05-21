export type CandidateSummary = {
  status?: string;
  newAssets?: number;
  updatedAssets?: number;
  removedOrNoLongerListedAssets?: number;
  unchangedAssets?: number;
  notes?: string;
};

export type CandidateAsset = {
  id?: string;
  company?: string;
  assetName?: string;
  codeName?: string;
  targetClass?: string;
  mechanism?: string;
  indication?: string[] | string;
  route?: string[] | string;
  dosageForm?: string;
  dosingInterval?: string;
  stage?: string;
  stageRaw?: string;
  differentiator?: string;
  description?: string;
  sourceUrl?: string;
  lastChecked?: string;
  confidence?: string;
  status?: string;
  qaStatus?: string;
  notes?: string;
};

export type DiffRecord = {
  type?: string;
  assetId?: string;
  field?: string;
  approvedValue?: unknown;
  candidateValue?: unknown;
  confidence?: string;
  qaStatus?: string;
  notes?: string;
};

export type RefreshCandidateFile = {
  company?: string;
  companyId?: string;
  sourceUrl?: string;
  checkedAt?: string;
  refreshMode?: string;
  comparisonBase?: string;
  summary?: CandidateSummary;
  assets?: CandidateAsset[];
  diffs?: DiffRecord[];
  extractionNotes?: string[];
  unresolvedQuestions?: string[];
};

export type CandidateFileRecord = {
  fileName: string;
  candidate: RefreshCandidateFile;
};

export type ApproveRequest = {
  candidateFile: string;
  assetIds: string[];
};

export type ApproveResponse = {
  approvedCount: number;
  insertedCount: number;
  updatedCount: number;
  skippedCount: number;
  warnings: string[];
};
