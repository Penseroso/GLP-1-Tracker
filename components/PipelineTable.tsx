"use client";

import { useMemo, useState } from "react";
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

function inlineValues(values: Array<string | undefined>) {
  return joinValues(values.filter((value): value is string => Boolean(value)));
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
                {[
                  "개발사 / 자산",
                  "기전 / 플랫폼",
                  "경로 / 제형",
                  "투여주기",
                  "적응증",
                  "개발단계",
                  "개발상태",
                ].map((header) => (
                  <th key={header} className="px-4 py-3 font-semibold">
                    {header}
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
                  <td className="px-4 py-4 font-medium text-foreground">
                    {inlineValues([
                      program.company.name,
                      program.assetName,
                      program.codeName,
                    ])}
                  </td>
                  <td className="px-4 py-4 text-foreground">
                    {inlineValues([
                      program.tpp.targetClass,
                      program.tpp.mechanism,
                      program.tpp.platform,
                    ])}
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {inlineValues([
                      ...program.tpp.routes,
                      ...program.tpp.dosageForms,
                    ])}
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {optionalText(program.tpp.dosingInterval)}
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {joinValues(program.tpp.indications)}
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-md bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                      {program.development.stage}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                      {program.development.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredPrograms.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
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
