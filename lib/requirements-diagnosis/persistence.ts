import type { Prisma } from "@prisma/client";
import { calculateDiagnosis, mergeNarrative } from "./scoring";
import type { DiagnosisNarrative, DiagnosisResult, QuizAnswers } from "./types";

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

  // v3 经营画像 q1-q10：全部是 4 选项单选，旧记录缺失或类型错误时补 B（偏左中间值）
  for (const id of ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"] as const) {
    if (!repaired[id] || Array.isArray(repaired[id])) repaired[id] = "B";
  }

  // AI 落地画像单选题：默认值保持中间或保守值，避免误判落地阶段
  if (!repaired.q11 || Array.isArray(repaired.q11)) repaired.q11 = "B"; // AI 态度：有兴趣
  if (!repaired.q12 || Array.isArray(repaired.q12)) repaired.q12 = "B"; // 关注偏好：商业落地
  if (!repaired.q13 || Array.isArray(repaired.q13)) repaired.q13 = "B"; // 使用时长：1-2h
  // q14 是多选工具题，旧记录缺失时默认 [A]（基础聊天工具）
  if (!repaired.q14 || !Array.isArray(repaired.q14)) repaired.q14 = ["A"];
  if (!repaired.q15 || Array.isArray(repaired.q15)) repaired.q15 = "B"; // 工作流：个人临时
  if (!repaired.q16 || Array.isArray(repaired.q16)) repaired.q16 = "A"; // AI 边界认知
  if (!repaired.q17 || Array.isArray(repaired.q17)) repaired.q17 = "B"; // AI 参照系
  if (!repaired.q18 || Array.isArray(repaired.q18)) repaired.q18 = "B"; // 人机协作
  // q19 是多选认知宽度题，默认 [A, C] 给拓展认知计算时提供基础样本
  if (!repaired.q19 || !Array.isArray(repaired.q19)) repaired.q19 = ["A", "C"];
  if (!repaired.q20 || Array.isArray(repaired.q20)) repaired.q20 = "A"; // 刚需：重复执行
  if (!repaired.q21 || Array.isArray(repaired.q21)) repaired.q21 = "A"; // 预期价值
  if (!repaired.q22 || Array.isArray(repaired.q22)) repaired.q22 = "B"; // 落地偏好：模板复用
  if (!repaired.q23 || Array.isArray(repaired.q23)) repaired.q23 = "A"; // 阻力：场景不清晰
  if (!repaired.q24 || Array.isArray(repaired.q24)) repaired.q24 = "D"; // 深度诊断意愿：先试工具

  return repaired;
}
