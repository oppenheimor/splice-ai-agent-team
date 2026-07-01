import type { UIMessage } from "ai";
import type { DeepDiagnosisReportLevel } from "../types";
import type { DeepDiagnosisReportReadinessSnapshot } from "../report-readiness";
import type { DeepDiagnosisRuntimeStateSnapshot } from "../runtime-state";

export type DeepDiagnosisNextAction =
  | "ask_scope_route"
  | "ask_open_context"
  | "ask_multi_problem_selection"
  | "run_horizontal_scan"
  | "ask_deep_dive_selection"
  | "confirm_key_facts"
  | "ask_missing_facts"
  | "offer_hypothesis_brief"
  | "offer_special_report"
  | "offer_complete_report"
  | "offer_current_deliverable_publish"
  | "publish_current_deliverable"
  | "generate_report";

export type DeepDiagnosisInputMode =
  | "text"
  | "single_choice"
  | "multiple_choice"
  | "fact_confirmation"
  | "none";

export type DeepDiagnosisDecisionState = {
  messages: UIMessage[];
  transcript: string;
  runtimeState: DeepDiagnosisRuntimeStateSnapshot;
  reportReadiness: DeepDiagnosisReportReadinessSnapshot;
  hasUserMessage: boolean;
  hasScopeRoute: boolean;
  selectedOverviewScan: boolean;
  selectedFocusedDeepDive: boolean;
  selectedAssistedClarification: boolean;
  missingOpenContextLabels: string[];
  hasHorizontalScan: boolean;
  hasHypothesisTree: boolean;
  hasEvidenceCoverage: boolean;
  hasQualityGate: boolean;
  hasCurrentDeliverableReady: boolean;
  hasDeepDiveDirection: boolean;
  hasGenerateReportIntent: boolean;
  hasToolFailure: boolean;
  customization: {
    softSignals: string[];
    hardSignals: string[];
    blockingSignals: string[];
  };
};

export type DeepDiagnosisDecision = {
  nextAction: DeepDiagnosisNextAction;
  inputMode: DeepDiagnosisInputMode;
  maxReportLevel: DeepDiagnosisReportLevel;
  allowedLabels: string[];
  forbiddenPhrases: string[];
  hardBlocks: string[];
  warnings: string[];
  requiredNextSteps: string[];
  missingFacts: string[];
  reason: string;
  canMentionCustomization: boolean;
  canRecommendCustomization: boolean;
};

export type DeepDiagnosisDecisionPatch = Partial<Omit<DeepDiagnosisDecision, "allowedLabels" | "forbiddenPhrases" | "hardBlocks" | "warnings" | "requiredNextSteps" | "missingFacts">> & {
  allowedLabels?: string[];
  forbiddenPhrases?: string[];
  hardBlocks?: string[];
  warnings?: string[];
  requiredNextSteps?: string[];
  missingFacts?: string[];
};

export type DeepDiagnosisDecisionRule = {
  id: string;
  priority: 1000 | 800 | 600 | 400;
  when: (state: DeepDiagnosisDecisionState) => boolean;
  decide: (state: DeepDiagnosisDecisionState) => DeepDiagnosisDecisionPatch;
};
