/**
 * Types for the shared canonicalization module. The implementation is plain JavaScript
 * so that the node-run data validator and the TypeScript read model can import the same
 * file; this declaration gives the TypeScript side its types.
 */
export declare function normalizeClinicalText(value: string): string;
export declare function canonicalizeClinicalTermText(value: string): string;
export declare function canonicalizeClinicalEstimand(
  value: string | undefined,
): string;
export declare function canonicalizeClinicalAnalysisPopulation(
  value: string,
): string;
