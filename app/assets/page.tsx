import type { Metadata } from "next";
import { PipelineTable } from "@/components/PipelineTable";
import {
  getProgramStudyPreview,
  type ProgramStudyPreview,
} from "@/lib/clinical-evidence/selectors";
import { pipelinePrograms } from "@/lib/programs/data";

export const metadata: Metadata = {
  title: "Program Register",
};

// Precompute explicit programId matches so the client drawer never imports or
// infers relationships from the Clinical Evidence data layer.
const clinicalPreviewByProgramId: Record<string, ProgramStudyPreview> =
  Object.fromEntries(
    pipelinePrograms.flatMap((program) => {
      const preview = getProgramStudyPreview(program.id);
      return preview ? [[program.id, preview]] : [];
    }),
  );

export default function AssetsPage() {
  return (
    <div className="space-y-6 pb-10">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Program intelligence
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Program Register
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          A searchable register of obesity/incretin development programs.
          Filter by company, indication, route, development stage, and
          development status.
        </p>
      </section>
      <PipelineTable
        programs={pipelinePrograms}
        clinicalPreviewByProgramId={clinicalPreviewByProgramId}
      />
    </div>
  );
}
