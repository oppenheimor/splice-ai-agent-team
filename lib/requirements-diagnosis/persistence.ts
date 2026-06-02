import type { Prisma } from "@prisma/client";
import { calculateDiagnosis, mergeNarrative } from "./scoring";
import type { DiagnosisNarrative, DiagnosisResult, QuizAnswerValue, QuizAnswers, QuizOptionValue } from "./types";

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
    enhancedNarrative: result.narrative as unknown as Prisma.InputJsonValue,
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

function repairStoredAnswers(answers: QuizAnswers): QuizAnswers {
  const repaired = { ...answers };

  // q13 是组织落地维度的补题；旧记录没有这道题时，用 q4 的同维度倾向补齐，避免历史报告因题库升级而无法打开。
  if (!repaired.q13 && isSingleAnswer(repaired.q4)) {
    repaired.q13 = repaired.q4;
  }

  return repaired;
}

function isSingleAnswer(value: QuizAnswerValue | undefined): value is QuizOptionValue {
  return Boolean(value) && !Array.isArray(value);
}
