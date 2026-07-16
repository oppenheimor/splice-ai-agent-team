import {
  WISH_CREATOR_BLOCKED_ARTIFACTS_PREFIX,
  WISH_CREATOR_REQUIREMENT_GATE_PREFIX,
} from "@/constants/wish-creator";
import type { WishCreatorRequirementGateStatus } from "@/types/wish-creator";

export function getRequirementGateStatus(
  conversationId: string,
): WishCreatorRequirementGateStatus | undefined {
  if (typeof window === "undefined") return undefined;
  const value = window.sessionStorage.getItem(`${WISH_CREATOR_REQUIREMENT_GATE_PREFIX}${conversationId}`);
  return value === "awaiting-choice" || value === "grilling" || value === "released"
    ? value
    : undefined;
}

export function setRequirementGateStatus(
  conversationId: string,
  status: WishCreatorRequirementGateStatus,
) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(`${WISH_CREATOR_REQUIREMENT_GATE_PREFIX}${conversationId}`, status);
}

export function getBlockedArtifactRevisions(conversationId: string): readonly string[] {
  if (typeof window === "undefined") return [];
  const value = window.sessionStorage.getItem(`${WISH_CREATOR_BLOCKED_ARTIFACTS_PREFIX}${conversationId}`);
  if (!value) return [];

  try {
    const revisions: unknown = JSON.parse(value);
    return Array.isArray(revisions)
      ? revisions.filter((revision): revision is string => typeof revision === "string")
      : [];
  } catch {
    return [];
  }
}

export function setBlockedArtifactRevisions(
  conversationId: string,
  revisions: readonly string[],
) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(
    `${WISH_CREATOR_BLOCKED_ARTIFACTS_PREFIX}${conversationId}`,
    JSON.stringify([...new Set(revisions)]),
  );
}
