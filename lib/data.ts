import pipelineProgramData from "@/data/pipeline-assets.json";
import type { CompanySummary, DevelopmentStage, PipelineProgram } from "./types";

export const pipelinePrograms = pipelineProgramData as PipelineProgram[];

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

function getMostAdvancedStage(programs: PipelineProgram[]) {
  return programs.reduce<DevelopmentStage | undefined>((current, program) => {
    if (!current) {
      return program.development.stage;
    }

    return stageRank[program.development.stage] > stageRank[current]
      ? program.development.stage
      : current;
  }, undefined);
}

function buildCompanySummaries(programs: PipelineProgram[]): CompanySummary[] {
  const programsByCompany = new Map<string, PipelineProgram[]>();

  for (const program of programs) {
    const companyPrograms = programsByCompany.get(program.company.name) ?? [];
    companyPrograms.push(program);
    programsByCompany.set(program.company.name, companyPrograms);
  }

  return Array.from(programsByCompany.entries())
    .map(([company, companyPrograms]) => ({
      id: slugifyCompanyName(company),
      name: company,
      focusAreas: uniqueSorted(
        companyPrograms.flatMap((program) => program.tpp.indications),
      ),
      programCount: companyPrograms.length,
      mostAdvancedStage: getMostAdvancedStage(companyPrograms),
      lastUpdated: latestDate(
        companyPrograms.map((program) => program.metadata.updatedAt),
      ),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export const companySummaries = buildCompanySummaries(pipelinePrograms);
