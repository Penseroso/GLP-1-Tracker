import type { PipelineProgram, ProgramFilters } from "./types";

export const emptyProgramFilters: ProgramFilters = {
  company: "All",
  indication: "All",
  route: "All",
  stage: "All",
  status: "All",
  keyword: "",
};

export function optionalText(value?: string | null) {
  return value?.trim() ? value : "N/A";
}

export function joinValues(values: string[]) {
  return values.length > 0 ? values.join(" / ") : "N/A";
}

export function uniqueSorted<T extends string>(values: T[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
}

export function getFilterOptions(programs: PipelineProgram[]) {
  return {
    companies: uniqueSorted(
      programs.map((program) => program.company?.name ?? ""),
    ),
    indications: uniqueSorted(programs.flatMap((program) => program.indications)),
    routes: uniqueSorted(programs.map((program) => program.administration.route)),
    stages: uniqueSorted(programs.map((program) => program.development.stage)),
    statuses: uniqueSorted(programs.map((program) => program.development.status)),
  };
}

export function filterPrograms(
  programs: PipelineProgram[],
  filters: ProgramFilters,
) {
  const keyword = filters.keyword.trim().toLowerCase();

  return programs.filter((program) => {
    const companyName = program.company?.name ?? "";
    const companyCountry = program.company?.headquartersCountry ?? "";
    const matchesCompany =
      filters.company === "All" || companyName === filters.company;
    const matchesIndication =
      filters.indication === "All" ||
      program.indications.includes(filters.indication);
    const matchesRoute =
      filters.route === "All" || program.administration.route === filters.route;
    const matchesStage =
      filters.stage === "All" || program.development.stage === filters.stage;
    const matchesStatus =
      filters.status === "All" || program.development.status === filters.status;

    const searchable = [
      program.id,
      program.assetId,
      program.companyId,
      companyName,
      companyCountry,
      program.assetName,
      program.codeName,
      program.technical.mechanism,
      program.technical.platform,
      program.administration.route,
      program.administration.dosageForm,
      program.administration.dosingInterval,
      program.indications.join(" "),
      program.development.stage,
      program.development.status,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      matchesCompany &&
      matchesIndication &&
      matchesRoute &&
      matchesStage &&
      matchesStatus &&
      (!keyword || searchable.includes(keyword))
    );
  });
}
