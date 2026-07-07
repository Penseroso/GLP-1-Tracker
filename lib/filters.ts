import type { PipelineProgram, ProgramFilters } from "./types";

export const emptyProgramFilters: ProgramFilters = {
  company: "All",
  targetClass: "All",
  indication: "All",
  route: "All",
  stage: "All",
  status: "All",
  keyword: "",
};

export function optionalText(value?: string) {
  return value?.trim() ? value : "—";
}

export function joinValues(values: string[]) {
  return values.length > 0 ? values.join(" / ") : "—";
}

export function uniqueSorted<T extends string>(values: T[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
}

export function getFilterOptions(programs: PipelineProgram[]) {
  return {
    companies: uniqueSorted(programs.map((program) => program.company.name)),
    targetClasses: uniqueSorted(programs.map((program) => program.tpp.targetClass)),
    indications: uniqueSorted(
      programs.flatMap((program) => program.tpp.indications),
    ),
    routes: uniqueSorted(programs.flatMap((program) => program.tpp.routes)),
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
    const matchesCompany =
      filters.company === "All" || program.company.name === filters.company;
    const matchesTarget =
      filters.targetClass === "All" ||
      program.tpp.targetClass === filters.targetClass;
    const matchesIndication =
      filters.indication === "All" ||
      program.tpp.indications.includes(filters.indication);
    const matchesRoute =
      filters.route === "All" || program.tpp.routes.includes(filters.route);
    const matchesStage =
      filters.stage === "All" || program.development.stage === filters.stage;
    const matchesStatus =
      filters.status === "All" || program.development.status === filters.status;

    const searchable = [
      program.id,
      program.assetId,
      program.company.name,
      program.company.country,
      program.assetName,
      program.codeName,
      program.tpp.targetClass,
      program.tpp.mechanism,
      program.tpp.platform,
      program.tpp.indications.join(" "),
      program.tpp.routes.join(" "),
      program.tpp.dosageForms.join(" "),
      program.tpp.dosingInterval,
      program.development.stage,
      program.development.status,
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
      matchesStatus &&
      (!keyword || searchable.includes(keyword))
    );
  });
}
