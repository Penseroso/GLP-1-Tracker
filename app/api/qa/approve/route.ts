import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import type { ApproveRequest, ApproveResponse, CandidateAsset, RefreshCandidateFile } from "@/lib/qa-types";
import type { PipelineAsset } from "@/lib/types";

export const runtime = "nodejs";

const approvedPath = path.join(
  /*turbopackIgnore: true*/ process.cwd(),
  "data",
  "approved",
  "pipeline-assets.json",
);

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function isApproveRequest(value: unknown): value is ApproveRequest {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ApproveRequest>;
  return typeof candidate.candidateFile === "string" && Array.isArray(candidate.assetIds);
}

function resolveCandidatePath(candidateFile: string) {
  if (!candidateFile || path.basename(candidateFile) !== candidateFile) {
    throw new Error("candidateFile must be a basename under data/candidates.");
  }

  if (!candidateFile.endsWith(".json")) {
    throw new Error("candidateFile must end with .json.");
  }

  return path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "candidates", candidateFile);
}

function asStringArray(value: string[] | string | undefined) {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function asOptionalString(value: string[] | string | undefined) {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean).join(", ");
  }

  return value?.trim() || undefined;
}

function assertApprovableAsset(asset: CandidateAsset) {
  if (!asset.id) {
    throw new Error("Selected asset is missing id.");
  }

  if (!asset.company) {
    throw new Error(`Selected asset "${asset.id}" is missing company.`);
  }

  if (!asset.assetName) {
    throw new Error(`Selected asset "${asset.id}" is missing assetName.`);
  }

  if (!asset.targetClass) {
    throw new Error(`Selected asset "${asset.id}" is missing targetClass.`);
  }

  if (asStringArray(asset.indication).length === 0) {
    throw new Error(`Selected asset "${asset.id}" is missing indication.`);
  }

  if (!asset.stage) {
    throw new Error(`Selected asset "${asset.id}" is missing stage.`);
  }

  if (asset.qaStatus === "Rejected") {
    throw new Error(`Selected asset "${asset.id}" has qaStatus Rejected.`);
  }
}

function collectWarnings(asset: CandidateAsset) {
  const warnings: string[] = [];
  const label = asset.id ?? asset.assetName ?? "selected asset";

  if (asset.confidence === "Low") {
    warnings.push(`${label}: confidence is Low.`);
  }

  if (!asset.sourceUrl) {
    warnings.push(`${label}: sourceUrl is missing.`);
  }

  if (asset.notes?.toLowerCase().includes("source pending")) {
    warnings.push(`${label}: notes indicate source pending.`);
  }

  return warnings;
}

function withoutUndefined<T extends Record<string, unknown>>(record: T) {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined && value !== ""),
  ) as Partial<T>;
}

function normalizeForApproved(asset: CandidateAsset): PipelineAsset {
  const normalized = withoutUndefined({
    id: asset.id,
    company: asset.company,
    assetName: asset.assetName,
    codeName: asset.codeName,
    targetClass: asset.targetClass,
    mechanism: asset.mechanism,
    indication: asStringArray(asset.indication),
    route: asOptionalString(asset.route),
    dosageForm: asset.dosageForm,
    dosingInterval: asset.dosingInterval,
    stage: asset.stage,
    stageRaw: asset.stageRaw,
    differentiator: asset.differentiator,
    description: asset.description,
    sourceUrl: asset.sourceUrl,
    lastChecked: asset.lastChecked,
  });

  return normalized as PipelineAsset;
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse("Request body must be valid JSON.");
  }

  if (!isApproveRequest(body)) {
    return errorResponse("Request body must include candidateFile and assetIds.");
  }

  if (!body.candidateFile) {
    return errorResponse("candidateFile is required.");
  }

  if (body.assetIds.length === 0) {
    return errorResponse("assetIds must include at least one id.");
  }

  let candidatePath: string;

  try {
    candidatePath = resolveCandidatePath(body.candidateFile);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Invalid candidateFile.");
  }

  const requestedIds = new Set(body.assetIds);
  const candidate = JSON.parse(
    await readFile(candidatePath, "utf8"),
  ) as RefreshCandidateFile;
  const approvedAssets = JSON.parse(
    await readFile(approvedPath, "utf8"),
  ) as PipelineAsset[];
  const candidateAssets = candidate.assets ?? [];
  const selectedAssets = candidateAssets.filter((asset) => asset.id && requestedIds.has(asset.id));
  const skippedCount = body.assetIds.length - selectedAssets.length;

  if (selectedAssets.length === 0) {
    return errorResponse("No selected asset ids were found in the candidate file.");
  }

  for (const asset of selectedAssets) {
    try {
      assertApprovableAsset(asset);
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : "Selected asset is invalid.");
    }
  }

  const warnings = selectedAssets.flatMap(collectWarnings);
  const approvedById = new Map(approvedAssets.map((asset) => [asset.id, asset]));
  let insertedCount = 0;
  let updatedCount = 0;

  for (const asset of selectedAssets) {
    const normalized = normalizeForApproved(asset);

    if (approvedById.has(normalized.id)) {
      updatedCount += 1;
    } else {
      insertedCount += 1;
    }

    approvedById.set(normalized.id, normalized);
  }

  const updatedAssets = Array.from(approvedById.values());
  await writeFile(approvedPath, `${JSON.stringify(updatedAssets, null, 2)}\n`, "utf8");

  const response: ApproveResponse = {
    approvedCount: selectedAssets.length,
    insertedCount,
    updatedCount,
    skippedCount,
    warnings,
  };

  return NextResponse.json(response);
}
