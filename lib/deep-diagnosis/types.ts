export type DeepDiagnosisStage =
  | "entry"
  | "context_collection"
  | "bottleneck_diagnosis"
  | "external_research"
  | "opportunity_mapping"
  | "solution_design"
  | "report_ready"
  | "human_handoff";

export type DeepDiagnosisLandingMode =
  | "tool"
  | "workflow"
  | "agent"
  | "automation"
  | "knowledge_base"
  | "dashboard"
  | "custom_development";

export type DeepDiagnosisPriorityLevel = "high" | "medium" | "low" | "defer" | "avoid";

export type DeepDiagnosisScopeLevel =
  | "single_problem"
  | "single_workflow"
  | "role_scope"
  | "business_overview";

export type DeepDiagnosisEntryRoute =
  | "overview_scan"
  | "focused_deep_dive"
  | "assisted_clarification";

export type DeepDiagnosisReportLevel =
  | "hypothesis_brief"
  | "single_problem_report"
  | "workflow_report"
  | "role_scope_report"
  | "business_overview_report"
  | "overview_scan_plus_workflow_report"
  | "external_research_report";

export type DeepDiagnosisBottleneckType =
  | "unclear_goal"
  | "weak_input"
  | "weak_acquisition"
  | "slow_production"
  | "unstable_quality"
  | "poor_conversion"
  | "workflow_gap"
  | "data_gap"
  | "team_coordination"
  | "tool_mismatch"
  | "weak_retention"
  | "weak_execution";

export type DeepDiagnosisEvidence = {
  id?: string;
  observation: string;
  source: "user_input" | "diagnosis_result" | "external_research" | "business_inference" | "unverified_assumption";
  impact: string;
  sourceTitle?: string;
  sourceUrl?: string;
  rawExcerpt?: string;
  evidenceLevel?: "A" | "B" | "C" | "D";
};

export type DeepDiagnosisExternalResearchFinding = {
  id?: string;
  finding: string;
  evidenceLevel: "A" | "B" | "C" | "D";
  sourceTitle: string;
  sourceUrl?: string;
  rawExcerpt?: string;
  relevanceToUser: string;
};

export type DeepDiagnosisBenchmarkComparison = {
  externalPattern: string;
  userReality: string;
  gap: string;
  actionImplication: string;
};

export type DeepDiagnosisDeliverableAsset = {
  name: string;
  type: "template" | "checklist" | "sample_output" | "calendar" | "scorecard" | "workflow" | "field_schema";
  description: string;
  usableNow: boolean;
  qualityCriteria?: string[];
};

export type DeepDiagnosisPriorityScore = {
  expectedValue: number;
  implementationDifficulty: number;
  dataReadiness: number;
  riskLevel: number;
  timeToValue: number;
  ownerControl: number;
};

export type DeepDiagnosisOpportunity = {
  id: string;
  name: string;
  targetProcess: string;
  bottleneckType: DeepDiagnosisBottleneckType;
  evidence: DeepDiagnosisEvidence[];
  evidenceIds?: string[];
  fitReason: string;
  whyNow: string;
  landingMode: DeepDiagnosisLandingMode;
  expectedOutcome: string;
  priority: DeepDiagnosisPriorityLevel;
  priorityScore: DeepDiagnosisPriorityScore;
  requiredConditions: string[];
  risks: string[];
  validationMetric: string;
};

export type DeepDiagnosisCandidateScenario = {
  name: string;
  scope: string;
  score: DeepDiagnosisPriorityScore;
  totalScore: number;
  recommendation: DeepDiagnosisPriorityLevel;
  reason: string;
};

export type DeepDiagnosisRoadmapItem = {
  period: "7_days" | "30_days" | "90_days";
  goal: string;
  actions: string[];
  owner: string;
  successSignal: string;
};

export type DeepDiagnosisHumanHandoff = {
  recommended: boolean;
  reason: string;
  triggerSignals: string[];
  preparationChecklist: string[];
};

export type DeepDiagnosisReport = {
  title: string;
  scopeLevel: DeepDiagnosisScopeLevel;
  reportLevel: DeepDiagnosisReportLevel;
  scopeDeclaration: string;
  uncoveredAreas: string[];
  role: string;
  decisionPosition: string;
  problemDefinition: string;
  confirmedFacts: string[];
  unconfirmedFacts: string[];
  personaInfluenceDisclosure: string;
  primaryBottleneck: {
    type: DeepDiagnosisBottleneckType;
    description: string;
    evidence: DeepDiagnosisEvidence[];
  };
  externalResearch: {
    topic: string;
    coverageStatement: string;
    findings: DeepDiagnosisExternalResearchFinding[];
    benchmarkComparisons: DeepDiagnosisBenchmarkComparison[];
    counterEvidence: string[];
    unverifiedGaps: string[];
  };
  assumptions: string[];
  missingInformation: string[];
  currentBaseline: string;
  prioritySummary: string;
  candidateScenarios: DeepDiagnosisCandidateScenario[];
  opportunities: DeepDiagnosisOpportunity[];
  rejectedOptions: {
    name: string;
    reason: string;
    reconsiderWhen: string;
  }[];
  deliverableAssets: DeepDiagnosisDeliverableAsset[];
  roadmap: DeepDiagnosisRoadmapItem[];
  requiredConditions: {
    data: string[];
    people: string[];
    permissions: string[];
    budget: string[];
    process: string[];
  };
  validationPlan: {
    baseline: string;
    metrics: string[];
    successThreshold: string;
    failureThreshold: string;
    observationPeriod: string;
  };
  governance: {
    automatableScope: string[];
    aiAssistedHumanReviewScope: string[];
    humanReviewScope: string[];
    forbiddenScope: string[];
  };
  qualityGate: {
    completenessScore: number;
    evidenceScore: number;
    actionabilityScore: number;
    passed: boolean;
    missingItems: string[];
  };
  exitCriteria: string[];
  failureBranches: {
    signal: string;
    nextAction: "stop" | "pivot" | "collect_more_data" | "human_handoff";
    reason: string;
  }[];
  nextTasks: {
    title: string;
    owner: string;
    due: string;
    acceptanceCriteria: string;
  }[];
  humanHandoff: DeepDiagnosisHumanHandoff;
};
