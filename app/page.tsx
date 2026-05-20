import Link from "next/link";
import { CompanyCard } from "@/components/CompanyCard";
import { StatCard } from "@/components/StatCard";
import { companySummaries, pipelineAssets } from "@/lib/data";
import type { DevelopmentStage } from "@/lib/types";

export default function OverviewPage() {
  const clinicalStages: DevelopmentStage[] = ["Phase 1", "Phase 2", "Phase 3", "Filed"];
  const clinicalStageAssets = pipelineAssets.filter((asset) =>
    clinicalStages.includes(asset.stage),
  ).length;
  const lastUpdated = pipelineAssets
    .map((asset) => asset.lastChecked)
    .filter(Boolean)
    .sort()
    .at(-1);

  return (
    <div className="space-y-8 pb-10">
      <section className="grid gap-6 lg:grid-cols-[1fr_21rem] lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Pipeline intelligence
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            GLP-1 Pipeline Board
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            Organizes GLP-1-related pipeline assets across companies,
            indications, target classes, routes, dosing formats, intervals, and
            development stages using a source-ready sample dataset.
          </p>
        </div>
        <Link
          href="/assets"
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Browse assets
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Dataset Companies"
          value={companySummaries.length}
          helper="Curated company summaries"
        />
        <StatCard
          label="Dataset Assets"
          value={pipelineAssets.length}
          helper="Source-ready asset records"
        />
        <StatCard
          label="Clinical-stage Assets"
          value={clinicalStageAssets}
          helper="Phase 1 or later in the sample dataset"
        />
        <StatCard
          label="Last Updated"
          value={lastUpdated ?? "—"}
          helper="Latest sample source review date"
        />
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Company Overview
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Company summaries structured around a source-ready schema.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {companySummaries.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-card-foreground">
              Recent Source Checks
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sample source review dates for dataset readiness. Change
              intelligence and automated collection are not enabled in this
              version.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:w-[30rem]">
            {companySummaries.map((company) => (
              <div
                key={company.id}
                className="rounded-md border border-border bg-background px-3 py-2"
              >
                <p className="text-sm font-semibold text-foreground">
                  {company.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {company.lastChecked ?? "—"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
