export type QuizOptionValue = "A" | "B" | "C" | "D" | "E" | "F";

export type QuestionId =
  | "q1"
  | "q2"
  | "q3"
  | "q4"
  | "q13"
  | "q5"
  | "q6"
  | "q7"
  | "q8"
  | "q9"
  | "q10"
  | "q11"
  | "q12";

export type QuizAnswerValue = QuizOptionValue | QuizOptionValue[];

export type QuizAnswers = Partial<Record<QuestionId, QuizAnswerValue>>;

export type QuizQuestion = {
  id: QuestionId;
  section: string;
  dimension: string;
  prompt: string;
  type: "single" | "multiple";
  options: Array<{
    value: QuizOptionValue;
    label: string;
  }>;
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
  stars: 1 | 2 | 3;
};

export type OperatorType = {
  code: string;
  name: string;
  definition: string;
  primaryTrait: string;
  secondaryTrait: string | null;
};

export type DiagnosisNarrative = {
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
  answers: Required<QuizAnswers>;
  dimensionScores: Record<DimensionCode, DimensionScore>;
  featureCode: string;
  operatorCode: string;
  operatorTypeName: string;
  operatorTypeDefinition: string;
  operatorType: OperatorType;
  aiAdoptionStage: string;
  aiAdoptionStageLabel: string;
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
