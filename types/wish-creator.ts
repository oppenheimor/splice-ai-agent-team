import type { HandleMessageStreamEvent, SessionState } from "eve/client";
import type { EveMessage } from "eve/react";

export type WishCreatorSnapshot = {
  readonly events: readonly HandleMessageStreamEvent[];
  readonly messages: readonly EveMessage[];
  readonly session: SessionState;
};

export type WishCreatorRequirementPath = "direct" | "clarify";

export type WishCreatorRequirementGateStatus = "awaiting-choice" | "grilling" | "released";

export type WishCreatorRequirementGateRuntimeStatus = WishCreatorRequirementGateStatus | "hydrating";

export type WishCreatorInitialState = {
  readonly eveSessionId?: string;
  readonly events: readonly HandleMessageStreamEvent[];
  readonly latestPublishedUrl?: string;
  readonly session: SessionState;
  readonly title: string;
};

export type WishCreatorPublicationResult = {
  readonly artifactPath: string;
  readonly bytes: number;
  readonly primaryUrl: string;
  readonly publishPath: string;
  readonly status: string;
  readonly verification: "uploaded_verification_pending" | "verified";
};
