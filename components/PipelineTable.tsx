"use client";

import { useMemo, useState } from "react";
import { emptyAssetFilters, filterAssets, getFilterOptions, optionalText } from "@/lib/filters";
import type { AssetFilters, PipelineAsset } from "@/lib/types";
import { AssetDetailDrawer } from "./AssetDetailDrawer";
import { FilterBar } from "./FilterBar";

type PipelineTableProps = {
  assets: PipelineAsset[];
};

export function PipelineTable({ assets }: PipelineTableProps) {
  const [filters, setFilters] = useState<AssetFilters>(emptyAssetFilters);
  const [selectedAsset, setSelectedAsset] = useState<PipelineAsset | null>(null);

  const options = useMemo(() => getFilterOptions(assets), [assets]);
  const filteredAssets = useMemo(
    () => filterAssets(assets, filters),
    [assets, filters],
  );

  return (
    <div className="space-y-4">
      <FilterBar filters={filters} options={options} onChange={setFilters} />
      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
        <div className="flex flex-col gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-card-foreground">
              Asset Register
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {filteredAssets.length} of {assets.length} dataset assets shown
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFilters(emptyAssetFilters)}
            className="self-start rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground sm:self-auto"
          >
            Reset filters
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-muted/70 text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                {[
                  "Company",
                  "Asset",
                  "Target Class",
                  "Indication",
                  "Route",
                  "Dosing Interval",
                  "Stage",
                  "Differentiator",
                  "Source",
                ].map((header) => (
                  <th key={header} className="px-4 py-3 font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAssets.map((asset) => (
                <tr
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className="cursor-pointer bg-card transition hover:bg-accent/45"
                >
                  <td className="px-4 py-4 font-medium text-foreground">
                    {asset.company}
                  </td>
                  <td className="px-4 py-4 font-semibold text-foreground">
                    {asset.assetName}
                  </td>
                  <td className="px-4 py-4 text-foreground">{asset.targetClass}</td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {asset.indication.join(", ")}
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {optionalText(asset.route)}
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {optionalText(asset.dosingInterval)}
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-md bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                      {asset.stage}
                    </span>
                  </td>
                  <td className="max-w-[17rem] px-4 py-4 text-muted-foreground">
                    {optionalText(asset.differentiator)}
                  </td>
                  <td className="px-4 py-4">
                    {asset.sourceUrl ? (
                      <a
                        href={asset.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        className="font-medium text-primary hover:underline"
                      >
                        Source
                      </a>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredAssets.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    No assets to display.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
      <AssetDetailDrawer
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
      />
    </div>
  );
}
