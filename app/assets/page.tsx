import type { Metadata } from "next";
import { PipelineTable } from "@/components/PipelineTable";
import { pipelinePrograms } from "@/lib/programs/data";

export const metadata: Metadata = {
  title: "Program Register",
};

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
      <PipelineTable programs={pipelinePrograms} />
    </div>
  );
}
