"use client";

import { useMemo, useState } from "react";
import {
  defaultProgramTableColumns,
  getProgramTableColumnLabel,
  type ProgramTableColumnId,
} from "@/config/program-table";
import {
  emptyProgramFilters,
  filterPrograms,
  getFilterOptions,
  joinValues,
  optionalText,
} from "@/lib/filters";
import type { PipelineProgram, ProgramFilters } from "@/lib/types";
import { FilterBar } from "./FilterBar";
import { ProgramDetailDrawer } from "./ProgramDetailDrawer";

type PipelineTableProps = {
  programs: PipelineProgram[];
};

function getAssetLabel(program: PipelineProgram) {
  return program.codeName
    ? `${program.assetName} (${program.codeName})`
    : program.assetName;
}

function getProgramCellValue(
  program: PipelineProgram,
  columnId: ProgramTableColumnId,
) {
  switch (columnId) {
    case "company":
      return optionalText(program.company?.name);
    case "asset":
      return getAssetLabel(program);
    case "route":
      return optionalText(program.administration.route);
    case "dosageForm":
      return optionalText(program.administration.dosageForm);
    case "dosingInterval":
      return optionalText(program.administration.dosingInterval);
    case "indications":
      return joinValues(program.indications);
    case "development":
      return `${program.development.stage} \u00b7 ${program.development.status}`;
    case "mechanism":
      return optionalText(program.technical.mechanism);
    case "platform":
      return optionalText(program.technical.platform);
    case "companyCountry":
      return optionalText(program.company?.headquartersCountry);
  }
}

export function PipelineTable({ programs }: PipelineTableProps) {
  const [filters, setFilters] = useState<ProgramFilters>(emptyProgramFilters);
  const [selectedProgram, setSelectedProgram] = useState<PipelineProgram | null>(
    null,
  );

  const options = useMemo(() => getFilterOptions(programs), [programs]);
  const filteredPrograms = useMemo(
    () => filterPrograms(programs, filters),
    [programs, filters],
  );
  const visibleColumns = defaultProgramTableColumns;

  return (
    <div className="space-y-4">
      <FilterBar filters={filters} options={options} onChange={setFilters} />
      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
        <div className="flex flex-col gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-card-foreground">
              Program Register
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {filteredPrograms.length} of {programs.length} dataset programs shown
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFilters(emptyProgramFilters)}
            className="self-start rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground sm:self-auto"
          >
            Reset filters
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-muted/70 text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                {visibleColumns.map((column) => (
                  <th key={column.id} className="px-4 py-3 font-semibold">
                    {getProgramTableColumnLabel(column)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPrograms.map((program) => (
                <tr
                  key={program.id}
                  onClick={() => setSelectedProgram(program)}
                  className="cursor-pointer bg-card transition hover:bg-accent/45"
                >
                  {visibleColumns.map((column) => (
                    <td
                      key={column.id}
                      className="whitespace-nowrap px-4 py-4 text-muted-foreground"
                    >
                      {column.id === "development" ? (
                        <span className="rounded-md bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                          {getProgramCellValue(program, column.id)}
                        </span>
                      ) : (
                        getProgramCellValue(program, column.id)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {filteredPrograms.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleColumns.length}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    No programs to display.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
      <ProgramDetailDrawer
        program={selectedProgram}
        onClose={() => setSelectedProgram(null)}
      />
    </div>
  );
}
