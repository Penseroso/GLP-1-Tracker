import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const inputPath = path.join(rootDir, "data", "manual", "pipeline_assets.csv");
const outputPath = path.join(rootDir, "data", "generated", "pipeline-assets.json");

const expectedHeaders = [
  "id",
  "company",
  "assetName",
  "codeName",
  "targetClass",
  "mechanism",
  "indication",
  "route",
  "dosageForm",
  "dosingInterval",
  "stage",
  "stageRaw",
  "differentiator",
  "description",
  "sourceType",
  "sourceUrl",
  "lastChecked",
  "confidence",
  "status",
  "notes",
];

const requiredFields = ["id", "company", "assetName", "targetClass", "indication", "stage"];

const allowedStages = new Set([
  "Discovery",
  "Preclinical",
  "IND-enabling",
  "Phase 1",
  "Phase 2",
  "Phase 3",
  "Filed",
  "Approved",
  "Discontinued",
  "Unknown",
]);

function parseCsv(content) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const nextChar = content[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      field += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      row.push(field);
      field = "";
      if (row.some((value) => value.trim() !== "")) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((value) => value.trim() !== "")) {
      rows.push(row);
    }
  }

  return rows;
}

function assertHeaders(headers) {
  const actual = headers.join(",");
  const expected = expectedHeaders.join(",");

  if (actual !== expected) {
    throw new Error(`Invalid CSV header.\nExpected: ${expected}\nReceived: ${actual}`);
  }
}

function rowToRecord(headers, row, rowNumber) {
  if (row.length !== headers.length) {
    throw new Error(
      `Row ${rowNumber} has ${row.length} columns; expected ${headers.length}.`,
    );
  }

  const rawRecord = Object.fromEntries(
    headers.map((header, index) => [header, row[index]?.trim() ?? ""]),
  );

  for (const field of requiredFields) {
    if (!rawRecord[field]) {
      throw new Error(`Row ${rowNumber} is missing required field "${field}".`);
    }
  }

  if (!allowedStages.has(rawRecord.stage)) {
    throw new Error(`Row ${rowNumber} has unsupported normalized stage "${rawRecord.stage}".`);
  }

  const indication = rawRecord.indication
    .split(";")
    .map((value) => value.trim())
    .filter(Boolean);

  if (indication.length === 0) {
    throw new Error(`Row ${rowNumber} must include at least one indication.`);
  }

  const record = {
    id: rawRecord.id,
    company: rawRecord.company,
    assetName: rawRecord.assetName,
    targetClass: rawRecord.targetClass,
    indication,
    stage: rawRecord.stage,
  };

  for (const header of expectedHeaders) {
    if (header in record || header === "indication") {
      continue;
    }

    if (rawRecord[header]) {
      record[header] = rawRecord[header];
    }
  }

  return record;
}

async function main() {
  const content = await readFile(inputPath, "utf8");
  const rows = parseCsv(content);

  if (rows.length === 0) {
    throw new Error("CSV is empty.");
  }

  const [headers, ...dataRows] = rows.map((row) => row.map((field) => field.trim()));
  assertHeaders(headers);

  const assets = dataRows.map((row, index) => rowToRecord(headers, row, index + 2));
  const ids = new Set();

  for (const asset of assets) {
    if (ids.has(asset.id)) {
      throw new Error(`Duplicate asset id "${asset.id}".`);
    }
    ids.add(asset.id);
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(assets, null, 2)}\n`);

  console.log(`Generated ${path.relative(rootDir, outputPath)} with ${assets.length} assets.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
