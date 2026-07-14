import Link from "next/link";
import type {
  ProgramStudyPreview,
  StudySummaryView,
} from "@/lib/clinical-evidence/selectors";

function PreviewRow({ study }: { study: StudySummaryView }) {
  return (
    <Link
      href={`/studies/${study.id}`}
      className="flex flex-col gap-1 rounded-md border border-border bg-card p-3 transition hover:bg-accent/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {study.referenceRegistryId ? (
        <span className="text-xs font-medium text-muted-foreground">
          {study.referenceRegistryId}
        </span>
      ) : null}
      <span className="text-sm font-semibold text-card-foreground">
        {study.title}
      </span>
      <span className="text-xs text-muted-foreground">
        {study.phase} · {study.registryStatus.sourceStatus}
      </span>
      <span className="text-xs text-muted-foreground">
        {study.hasReportedOutcomes
          ? "Recorded outcomes available"
          : "No recorded outcomes"}
      </span>
    </Link>
  );
}

/** Presentational preview of Studies with this exact programId. */
export function StudyPreviewList({ preview }: { preview: ProgramStudyPreview }) {
  return (
    <section aria-label="Clinical studies for this program" className="mb-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">
          Clinical studies for this program
        </h3>
        <span className="text-xs text-muted-foreground">
          {preview.totalCount} {preview.totalCount === 1 ? "study" : "studies"}
        </span>
      </div>
      <div className="mt-3 space-y-2">
        {preview.studies.map((study) => (
          <PreviewRow key={study.id} study={study} />
        ))}
      </div>
      <Link
        href={preview.href}
        className="mt-3 inline-flex items-center gap-1 rounded-md border border-border bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground transition hover:bg-accent/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        View Asset Clinical Detail →
      </Link>
    </section>
  );
}
