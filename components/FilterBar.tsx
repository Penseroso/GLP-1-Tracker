"use client";

import type { AssetFilters } from "@/lib/types";

type FilterOptions = {
  companies: string[];
  targetClasses: string[];
  indications: string[];
  routes: string[];
  stages: string[];
};

type FilterBarProps = {
  filters: AssetFilters;
  options: FilterOptions;
  onChange: (filters: AssetFilters) => void;
};

const selectClassName =
  "h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

function SelectFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={selectClassName}
      >
        <option value="All">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FilterBar({ filters, options, onChange }: FilterBarProps) {
  const update = (partial: Partial<AssetFilters>) => {
    onChange({ ...filters, ...partial });
  };

  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-soft">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <label className="flex min-w-0 flex-col gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground xl:col-span-2">
          Keyword
          <input
            value={filters.keyword}
            onChange={(event) => update({ keyword: event.target.value })}
            placeholder="Search assets, mechanisms, differentiators"
            className="h-10 rounded-md border border-border bg-card px-3 text-sm font-normal normal-case tracking-normal text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </label>
        <SelectFilter
          label="Company"
          value={filters.company}
          options={options.companies}
          onChange={(company) => update({ company })}
        />
        <SelectFilter
          label="Target"
          value={filters.targetClass}
          options={options.targetClasses}
          onChange={(targetClass) => update({ targetClass })}
        />
        <SelectFilter
          label="Indication"
          value={filters.indication}
          options={options.indications}
          onChange={(indication) => update({ indication })}
        />
        <SelectFilter
          label="Route"
          value={filters.route}
          options={options.routes}
          onChange={(route) => update({ route })}
        />
        <SelectFilter
          label="Stage"
          value={filters.stage}
          options={options.stages}
          onChange={(stage) => update({ stage })}
        />
      </div>
    </section>
  );
}
