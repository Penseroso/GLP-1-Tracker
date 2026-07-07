import type { AssetFilters, PipelineAsset } from "./types";

export const emptyAssetFilters: AssetFilters = {
  company: "All",
  targetClass: "All",
  indication: "All",
  route: "All",
  stage: "All",
  keyword: "",
};

export function optionalText(value?: string) {
  return value?.trim() ? value : "None";
}

export function uniqueSorted<T extends string>(values: T[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
}

export function getFilterOptions(assets: PipelineAsset[]) {
  return {
    companies: uniqueSorted(assets.map((asset) => asset.company)),
    targetClasses: uniqueSorted(assets.map((asset) => asset.targetClass)),
    indications: uniqueSorted(assets.flatMap((asset) => asset.indication)),
    routes: uniqueSorted(assets.map((asset) => asset.route ?? "")),
    stages: uniqueSorted(assets.map((asset) => asset.stage)),
  };
}

export function filterAssets(assets: PipelineAsset[], filters: AssetFilters) {
  const keyword = filters.keyword.trim().toLowerCase();

  return assets.filter((asset) => {
    const matchesCompany =
      filters.company === "All" || asset.company === filters.company;
    const matchesTarget =
      filters.targetClass === "All" ||
      asset.targetClass === filters.targetClass;
    const matchesIndication =
      filters.indication === "All" ||
      asset.indication.includes(filters.indication);
    const matchesRoute =
      filters.route === "All" || asset.route === filters.route;
    const matchesStage =
      filters.stage === "All" || asset.stage === filters.stage;

    const searchable = [
      asset.company,
      asset.assetName,
      asset.codeName,
      asset.targetClass,
      asset.mechanism,
      asset.indication.join(" "),
      asset.route,
      asset.dosageForm,
      asset.dosingInterval,
      asset.stage,
      asset.stageRaw,
      asset.differentiator,
      asset.description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      matchesCompany &&
      matchesTarget &&
      matchesIndication &&
      matchesRoute &&
      matchesStage &&
      (!keyword || searchable.includes(keyword))
    );
  });
}
