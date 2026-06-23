import type { UIMessage } from "ai";
import {
  DEEP_DIAGNOSIS_CUSTOMIZATION_BLOCKING_SIGNALS,
  DEEP_DIAGNOSIS_CUSTOMIZATION_HARD_SIGNALS,
  DEEP_DIAGNOSIS_CUSTOMIZATION_SOFT_SIGNALS,
} from "../protocol-data";
import { buildDeepDiagnosisRuntimeState } from "../runtime-state";
import type { DeepDiagnosisDecisionState } from "./types";

export function buildDeepDiagnosisDecisionState(messages: UIMessage[]): DeepDiagnosisDecisionState {
  const runtimeState = buildDeepDiagnosisRuntimeState(messages);
  const { transcript, entryRoute, openContext, progress, reportReadiness } = runtimeState;

  return {
    messages,
    transcript,
    runtimeState,
    reportReadiness,
    hasUserMessage: messages.some((message) => message.role === "user"),
    hasScopeRoute: entryRoute.hasScopeRoute,
    selectedOverviewScan: entryRoute.selectedOverviewScan,
    selectedFocusedDeepDive: entryRoute.selectedFocusedDeepDive,
    selectedAssistedClarification: entryRoute.selectedAssistedClarification,
    missingOpenContextLabels: openContext.missingLabels,
    hasHorizontalScan: progress.hasHorizontalScan,
    hasHypothesisTree: progress.hasHypothesisTree,
    hasEvidenceCoverage: progress.hasEvidenceCoverage,
    hasQualityGate: progress.hasQualityGate,
    hasCurrentDeliverableReady: runtimeState.deliverableReadiness.canOfferPublish,
    hasDeepDiveDirection: progress.hasDeepDiveDirection,
    hasGenerateReportIntent: progress.hasGenerateReportIntent,
    hasToolFailure: progress.hasToolFailure,
    customization: {
      softSignals: matchSignals(transcript, DEEP_DIAGNOSIS_CUSTOMIZATION_SOFT_SIGNALS),
      hardSignals: matchSignals(transcript, DEEP_DIAGNOSIS_CUSTOMIZATION_HARD_SIGNALS),
      blockingSignals: matchSignals(transcript, DEEP_DIAGNOSIS_CUSTOMIZATION_BLOCKING_SIGNALS),
    },
  };
}

function matchSignals(transcript: string, signals: readonly string[]): string[] {
  return signals.filter((signal) => {
    const keywords = signal
      .split(/[，。、；：: /]+/)
      .map((item) => item.trim())
      .filter((item) => item.length >= 2)
      .slice(0, 4);
    return keywords.some((keyword) => transcript.includes(keyword));
  });
}
