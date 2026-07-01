import { Prisma } from "@prisma/client";
import { quizQuestions } from "./quiz";
import { calculateDiagnosis, mergeNarrative } from "./scoring";
import type { DiagnosisNarrative, DiagnosisResult, QuizAnswerValue, QuizAnswers, QuizOptionValue, QuestionId } from "./types";

type StoredDiagnosis = {
  id: string;
  answers: Prisma.JsonValue;
  dimensionScores: Prisma.JsonValue;
  operatorCode: string;
  operatorTypeName: string;
  aiAdoptionStage: string;
  userType: string;
  cognitiveWidth: string;
  blindSpots: Prisma.JsonValue;
  justNeed: string;
  crowdType: string;
  enhancedNarrative: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
  chatSession?: {
    id: string;
    conversationId: string | null;
    status: string;
  } | null;
};

export type DiagnosisRecordDto = {
  id: string;
  result: DiagnosisResult;
  createdAt: string;
  updatedAt: string;
  chatSession: {
    id: string;
    conversationId: string | null;
    status: string;
  } | null;
};

export function toDiagnosisJson(result: DiagnosisResult) {
  return {
    answers: result.answers as Prisma.InputJsonValue,
    dimensionScores: result.dimensionScores as unknown as Prisma.InputJsonValue,
    operatorCode: result.operatorCode,
    operatorTypeName: result.operatorTypeName,
    aiAdoptionStage: result.aiAdoptionStage,
    userType: result.userType,
    cognitiveWidth: result.cognitiveWidth,
    blindSpots: result.blindSpots as Prisma.InputJsonValue,
    justNeed: result.justNeed,
    crowdType: result.crowdType,
    enhancedNarrative: result.narrative
      ? result.narrative as unknown as Prisma.InputJsonValue
      : Prisma.DbNull,
  };
}

export function fromDiagnosisRecord(record: StoredDiagnosis): DiagnosisRecordDto {
  const base = calculateDiagnosis(repairStoredAnswers(record.answers as QuizAnswers));
  const result = mergeNarrative(base, record.enhancedNarrative as DiagnosisNarrative | null);

  return {
    id: record.id,
    result: {
      ...result,
      operatorCode: record.operatorCode,
      operatorTypeName: record.operatorTypeName,
      aiAdoptionStage: record.aiAdoptionStage,
      userType: record.userType as DiagnosisResult["userType"],
      cognitiveWidth: record.cognitiveWidth,
      blindSpots: Array.isArray(record.blindSpots) ? (record.blindSpots as string[]) : result.blindSpots,
      justNeed: record.justNeed,
      crowdType: record.crowdType,
    },
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    chatSession: record.chatSession
      ? {
          id: record.chatSession.id,
          conversationId: record.chatSession.conversationId,
          status: record.chatSession.status,
        }
      : null,
  };
}

const STORED_ANSWER_DEFAULTS = {
  q1: "B",
  q2: "B",
  q3: "B",
  q4: "B",
  q5: "B",
  q6: "B",
  q7: "B",
  q8: "B",
  q9: "B",
  q10: "B",
  q11: "B",
  q12: "B",
  q13: "B",
  q14: ["A"],
  q15: "B",
  q16: "A",
  q17: "B",
  q18: "B",
  q19: ["A", "C"],
  q20: "A",
  q21: "A",
  q22: "B",
  q23: "A",
  q24: "D",
} satisfies Required<QuizAnswers>;

const questionById = new Map(quizQuestions.map((question) => [question.id, question]));

function repairStoredAnswers(answers: QuizAnswers): QuizAnswers {
  const repaired: QuizAnswers = isRecord(answers) ? { ...answers } : {};

  for (const question of quizQuestions) {
    repaired[question.id] = repairStoredAnswer(question.id, repaired[question.id]);
  }

  return repaired;
}

function repairStoredAnswer(questionId: QuestionId, answer: QuizAnswerValue | undefined): QuizAnswerValue {
  const question = questionById.get(questionId);
  const defaultAnswer = STORED_ANSWER_DEFAULTS[questionId];
  if (!question) return defaultAnswer;

  if (question.type === "multiple") {
    const values = Array.isArray(answer)
      ? answer.filter((value): value is QuizOptionValue => hasQuestionOption(questionId, value))
      : [];
    if (values.length === 0) return defaultAnswer;
    // q14 的“还没有任何 AI 工具进入日常工作”和其他工具互斥，旧记录也要收敛成同一语义。
    if (questionId === "q14" && values.includes("E")) return ["E"];
    return [...new Set(values)];
  }

  if (typeof answer === "string" && hasQuestionOption(questionId, answer)) {
    return answer;
  }
  return defaultAnswer;
}

function hasQuestionOption(questionId: QuestionId, value: string): value is QuizOptionValue {
  return Boolean(questionById.get(questionId)?.options.some((option) => option.value === value));
}

function isRecord(value: unknown): value is QuizAnswers {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
