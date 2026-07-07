import companyData from "@/data/companies.json";
import pipelineProgramData from "@/data/pipeline-programs.json";
import type {
  Company,
  CompanySummary,
  DevelopmentStage,
  PipelineProgram,
  PipelineProgramRecord,
} from "./types";

export const companies = companyData as Company[];
export const pipelineProgramRecords =
  pipelineProgramData as PipelineProgramRecord[];

const companiesById = new Map(companies.map((company) => [company.id, company]));

export const pipelinePrograms: PipelineProgram[] = pipelineProgramRecords.map(
  (program) => ({
    ...program,
    company: companiesById.get(program.companyId) ?? null,
  }),
);

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
};

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

function buildCompanySummaries(
  companyRecords: Company[],
  programs: PipelineProgram[],
): CompanySummary[] {
  const programsByCompanyId = new Map<string, PipelineProgram[]>();

  for (const program of programs) {
    const companyPrograms = programsByCompanyId.get(program.companyId) ?? [];
    companyPrograms.push(program);
    programsByCompanyId.set(program.companyId, companyPrograms);
  }

  return companyRecords
    .map((company) => {
      const companyPrograms = programsByCompanyId.get(company.id) ?? [];

      return {
        id: company.id,
        name: company.name,
        headquartersCountry: company.headquartersCountry,
        focusAreas: uniqueSorted(
          companyPrograms.flatMap((program) => program.indications),
        ),
        programCount: companyPrograms.length,
        mostAdvancedStage: getMostAdvancedStage(companyPrograms),
        lastUpdated: latestDate(
          companyPrograms.map((program) => program.metadata.updatedAt),
        ),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export const companySummaries = buildCompanySummaries(
  companies,
  pipelinePrograms,
);
