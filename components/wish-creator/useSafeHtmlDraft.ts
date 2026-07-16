"use client";

import { useEffect, useRef, useState } from "react";
import { createSafeHtmlDraftSnapshot } from "@/lib/wish-creator/html-stream-preview";

const DRAFT_PREVIEW_INTERVAL_MS = 400;

type CommittedDraft = {
  readonly html: string;
  readonly revision: string;
};

export function useSafeHtmlDraft(
  source: string,
  revision: string,
  enabled: boolean,
): string | undefined {
  const [committedDraft, setCommittedDraft] = useState<CommittedDraft>();
  const latestCandidateRef = useRef<CommittedDraft | undefined>(undefined);
  const lastCommitAtRef = useRef(0);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!enabled) {
      latestCandidateRef.current = undefined;
      return;
    }

    const html = createSafeHtmlDraftSnapshot(source);
    if (!html) return;
    latestCandidateRef.current = { html, revision };

    const elapsed = Date.now() - lastCommitAtRef.current;
    if (elapsed >= DRAFT_PREVIEW_INTERVAL_MS) {
      lastCommitAtRef.current = Date.now();
      setCommittedDraft(latestCandidateRef.current);
      return;
    }

    if (timerRef.current !== undefined) return;
    timerRef.current = window.setTimeout(() => {
      timerRef.current = undefined;
      const candidate = latestCandidateRef.current;
      if (!candidate) return;
      lastCommitAtRef.current = Date.now();
      setCommittedDraft(candidate);
    }, DRAFT_PREVIEW_INTERVAL_MS - elapsed);
  }, [enabled, revision, source]);

  useEffect(() => () => {
    if (timerRef.current !== undefined) window.clearTimeout(timerRef.current);
  }, []);

  return committedDraft?.revision === revision ? committedDraft.html : undefined;
}
