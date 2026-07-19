import { z } from "zod";
import { WISH_CAPABILITY_GAP_IDS } from "../../constants/wish-intake.ts";

const requiredWishField = z.string().trim().min(2).max(1200);
const draftWishField = z.string().trim().max(1200).default("");

export const wishSummaryDraftSchema = z.object({
  title: z.string().trim().max(80).default("")
    .describe("简洁的愿望名称；对话中无法判断时返回空字符串"),
  goal: draftWishField.describe("用户想实现的核心目标；未说明时返回空字符串"),
  usageScenario: draftWishField.describe("谁在什么场景下使用；未说明时返回空字符串"),
  currentProblem: draftWishField.describe("用户现在遇到的问题；未说明时返回空字符串"),
  idealResult: draftWishField.describe("用户认为成功的理想结果；未说明时返回空字符串"),
  constraints: draftWishField.describe("预算、时间、现有系统等约束；未说明时返回空字符串"),
});

export const wishSummarySchema = z.object({
  title: z.string().trim().min(2).max(80),
  goal: requiredWishField,
  usageScenario: requiredWishField,
  currentProblem: requiredWishField,
  idealResult: requiredWishField,
  constraints: z.string().trim().max(1200).default(""),
});

export const wishAnalysisSchema = z.object({
  capabilityGaps: z.array(z.enum(WISH_CAPABILITY_GAP_IDS)).min(1).max(4),
  rationale: z.string().trim().min(2).max(1000),
});

export type WishSummaryInput = z.input<typeof wishSummarySchema>;
