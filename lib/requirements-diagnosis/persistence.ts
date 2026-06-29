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

  // v2 新增题目（q14–q24）：旧记录缺失时一律补 C（中间选项），避免因新题库导致旧报告 MISSING_Qxx。
  // 同维度旧题可用时优先继承，确保经营画像维度均分不被 C 拉平。
  if (!repaired.q14 && isSingleAnswer(repaired.q1)) repaired.q14 = repaired.q1;
  else if (!repaired.q14) repaired.q14 = "C";

  if (!repaired.q15 && isSingleAnswer(repaired.q3)) repaired.q15 = repaired.q3;
  else if (!repaired.q15) repaired.q15 = "C";

  if (!repaired.q16) repaired.q16 = isSingleAnswer(repaired.q3) ? repaired.q3 : "C";

  if (!repaired.q17 && isSingleAnswer(repaired.q4)) repaired.q17 = repaired.q4;
  else if (!repaired.q17) repaired.q17 = "C";

  if (!repaired.q18 && isSingleAnswer(repaired.q5)) repaired.q18 = repaired.q5;
  else if (!repaired.q18) repaired.q18 = "C";

  if (!repaired.q19) repaired.q19 = isSingleAnswer(repaired.q5) ? repaired.q5 : "C";

  if (!repaired.q20 && isSingleAnswer(repaired.q6)) repaired.q20 = repaired.q6;
  else if (!repaired.q20) repaired.q20 = "C";

  // AI 落地画像新题：旧记录没有任何 AI 态度信息时补中间值
  if (!repaired.q21) repaired.q21 = "C";
  if (!repaired.q22) repaired.q22 = "B";
  if (!repaired.q23) repaired.q23 = "C";
  if (!repaired.q24) repaired.q24 = "A";

  return repaired;
}

function isSingleAnswer(value: QuizAnswerValue | undefined): value is QuizOptionValue {
  return Boolean(value) && !Array.isArray(value);
}
