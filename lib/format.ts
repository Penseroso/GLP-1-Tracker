import type { DevelopmentProfile } from "./programs/types";

export function formatNullableValue(value?: string | null) {
  return value?.trim() ? value : "N/A";
}

export function formatInlineValues(values: string[]) {
  return values.length > 0 ? values.join(" / ") : "N/A";
}

export function formatDevelopment(development: DevelopmentProfile) {
  return `${development.stage} \u00b7 ${development.status}`;
}
