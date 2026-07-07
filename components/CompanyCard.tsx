import { formatNullableValue } from "@/lib/format";
import type { CompanySummary } from "@/lib/programs/types";

type CompanyCardProps = {
  company: CompanySummary;
};

export function CompanyCard({ company }: CompanyCardProps) {
  return (
    <article className="rounded-lg border border-border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-card-foreground">
            {company.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {company.programCount} tracked{" "}
            {company.programCount === 1 ? "program" : "programs"}
          </p>
        </div>
        <span className="rounded-md bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
          {formatNullableValue(company.mostAdvancedStage)}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {company.focusAreas.map((area) => (
          <span
            key={area}
            className="rounded-md border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground"
          >
            {area}
          </span>
        ))}
      </div>
      <div className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
        Updated {formatNullableValue(company.lastUpdated)}
      </div>
    </article>
  );
}
