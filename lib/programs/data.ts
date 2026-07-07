import companyData from "@/data/companies.json";
import pipelineProgramData from "@/data/pipeline-programs.json";
import type { Company, PipelineProgram, PipelineProgramRecord } from "./types";

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
