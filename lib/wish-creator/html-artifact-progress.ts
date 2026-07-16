export type HtmlArtifactProgressStage =
  | "checking"
  | "completed"
  | "generating"
  | "incomplete"
  | "needs-correction"
  | "retrying"
  | "validation-error";

export function resolveHtmlArtifactProgressStage(input: {
  readonly artifactStreaming: boolean;
  readonly busy: boolean;
  readonly validationState?: string;
  readonly validationValid?: boolean;
}): HtmlArtifactProgressStage {
  if (input.artifactStreaming) return "generating";
  if (!input.validationState) return input.busy ? "checking" : "incomplete";
  if (input.validationState === "output-available") {
    if (input.validationValid === true) return "completed";
    if (input.validationValid === false) return "needs-correction";
    return "incomplete";
  }
  if (input.validationState === "output-error") {
    return input.busy ? "retrying" : "validation-error";
  }
  if (input.validationState === "output-denied") return "incomplete";
  return "checking";
}
