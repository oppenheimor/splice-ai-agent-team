import type { HandleMessageStreamEvent } from "eve/client";
import type { WishCreatorSnapshot } from "../../types/wish-creator";
import { isWishCreatorHtmlArtifactMessage } from "./html-artifact-stream.ts";

export function compactWishCreatorSnapshot(snapshot: WishCreatorSnapshot): WishCreatorSnapshot {
  const latestArtifactDeltaIndexes = findLatestArtifactDeltaIndexes(snapshot.events);
  if (latestArtifactDeltaIndexes.size === 0) return snapshot;

  return {
    ...snapshot,
    events: snapshot.events.filter((event, eventIndex) => {
      const key = getArtifactDeltaKey(event);
      return !key || latestArtifactDeltaIndexes.get(key) === eventIndex;
    }),
  };
}

function findLatestArtifactDeltaIndexes(
  events: readonly HandleMessageStreamEvent[],
): ReadonlyMap<string, number> {
  const indexes = new Map<string, number>();
  events.forEach((event, eventIndex) => {
    const key = getArtifactDeltaKey(event);
    if (key) indexes.set(key, eventIndex);
  });
  return indexes;
}

function getArtifactDeltaKey(event: HandleMessageStreamEvent): string | undefined {
  if (
    event.type !== "message.appended"
    || !isWishCreatorHtmlArtifactMessage(event.data.messageSoFar)
  ) return undefined;

  return `${event.data.turnId}:${event.data.stepIndex}`;
}
