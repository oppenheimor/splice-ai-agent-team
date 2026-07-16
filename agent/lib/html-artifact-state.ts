import { defineState } from "eve/context";

export type HtmlArtifactRuntimeState = {
  readonly artifactPath?: string;
  readonly bytes?: number;
  readonly html?: string;
  readonly phase: "idle" | "streaming" | "persisted";
  readonly stepIndex?: number;
  readonly turnId?: string;
};

export const htmlArtifactRuntimeState = defineState<HtmlArtifactRuntimeState>(
  "wish-creator.html-artifact",
  () => ({ phase: "idle" }),
);
