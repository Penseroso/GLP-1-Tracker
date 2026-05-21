import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { CandidateFileRecord, RefreshCandidateFile } from "@/lib/qa-types";

const candidatesDir = path.join(process.cwd(), "data", "candidates");

export async function loadCandidateFiles(): Promise<CandidateFileRecord[]> {
  const entries = await readdir(candidatesDir, { withFileTypes: true });
  const jsonFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const candidates = await Promise.all(
    jsonFiles.map(async (fileName) => {
      const filePath = path.join(candidatesDir, fileName);
      const candidate = JSON.parse(
        await readFile(filePath, "utf8"),
      ) as RefreshCandidateFile;

      return {
        fileName,
        candidate,
      };
    }),
  );

  return candidates;
}
