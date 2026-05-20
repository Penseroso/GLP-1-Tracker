import { PipelineTable } from "@/components/PipelineTable";
import { pipelineAssets } from "@/lib/data";

export default function AssetsPage() {
  return (
    <div className="space-y-6 pb-10">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Asset intelligence
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          GLP-1 Asset Register
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          Search and filter GLP-1-related mock pipeline assets by company,
          indication, target class, route, dosing format, interval, and stage.
        </p>
      </section>
      <PipelineTable assets={pipelineAssets} />
    </div>
  );
}
