/**
 * Field-specific canonicalization for Clinical Evidence analysis terms (ADR-0037).
 *
 * Single source of truth, deliberately plain JavaScript: the data validator
 * (`scripts/data-registry.mjs`, run directly by node) and the Application read model
 * (`domains/app/lib/clinical-evidence/selectors.ts`) both consume it, so a semantic key
 * in the validator and a comparison group in the UI always draw the same boundary. A
 * second implementation on either side would let the two drift apart silently.
 *
 * Used ONLY to compute keys and grouping. The source-reported text stays on the record
 * verbatim, and the vocabulary stays open: an unknown term is canonicalized structurally
 * and passes through unchanged.
 */

/**
 * Standard analysis-set abbreviations. Expansion is exact-match only, so an unfamiliar
 * analysis set is never rewritten into one of these.
 */
const clinicalAnalysisSetAliases = new Map([
  ["itt", "intention to treat"],
  ["intent to treat", "intention to treat"],
  ["mitt", "modified intention to treat"],
  ["modified itt", "modified intention to treat"],
  ["modified intent to treat", "modified intention to treat"],
  ["fas", "full analysis set"],
  ["eas", "efficacy analysis set"],
  ["pp", "per protocol"],
  ["safety set", "safety analysis set"],
]);

/**
 * Case and whitespace folding only. Kept punctuation-sensitive, mirroring the
 * validator's general-purpose `normalize`, because the punctuation folding below is
 * specific to analysis terms.
 */
export function normalizeClinicalText(value) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Folds casing, dash variants, and separator punctuation for one analysis term. */
export function canonicalizeClinicalTermText(value) {
  return normalizeClinicalText(value)
    .replace(/[‐-―]/g, "-")
    .replace(/[-_/]+/g, " ")
    .replace(/[.,;:'"()[\]]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * "Treatment-policy estimand" and "Treatment policy estimand" are one estimand. The
 * trailing "estimand" / "estimand population" wording is a suffix, not part of the
 * strategy name. Unknown strategies remain valid and are canonicalized structurally.
 */
export function canonicalizeClinicalEstimand(value) {
  if (value === undefined) {
    return "";
  }

  return canonicalizeClinicalTermText(value).replace(
    /\s*estimand(?: population)?$/,
    "",
  );
}

/**
 * The analysis set and any trailing parenthetical subgroup are canonicalized separately,
 * so "Full analysis set (overall)" and "Full analysis set (Part B)" stay distinct while
 * "FAS" and "Full analysis set" collapse.
 */
export function canonicalizeClinicalAnalysisPopulation(value) {
  const trimmed = value.trim();
  const subgroupMatch = /^(.*?)\s*\(([^()]*)\)$/.exec(trimmed);
  const setText = canonicalizeClinicalTermText(
    subgroupMatch ? subgroupMatch[1] : trimmed,
  );
  const subgroupText = subgroupMatch
    ? canonicalizeClinicalTermText(subgroupMatch[2])
    : "";
  const canonicalSet = clinicalAnalysisSetAliases.get(setText) ?? setText;

  return subgroupText ? `${canonicalSet}(${subgroupText})` : canonicalSet;
}
