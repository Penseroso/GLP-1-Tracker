import { loadCandidateFiles } from "@/lib/candidates";
import { QaReviewClient } from "./QaReviewClient";

export default async function QaPage() {
  const candidates = await loadCandidateFiles();

  return <QaReviewClient candidates={candidates} />;
}
