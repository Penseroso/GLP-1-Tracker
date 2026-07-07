import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const dataDir = path.join(root, "data");
const companySourceDir = path.join(dataDir, "companies");
const generatedDir = path.join(dataDir, "generated");
const stressTestDir = path.join(dataDir, "stress-tests");
const registryDir = path.join(dataDir, "registries");

const fullDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const partialDatePattern = /^\d{4}(-\d{2}(-\d{2})?)?$/;
const developmentStatuses = new Set([
  "Planned",
  "Active",
  "On hold",
  "Discontinued",
  "Unknown",
]);

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function normalize(value) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidFullDate(value) {
  if (!fullDatePattern.test(value)) {
    return false;
  }

  const [yearText, monthText, dayText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isValidPartialDate(value) {
  if (!partialDatePattern.test(value)) {
    return false;
  }

  const parts = value.split("-");
  const year = Number(parts[0]);

  if (year < 1000 || year > 9999) {
    return false;
  }

  if (parts.length >= 2) {
    const month = Number(parts[1]);
    if (month < 1 || month > 12) {
      return false;
    }
  }

  if (parts.length === 3) {
    return isValidFullDate(value);
  }

  return true;
}

function validateUniqueRegistryText(entries, label) {
  const seen = new Map();

  for (const entry of entries) {
    for (const value of [entry.label, ...(entry.aliases ?? [])]) {
      const key = normalize(value);
      const existing = seen.get(key);
      assert(
        !existing,
        `${label} registry text "${value}" is duplicated by ${existing} and ${entry.id}`,
      );
      seen.set(key, entry.id);
    }
  }
}

function loadRegistries() {
  const stages = readJson(path.join(registryDir, "development-stages.json"));
  const regulatoryStates = readJson(path.join(registryDir, "regulatory-states.json"));

  validateRegistryEntries(stages, "development-stages", true);
  validateRegistryEntries(regulatoryStates, "regulatory-states", false);

  return {
    stageLabels: new Set(stages.map((stage) => stage.label)),
    regulatoryStateLabels: new Set(regulatoryStates.map((state) => state.label)),
  };
}

function validateRegistryEntries(entries, label, requireFamily) {
  assert(Array.isArray(entries), `${label} registry must be an array`);

  const ids = new Set();
  const ranks = new Set();

  for (const entry of entries) {
    assert(isObject(entry), `${label} entries must be objects`);
    assert(isNonEmptyString(entry.id), `${label} entry id is required`);
    assert(isNonEmptyString(entry.label), `${label} entry label is required`);
    assert(Array.isArray(entry.aliases), `${label} entry ${entry.id} aliases must be an array`);
    assert(!ids.has(entry.id), `${label} entry id ${entry.id} is duplicated`);
    ids.add(entry.id);

    for (const alias of entry.aliases) {
      assert(isNonEmptyString(alias), `${label} entry ${entry.id} has an empty alias`);
    }

    if (requireFamily) {
      assert(isNonEmptyString(entry.family), `${label} entry ${entry.id} family is required`);
      assert(Number.isFinite(entry.sortRank), `${label} entry ${entry.id} sortRank is required`);
      assert(!ranks.has(entry.sortRank), `${label} sortRank ${entry.sortRank} is duplicated`);
      ranks.add(entry.sortRank);
    }
  }

  validateUniqueRegistryText(entries, label);
}

function validateCompany(company, context) {
  assert(isObject(company), `${context}: company must be an object`);
  assert(isNonEmptyString(company.id), `${context}: company.id is required`);
  assert(isNonEmptyString(company.name), `${context}: company.name is required`);
  assert(
    isNonEmptyString(company.headquartersCountry),
    `${context}: company.headquartersCountry is required`,
  );
}

function validateSource(source, context) {
  assert(isObject(source), `${context}: source must be an object`);
  assert(isNonEmptyString(source.url), `${context}: source.url is required`);
  assert(isValidFullDate(source.checkedAt), `${context}: source.checkedAt must be YYYY-MM-DD`);

  if (source.publishedAt !== undefined) {
    assert(
      isNonEmptyString(source.publishedAt) && isValidPartialDate(source.publishedAt),
      `${context}: source.publishedAt must be YYYY, YYYY-MM, or YYYY-MM-DD`,
    );
  }
}

function validateProgram(program, context, registries) {
  assert(isObject(program), `${context}: program must be an object`);
  assert(isNonEmptyString(program.id), `${context}: program.id is required`);
  assert(isNonEmptyString(program.assetId), `${context}: program.assetId is required`);
  assert(isNonEmptyString(program.companyId), `${context}: program.companyId is required`);
  assert(isNonEmptyString(program.assetName), `${context}: program.assetName is required`);
  assert(program.codeName === null || isNonEmptyString(program.codeName), `${context}: invalid codeName`);

  assert(isObject(program.technical), `${context}: technical is required`);
  assert(
    program.technical.mechanism === null || isNonEmptyString(program.technical.mechanism),
    `${context}: invalid mechanism`,
  );
  assert(
    program.technical.platform === null || isNonEmptyString(program.technical.platform),
    `${context}: invalid platform`,
  );

  assert(isObject(program.administration), `${context}: administration is required`);
  assert(isNonEmptyString(program.administration.route), `${context}: route is required`);
  assert(isNonEmptyString(program.administration.dosageForm), `${context}: dosageForm is required`);
  assert(
    program.administration.dosingInterval === null ||
      isNonEmptyString(program.administration.dosingInterval),
    `${context}: invalid dosingInterval`,
  );

  assert(Array.isArray(program.indications), `${context}: indications must be an array`);
  assert(program.indications.length > 0, `${context}: at least one indication is required`);
  for (const indication of program.indications) {
    assert(isNonEmptyString(indication), `${context}: empty indication`);
  }

  assert(isObject(program.development), `${context}: development is required`);
  assert(
    registries.stageLabels.has(program.development.stage),
    `${context}: development.stage "${program.development.stage}" is not in the registry`,
  );
  assert(
    developmentStatuses.has(program.development.status),
    `${context}: development.status "${program.development.status}" is not allowed`,
  );

  if (program.regulatoryStates !== undefined) {
    assert(Array.isArray(program.regulatoryStates), `${context}: regulatoryStates must be an array`);
    for (const [index, regulatoryState] of program.regulatoryStates.entries()) {
      const stateContext = `${context}: regulatoryStates[${index}]`;
      assert(isObject(regulatoryState), `${stateContext} must be an object`);
      assert(
        registries.regulatoryStateLabels.has(regulatoryState.state),
        `${stateContext}.state "${regulatoryState.state}" is not in the registry`,
      );
      assert(isNonEmptyString(regulatoryState.jurisdiction), `${stateContext}.jurisdiction is required`);
      assert(isNonEmptyString(regulatoryState.authority), `${stateContext}.authority is required`);

      if (regulatoryState.date !== undefined) {
        assert(
          isNonEmptyString(regulatoryState.date) && isValidPartialDate(regulatoryState.date),
          `${stateContext}.date must be YYYY, YYYY-MM, or YYYY-MM-DD`,
        );
      }
    }
  }

  assert(isObject(program.metadata), `${context}: metadata is required`);
  assert(
    isValidFullDate(program.metadata.lastVerifiedAt),
    `${context}: metadata.lastVerifiedAt must be YYYY-MM-DD`,
  );
  assert(isValidFullDate(program.metadata.updatedAt), `${context}: metadata.updatedAt must be YYYY-MM-DD`);
  assert(Array.isArray(program.metadata.sources), `${context}: metadata.sources must be an array`);
  for (const [index, source] of program.metadata.sources.entries()) {
    validateSource(source, `${context}: metadata.sources[${index}]`);
  }
}

function validateDataset(companies, programs, context, registries) {
  assert(Array.isArray(companies), `${context}: companies must be an array`);
  assert(Array.isArray(programs), `${context}: programs must be an array`);

  const companyIds = new Set();
  const programIds = new Set();
  const assetIdentityById = new Map();

  for (const company of companies) {
    validateCompany(company, context);
    assert(!companyIds.has(company.id), `${context}: duplicate company id ${company.id}`);
    companyIds.add(company.id);
  }

  for (const program of programs) {
    validateProgram(program, `${context}: ${program.id ?? "unknown-program"}`, registries);
    assert(!programIds.has(program.id), `${context}: duplicate program id ${program.id}`);
    assert(companyIds.has(program.companyId), `${context}: missing companyId reference ${program.companyId}`);
    programIds.add(program.id);

    const identity = JSON.stringify({
      assetName: program.assetName,
      codeName: program.codeName,
    });
    const priorIdentity = assetIdentityById.get(program.assetId);
    assert(
      priorIdentity === undefined || priorIdentity === identity,
      `${context}: assetId ${program.assetId} is reused with conflicting asset identity`,
    );
    assetIdentityById.set(program.assetId, identity);
  }
}

function getCompanySourceFolders(baseDir) {
  if (!existsSync(baseDir)) {
    return [];
  }

  return readdirSync(baseDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function readCompanyFolder(baseDir, folderName) {
  const folderPath = path.join(baseDir, folderName);
  return {
    company: readJson(path.join(folderPath, "company.json")),
    programs: readJson(path.join(folderPath, "pipeline-programs.json")),
  };
}

function validateCompanySources() {
  const registries = loadRegistries();
  const folders = getCompanySourceFolders(companySourceDir);

  for (const folder of folders) {
    const { company, programs } = readCompanyFolder(companySourceDir, folder);
    validateDataset([company], programs, `data/companies/${folder}`, registries);
  }

  console.log(`Validated ${folders.length} company source folder(s).`);
}

function validateStressTests() {
  const registries = loadRegistries();
  const folders = getCompanySourceFolders(stressTestDir);

  for (const folder of folders) {
    const folderPath = path.join(stressTestDir, folder);
    const { company, programs } = readCompanyFolder(stressTestDir, folder);
    validateDataset([company], programs, `data/stress-tests/${folder}`, registries);
    assert(existsSync(path.join(folderPath, "deferred-items.json")), `${folder}: deferred-items.json is required`);
    assert(existsSync(path.join(folderPath, "findings.md")), `${folder}: findings.md is required`);
    assert(existsSync(path.join(folderPath, "contract-gaps.md")), `${folder}: contract-gaps.md is required`);
  }

  console.log(`Validated ${folders.length} stress-test fixture(s).`);
}

function generateAggregates() {
  const registries = loadRegistries();
  const folders = getCompanySourceFolders(companySourceDir);
  const companies = [];
  const programs = [];

  for (const folder of folders) {
    const { company, programs: companyPrograms } = readCompanyFolder(companySourceDir, folder);
    validateDataset([company], companyPrograms, `data/companies/${folder}`, registries);
    companies.push(company);
    programs.push(...companyPrograms);
  }

  validateDataset(companies, programs, "generated aggregate", registries);
  companies.sort((a, b) => a.id.localeCompare(b.id));
  programs.sort((a, b) => a.companyId.localeCompare(b.companyId) || a.id.localeCompare(b.id));

  mkdirSync(generatedDir, { recursive: true });
  writeJson(path.join(generatedDir, "companies.json"), companies);
  writeJson(path.join(generatedDir, "pipeline-programs.json"), programs);
  console.log(`Generated ${companies.length} company record(s) and ${programs.length} program record(s).`);
}

function validateGenerated() {
  const registries = loadRegistries();
  const companies = readJson(path.join(generatedDir, "companies.json"));
  const programs = readJson(path.join(generatedDir, "pipeline-programs.json"));

  validateDataset(companies, programs, "data/generated", registries);
  console.log(`Validated generated aggregate with ${companies.length} company record(s).`);
}

const command = process.argv[2];

try {
  switch (command) {
    case "validate:registries":
      loadRegistries();
      console.log("Validated registries.");
      break;
    case "validate:companies":
      validateCompanySources();
      break;
    case "validate:stress":
      validateStressTests();
      break;
    case "generate":
      generateAggregates();
      break;
    case "validate:generated":
      validateGenerated();
      break;
    default:
      throw new Error(`Unknown command: ${command ?? "(none)"}`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
