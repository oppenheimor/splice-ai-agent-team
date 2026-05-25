"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect } from "react";
import { createId } from "@/lib/agent-team/id";

type TrackInput = {
  type: "page_view" | "click";
  target?: string;
  payload?: Record<string, unknown>;
};

export function useTreasureAnalytics(conversationId?: string) {
  const pathname = usePathname();

  const track = useCallback(
    (input: TrackInput) => {
      const body = JSON.stringify({
        ...input,
        pagePath: window.location.pathname,
        visitorId: getVisitorId(),
        conversationId,
      });

      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon("/agent-team/api/analytics/treasure-hunt", blob);
        return;
      }

      void fetch("/agent-team/api/analytics/treasure-hunt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
    },
    [conversationId],
  );

  useEffect(() => {
    track({ type: "page_view" });
  }, [pathname, track]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const element = getTrackableElement(event.target);
      if (!element) return;

      track({
        type: "click",
        target: getElementTarget(element),
        payload: {
          tagName: element.tagName.toLowerCase(),
          href: element instanceof HTMLAnchorElement ? element.href : undefined,
          role: element.getAttribute("role") || undefined,
        },
      });
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, [pathname, track]);
}

function getVisitorId(): string {
  const key = "agent-team.visitor.v1";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const next = createId("visitor");
  window.localStorage.setItem(key, next);
  return next;
}

function getTrackableElement(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) {
    return null;
  }

  return target.closest("button,a,input,textarea,select,[data-analytics-label]");
}

function getElementTarget(element: HTMLElement): string {
  return (
    element.dataset.analyticsLabel ||
    element.getAttribute("aria-label") ||
    element.textContent?.trim().replace(/\s+/g, " ").slice(0, 120) ||
    element.tagName.toLowerCase()
  );
}
