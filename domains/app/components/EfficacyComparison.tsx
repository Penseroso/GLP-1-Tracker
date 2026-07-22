import Link from "next/link";
import { EmptyState } from "@/domains/app/components/EmptyState";
import { EfficacySelectionDetails } from "@/domains/app/components/EfficacySelectionDetails";
import { formatNullableValue } from "@/domains/app/lib/format";
import type {
  EfficacyComparisonRow,
  EfficacyComparisonView,
  EfficacyCoverageGap,
} from "@/domains/app/lib/efficacy-comparison/read-model";

type EfficacyComparisonProps = {
  view: EfficacyComparisonView;
};

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

/**
 * User-facing wording for each disposition. Kept explicit rather than derived from
 * the reason slug: every one of these has to say what the data does *not* claim.
 * "No percent-change result" must never read as "this asset does not reduce weight",
 * and an unstated diabetes criterion is not the same as a non-diabetic population.
 */
const gapCopy: Record<EfficacyCoverageGap["reason"], string> = {
  "population-unclassified":
    "Study population is not yet classified, so eligibility cannot be decided.",
  "population-age-restricted":
    "Weight results come from adolescent or paediatric populations only.",
  "population-with-type-2-diabetes":
    "Weight results come from populations enrolled with type 2 diabetes.",
  "population-mixed-diabetes-status":
    "The protocol enrols both a non-diabetic and a type 2 diabetes cohort, and cohort-level population is not stored.",
  "population-diabetes-status-not-specified":
    "The source states no diabetes criterion, which is not the same as a non-diabetic population.",
  "population-requires-additional-condition":
    "Enrolment requires a further condition, such as knee osteoarthritis or heart failure.",
  "population-treatment-context":
    "Weight results come from maintenance, withdrawal, or post-lifestyle-intervention designs.",
  "design-not-randomized-controlled":
    "No randomised, controlled study carries a recorded weight result.",
  "phase-unresolved": "The recorded trial phase is not one this page ranks.",
  "metric-unavailable-percent":
    "Weight change is recorded, but not as percent change from baseline.",
  "mechanism-undisclosed":
    "The mechanism is not publicly disclosed, so no family can be assigned.",
  "regimen-family-unassigned":
    "This regimen has no assigned mechanism family.",
};

function ValueList({
  values,
}: {
  values: { value: string; unit: string; label: string; outcomeId: string }[];
}) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1">
      {values.map((value) => (
        <li key={value.outcomeId} className="text-sm">
          <span className="font-semibold tabular-nums text-foreground">
            {value.value}
          </span>{" "}
          <span className="text-muted-foreground">{value.unit}</span>
          <span className="block text-xs text-muted-foreground">{value.label}</span>
        </li>
      ))}
    </ul>
  );
}

