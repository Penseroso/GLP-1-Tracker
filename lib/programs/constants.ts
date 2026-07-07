import developmentStageRegistry from "@/data/registries/development-stages.json";

export type DevelopmentStageRegistryEntry = {
  id: string;
  label: string;
  family: string;
  aliases: string[];
  sortRank: number;
};

const stageRegistry = developmentStageRegistry as DevelopmentStageRegistryEntry[];

export const developmentStages = stageRegistry
  .slice()
  .sort((a, b) => a.sortRank - b.sortRank || a.label.localeCompare(b.label))
  .map((stage) => stage.label);

export const developmentStatuses = [
  "Planned",
  "Active",
  "On hold",
  "Discontinued",
  "Unknown",
] as const;

export const developmentStageRank = Object.fromEntries(
  stageRegistry.map((stage) => [stage.label, stage.sortRank]),
) as Record<string, number>;

export const clinicalDevelopmentStages = developmentStages.filter((stage) => {
  const rank = developmentStageRank[stage] ?? 0;
  return rank >= 40;
});
