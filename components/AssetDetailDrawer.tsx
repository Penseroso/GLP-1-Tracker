"use client";

import type { PipelineAsset } from "@/lib/types";
import { optionalText } from "@/lib/filters";

type AssetDetailDrawerProps = {
  asset: PipelineAsset | null;
  onClose: () => void;
};

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="grid gap-1 border-b border-border py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm text-foreground">{optionalText(value)}</dd>
    </div>
  );
}

export function AssetDetailDrawer({ asset, onClose }: AssetDetailDrawerProps) {
  if (!asset) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close asset detail"
        className="absolute inset-0 cursor-default bg-slate-950/30"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-card shadow-2xl">
        <div className="border-b border-border px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary">{asset.company}</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-card-foreground">
                {asset.assetName}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Code {optionalText(asset.codeName)}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              Close
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <dl>
            <DetailRow label="Company" value={asset.company} />
            <DetailRow label="Target class" value={asset.targetClass} />
            <DetailRow label="Mechanism" value={asset.mechanism} />
            <DetailRow label="Indication" value={asset.indication.join(", ")} />
            <DetailRow label="Route" value={asset.route} />
            <DetailRow label="Dosage form" value={asset.dosageForm} />
            <DetailRow label="Interval" value={asset.dosingInterval} />
            <DetailRow label="Stage" value={asset.stage} />
            <DetailRow label="Differentiator" value={asset.differentiator} />
            <DetailRow label="Description" value={asset.description} />
            <div className="grid gap-1 border-b border-border py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Source URL
              </dt>
              <dd className="text-sm">
                {asset.sourceUrl ? (
                  <a
                    href={asset.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    {asset.sourceUrl}
                  </a>
                ) : (
                  <span className="text-foreground">None</span>
                )}
              </dd>
            </div>
            <DetailRow label="Last checked" value={asset.lastChecked} />
          </dl>
        </div>
      </aside>
    </div>
  );
}