function ComparisonRow({ row }: { row: EfficacyComparisonRow }) {
  const { evidence } = row;

  return (
    <li className="border-t border-border px-5 py-4 first:border-t-0">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-card-foreground">
            {row.href ? (
              <Link href={row.href} className={`rounded-sm hover:text-primary hover:underline ${focusRing}`}>
                {row.name}
              </Link>
            ) : (
              row.name
            )}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {row.companyName}
            {row.mechanism ? <> &middot; {row.mechanism}</> : null}
          </p>
        </div>
        <EfficacySelectionDetails
          unitName={row.name}
          rationale={evidence.selectionRationale}
          facts={[
            { label: "Study", value: evidence.studyTitle },
            { label: "Endpoint", value: evidence.endpointName },
            { label: "Endpoint role", value: evidence.endpointRole },
            { label: "Timepoint", value: evidence.assessmentTimepoint },
            { label: "Duration", value: formatNullableValue(evidence.duration) },
            { label: "Population", value: evidence.population },
            { label: "Estimand", value: formatNullableValue(evidence.estimand) },
            { label: "Analysis population", value: evidence.analysisPopulation },
            { label: "Result type", value: "Arm-level, as reported" },
            { label: "Evidence maturity", value: evidence.groupMaturities.join(", ") },
          ]}
        />
      </div>

      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <dt className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Change from baseline in body weight
          </dt>
          <dd className="mt-1.5">
            <ValueList values={evidence.treatmentValues} />
          </dd>
        </div>

        <div>
          <dt className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Placebo, same comparison group
          </dt>
          <dd className="mt-1.5">
            {evidence.placeboValues.length > 0 ? (
              <ValueList values={evidence.placeboValues} />
            ) : (
              <p className="text-sm italic text-muted-foreground">
                Not reported in this comparison group.
              </p>
            )}
          </dd>
        </div>

        <div>
          <dt className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Placebo-adjusted, as reported
          </dt>
          <dd className="mt-1.5">
            {evidence.storedBetweenArmValues.length > 0 ? (
              <ul className="space-y-1">
                {evidence.storedBetweenArmValues.map((value) => (
                  <li key={value.outcomeId} className="text-sm">
                    <span className="font-semibold tabular-nums text-foreground">
                      {value.value}
                    </span>{" "}
                    <span className="text-muted-foreground">{value.unit}</span>
                    <span className="block text-xs text-muted-foreground">
                      {formatNullableValue(value.comparisonType ?? value.effectMeasure)}
                      {value.confidenceInterval ? <> &middot; {value.confidenceInterval}</> : null}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                Not reported by the source.
              </p>
            )}
          </dd>
        </div>
      </dl>

      <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <Link
          href={`/studies/${evidence.studyId}`}
          className={`rounded-sm font-medium text-primary hover:underline ${focusRing}`}
        >
          {evidence.studyTitle}
        </Link>
        <span>{evidence.phase}</span>
        <span>{evidence.endpointName}</span>
        <span>{evidence.assessmentTimepoint}</span>
        <span>{formatNullableValue(evidence.duration)}</span>
        <span>{evidence.analysisPopulation}</span>
        {evidence.estimand ? <span>{evidence.estimand}</span> : null}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{evidence.population}</p>
    </li>
  );
}

export function EfficacyComparison({ view }: EfficacyComparisonProps) {
  const rowCount = view.families.reduce(
    (total, group) => total + group.rows.length,
    0,
  );

  return (
    <div className="space-y-6 pb-10">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Clinical evidence
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Efficacy Comparison
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Reported body-weight reduction by mechanism family, for assets and
          registered combination products with a recorded percent-change result.
        </p>
      </section>

      <section className="rounded-md border border-border bg-card p-5 shadow-soft">
        <h2 className="text-base font-semibold text-card-foreground">
          How this page selects its numbers
        </h2>
        <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
          <li>
            Every figure is a value a source reported. Nothing here is calculated,
            adjusted, averaged, or converted between units.
          </li>
          <li>
            One study is selected per asset by a fixed rule &mdash; trial phase,
            endpoint role, estimand, analysis population, source completeness, then
            evidence maturity &mdash; never by which result is largest.
          </li>
          <li>
            Only one measure appears: percent change from baseline in body weight, in
            adults enrolled without type 2 diabetes and starting treatment.
          </li>
          <li>
            <strong className="font-semibold text-foreground">
              These rows come from separate trials and are not a ranking.
            </strong>{" "}
            Populations, durations, and analyses differ, and no comparison between
            two rows is implied. Results from studies that compared two products
            directly are not part of this comparison.
          </li>
        </ul>
      </section>

      {rowCount === 0 ? (
        <section className="rounded-md border border-border bg-card shadow-soft">
          <EmptyState
            title="No comparable results"
            description="No asset currently has a recorded percent-change body-weight result in an eligible population."
          />
        </section>
      ) : (
        view.families.map((group) => (
          <section
            key={group.family.id}
            className="rounded-md border border-border bg-card shadow-soft"
          >
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold text-card-foreground">
                {group.family.label}
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {group.family.composition === "multi-component"
                  ? "Multi-component product"
                  : "Single molecule"}
                {" · "}
                {group.family.targets
                  .map((target) => `${target.target} ${target.action}`)
                  .join(", ")}
              </p>
            </div>
            <ul>
              {group.rows.map((row) => (
                <ComparisonRow key={row.unitKey} row={row} />
              ))}
            </ul>
          </section>
        ))
      )}

      <section className="rounded-md border border-border bg-card shadow-soft">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-card-foreground">
            Coverage gaps
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {view.gaps.length} of {view.totalUnits} assets with recorded body-weight
            evidence are not shown above. Each is listed with the reason it falls
            outside this comparison.
          </p>
        </div>
        {view.gaps.length === 0 ? (
          <EmptyState
            title="No coverage gaps"
            description="Every asset with recorded body-weight evidence appears in the comparison."
          />
        ) : (
          <ul className="divide-y divide-border">
            {view.gaps.map((gap) => (
              <li key={gap.unitKey} className="px-5 py-3">
                <p className="text-sm font-medium text-foreground">
                  {gap.href ? (
                    <Link
                      href={gap.href}
                      className={`rounded-sm hover:text-primary hover:underline ${focusRing}`}
                    >
                      {gap.name}
                    </Link>
                  ) : (
                    gap.name
                  )}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {gap.companyName}
                  </span>
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {gapCopy[gap.reason]}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
