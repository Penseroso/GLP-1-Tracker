import candidateFile from "@/data/candidates/qlbiopharm.pipeline.refresh.candidate.json";
import type { ReactNode } from "react";

type CandidateSummary = {
  status?: string;
  newAssets?: number;
  updatedAssets?: number;
  removedOrNoLongerListedAssets?: number;
  unchangedAssets?: number;
  notes?: string;
};

type AssetCandidate = {
  assetName?: string;
  codeName?: string;
  targetClass?: string;
  indication?: string[] | string;
  route?: string[] | string;
  dosageForm?: string;
  dosingInterval?: string;
  stage?: string;
  stageRaw?: string;
  confidence?: string;
  qaStatus?: string;
  sourceUrl?: string;
  notes?: string;
};

type DiffRecord = {
  type?: string;
  assetId?: string;
  field?: string;
  approvedValue?: unknown;
  candidateValue?: unknown;
  confidence?: string;
  qaStatus?: string;
  notes?: string;
};

type RefreshCandidateFile = {
  company?: string;
  companyId?: string;
  sourceUrl?: string;
  checkedAt?: string;
  refreshMode?: string;
  comparisonBase?: string;
  summary?: CandidateSummary;
  assets?: AssetCandidate[];
  diffs?: DiffRecord[];
  extractionNotes?: string[];
  unresolvedQuestions?: string[];
};

const candidate = candidateFile as RefreshCandidateFile;
const assets = candidate.assets ?? [];
const diffs = candidate.diffs ?? [];
const isTemplate = candidate.refreshMode === "template";
const isEmpty = assets.length === 0 && diffs.length === 0;

function displayValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "-";
  }

  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function MetadataItem({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-semibold text-foreground">
        {value ?? "-"}
      </dd>
    </div>
  );
}

function NotesList({ items }: { items?: string[] }) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-muted-foreground">-</p>;
  }

  return (
    <ul className="space-y-2 text-sm text-muted-foreground">
      {items.map((item) => (
        <li key={item} className="rounded-md bg-background px-3 py-2">
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function QaPage() {
  return (
    <div className="space-y-6 pb-10">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Local QA
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Pipeline Candidate Review
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              Read-only review surface for local candidate refresh files. Candidate
              data is not approved until it passes the local QA workflow.
            </p>
          </div>
          {isTemplate ? (
            <span className="inline-flex h-9 items-center rounded-md border border-border bg-muted px-3 text-sm font-semibold text-muted-foreground">
              Template
            </span>
          ) : null}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5 shadow-soft">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-card-foreground">
              Company Metadata
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Source and refresh context from the candidate file.
            </p>
          </div>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <MetadataItem label="Company" value={candidate.company} />
          <MetadataItem label="Company ID" value={candidate.companyId} />
          <MetadataItem
            label="Source URL"
            value={
              candidate.sourceUrl ? (
                <a
                  href={candidate.sourceUrl}
                  className="text-primary underline-offset-4 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {candidate.sourceUrl}
                </a>
              ) : (
                "-"
              )
            }
          />
          <MetadataItem label="Checked At" value={candidate.checkedAt} />
          <MetadataItem label="Refresh Mode" value={candidate.refreshMode} />
          <MetadataItem label="Comparison Base" value={candidate.comparisonBase} />
        </dl>

        {candidate.summary ? (
          <div className="mt-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Summary
            </h3>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              <MetadataItem label="Status" value={candidate.summary.status} />
              <MetadataItem label="New" value={candidate.summary.newAssets} />
              <MetadataItem label="Updated" value={candidate.summary.updatedAssets} />
              <MetadataItem
                label="No Longer Listed"
                value={candidate.summary.removedOrNoLongerListedAssets}
              />
              <MetadataItem
                label="Unchanged"
                value={candidate.summary.unchangedAssets}
              />
              <MetadataItem label="Notes" value={candidate.summary.notes} />
            </dl>
          </div>
        ) : null}
      </section>

      {isTemplate ? (
        <section className="rounded-lg border border-border bg-muted p-4">
          <p className="text-sm font-medium text-muted-foreground">
            This candidate file is a template state, not real research output.
          </p>
        </section>
      ) : null}

      {isEmpty ? (
        <section className="rounded-lg border border-dashed border-border bg-card p-8 text-center shadow-soft">
          <p className="text-sm font-semibold text-foreground">
            No candidate assets or diffs yet. Run 02 with a target company to
            generate review data.
          </p>
        </section>
      ) : null}

      <section className="rounded-lg border border-border bg-card shadow-soft">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-xl font-semibold tracking-tight text-card-foreground">
            Asset Candidates
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[84rem] border-collapse text-left text-sm">
            <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                {[
                  "Asset",
                  "Code",
                  "Target",
                  "Indication",
                  "Route",
                  "Form",
                  "Interval",
                  "Stage",
                  "Stage Raw",
                  "Confidence",
                  "QA",
                  "Source",
                  "Notes",
                ].map((header) => (
                  <th key={header} className="px-4 py-3 font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {assets.length > 0 ? (
                assets.map((asset, index) => (
                  <tr key={`${asset.assetName ?? "asset"}-${index}`}>
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {displayValue(asset.assetName)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {displayValue(asset.codeName)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {displayValue(asset.targetClass)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {displayValue(asset.indication)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {displayValue(asset.route)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {displayValue(asset.dosageForm)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {displayValue(asset.dosingInterval)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {displayValue(asset.stage)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {displayValue(asset.stageRaw)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {displayValue(asset.confidence)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {displayValue(asset.qaStatus)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {asset.sourceUrl ? (
                        <a
                          href={asset.sourceUrl}
                          className="text-primary underline-offset-4 hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Source
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {displayValue(asset.notes)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={13}
                    className="px-4 py-6 text-center text-muted-foreground"
                  >
                    No asset candidates in this file.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card shadow-soft">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-xl font-semibold tracking-tight text-card-foreground">
            Diff Records
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[62rem] border-collapse text-left text-sm">
            <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                {[
                  "Type",
                  "Asset ID",
                  "Field",
                  "Approved",
                  "Candidate",
                  "Confidence",
                  "QA",
                  "Notes",
                ].map((header) => (
                  <th key={header} className="px-4 py-3 font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {diffs.length > 0 ? (
                diffs.map((diff, index) => (
                  <tr key={`${diff.assetId ?? "diff"}-${index}`}>
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {displayValue(diff.type)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {displayValue(diff.assetId)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {displayValue(diff.field)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {displayValue(diff.approvedValue)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {displayValue(diff.candidateValue)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {displayValue(diff.confidence)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {displayValue(diff.qaStatus)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {displayValue(diff.notes)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-6 text-center text-muted-foreground"
                  >
                    No diff records in this file.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5 shadow-soft">
          <h2 className="text-xl font-semibold tracking-tight text-card-foreground">
            Extraction Notes
          </h2>
          <div className="mt-3">
            <NotesList items={candidate.extractionNotes} />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 shadow-soft">
          <h2 className="text-xl font-semibold tracking-tight text-card-foreground">
            Unresolved Questions
          </h2>
          <div className="mt-3">
            <NotesList items={candidate.unresolvedQuestions} />
          </div>
        </div>
      </section>
    </div>
  );
}
