import type { Metadata } from "next";
import { EfficacyComparison } from "@/domains/app/components/EfficacyComparison";
import { getEfficacyComparison } from "@/domains/app/lib/efficacy-comparison/read-model";

export const metadata: Metadata = {
  title: "Efficacy Comparison",
  description:
    "Reported body-weight reduction by mechanism family, drawn from stored clinical results.",
};

export default function EfficacyComparisonPage() {
  const view = getEfficacyComparison();
  return <EfficacyComparison view={view} />;
}
