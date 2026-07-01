export type QuestionId =
  | "q1"
  | "q2"
  | "q3"
  | "q4"
  | "q5"
  | "q6"
  | "q7"
  | "q8"
  | "q9"
  | "q10"
  | "q11"
  | "q12"
  | "q13"
  | "q14"
  | "q15"
  | "q16"
  | "q17"
  | "q18"
  | "q19"
  | "q20"
  | "q21"
  | "q22"
  | "q23"
  | "q24";

export type QuizOptionValue = "A" | "B" | "C" | "D" | "E" | "F";
export type QuizAnswerValue = QuizOptionValue | QuizOptionValue[];
export type QuizAnswers = Partial<Record<QuestionId, QuizAnswerValue>>;

export type QuizQuestion = {
  id: QuestionId;
  section: "经营画像" | "AI 落地画像";
  dimension: string;
  prompt: string;
  type: "single" | "multiple";
  options: Array<{ value: QuizOptionValue; label: string }>;
};

export type DimensionCode = "V" | "D" | "E" | "A" | "B";

export type DimensionScore = {
  code: DimensionCode;
  label: string;
  leftLabel: string;
  rightLabel: string;
  leftLetter: string;
  rightLetter: string;
  left: number;
  right: number;
  dominantLetter: string;
  dominantLabel: string;
  diff: number;
  stars: number;
};

export type OperatorType = {
  code: string;
  name: string;
  definition: string;
  primaryTrait: string;
  secondaryTrait: string | null;
};

export type ReadinessAxis = "attitude" | "usage" | "workflow" | "tooling";

export type ReadinessAxisScore = {
  code: ReadinessAxis;
  label: string;
  score: number;
  level: "低" | "中" | "高";
  insight: string;
};

export type AiReadinessProfile = {
  total: number;
  level: "L1" | "L2" | "L3" | "L4" | "L5";
  label: string;
  summary: string;
  axes: Record<ReadinessAxis, ReadinessAxisScore>;
};

export type AiConcern = {
  code: string;
  label: string;
  description: string;
};

export type AiLandingPreference = {
  code: string;
  label: string;
  description: string;
};

export type AiBlocker = {
  code: string;
  label: string;
  description: string;
};

export type LandingPriority = {
  code: string;
  label: string;
  description: string;
  firstStep: string;
  toolRecommendations?: string[];
};

export type DiagnosisNarrative = {
  dimensionInsights?: Partial<Record<DimensionCode, string>>;
  readinessInsights?: Partial<Record<ReadinessAxis, string>>;
  actionInsights: string[];
  actionPlan: {
    week: string;
    month: string;
    ongoing: string;
  };
  closing: {
    technology: string;
    philosophy: string;
    quote: string;
  };
};

export type DiagnosisResult = {
  answers: QuizAnswers;
  dimensionScores: Record<DimensionCode, DimensionScore>;
  featureCode: string;
  operatorCode: string;
  operatorTypeName: string;
  operatorTypeDefinition: string;
  operatorType: OperatorType;
  aiAdoptionStage: string;
  aiAdoptionStageLabel: string;
  aiReadiness: AiReadinessProfile;
  aiConcern: AiConcern;
  aiLandingPreference: AiLandingPreference;
  aiBlocker: AiBlocker;
  landingPriority: LandingPriority;
  userType: "TE" | "EP" | "AP";
  userTypeLabel: string;
  cognitiveWidth: string;
  blindSpots: string[];
  justNeed: string;
  justNeedLabel: string;
  crowdType: string;
  recommendation: {
    title: string;
    description: string;
    hook: string;
  };
  narrative: DiagnosisNarrative;
};
