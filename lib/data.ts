import generatedPipelineAssets from "@/data/generated/pipeline-assets.json";
import type { CompanySummary, DevelopmentStage, PipelineAsset } from "./types";

export const pipelineAssets = generatedPipelineAssets as PipelineAsset[];

const stageRank: Record<DevelopmentStage, number> = {
  Unknown: 0,
  Discovery: 1,
  Preclinical: 2,
  "IND-enabling": 3,
  "Phase 1": 4,
  "Phase 2": 5,
  "Phase 3": 6,
  Filed: 7,
  Approved: 8,
  Discontinued: -1,
};

function slugifyCompanyName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
}

function latestDate(values: Array<string | undefined>) {
  return values.filter(Boolean).sort().at(-1);
}

function getMostAdvancedStage(assets: PipelineAsset[]) {
  return assets.reduce<DevelopmentStage | undefined>((current, asset) => {
    if (!current) {
      return asset.stage;
    }

    return stageRank[asset.stage] > stageRank[current] ? asset.stage : current;
  }, undefined);
}

function buildCompanySummaries(assets: PipelineAsset[]): CompanySummary[] {
  const assetsByCompany = new Map<string, PipelineAsset[]>();

  for (const asset of assets) {
    const companyAssets = assetsByCompany.get(asset.company) ?? [];
    companyAssets.push(asset);
    assetsByCompany.set(asset.company, companyAssets);
  }

  return Array.from(assetsByCompany.entries())
    .map(([company, companyAssets]) => ({
      id: slugifyCompanyName(company),
      name: company,
      focusAreas: uniqueSorted(companyAssets.flatMap((asset) => asset.indication)),
      assetCount: companyAssets.length,
      mostAdvancedStage: getMostAdvancedStage(companyAssets),
      sourceUrl: companyAssets.find((asset) => asset.sourceUrl)?.sourceUrl,
      lastChecked: latestDate(companyAssets.map((asset) => asset.lastChecked)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export const companySummaries = buildCompanySummaries(pipelineAssets);
