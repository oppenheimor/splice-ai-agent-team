import { deepseek } from "@ai-sdk/deepseek";
import { generateText, Output, type UIMessage } from "ai";
import { WISH_ANALYSIS_VERSION, WISH_CAPABILITY_GAPS } from "@/constants/wish-intake";
import type { WishAnalysis, WishSummary } from "@/types/wish-intake";
import { buildWishTranscript } from "@/lib/wish-intake/messages";
import {
  wishAnalysisSchema,
  wishSummaryDraftSchema,
} from "@/lib/wish-intake/schema";

const SUMMARY_INSTRUCTIONS = `你负责把一段需求访谈整理成用户可确认的愿望摘要。
只依据对话中的事实，不补写用户没有表达的功能、预算或时间。
字段应简洁、具体、使用第一人称或贴近用户原话。任何没有从对话中得到的信息都返回空字符串。`;

export async function generateWishSummary(messages: UIMessage[]): Promise<WishSummary> {
  assertModelConfigured();
  const transcript = buildWishTranscript(messages);

  if (!transcript) {
    throw new Error("请先说说你的想法。");
  }

  const { output } = await generateText({
    model: deepseek(process.env.DEEPSEEK_MODEL || "deepseek-chat"),
    instructions: SUMMARY_INSTRUCTIONS,
    output: Output.object({ schema: wishSummaryDraftSchema }),
    prompt: transcript,
    temperature: 0.25,
  });

  return wishSummaryDraftSchema.parse(output);
}

export async function analyzeWish(summary: WishSummary): Promise<WishAnalysis> {
  assertModelConfigured();
  const availableGaps = WISH_CAPABILITY_GAPS
    .map((item) => `${item.id}: ${item.label}`)
    .join("\n");

  try {
    const { output } = await generateText({
      model: deepseek(process.env.DEEPSEEK_MODEL || "deepseek-chat"),
      instructions: `你负责内部分析愿望所涉及的平台能力缺口。只能从给定分类中选择 1-4 个，并用一句话说明判断依据。\n${availableGaps}`,
      output: Output.object({ schema: wishAnalysisSchema }),
      prompt: JSON.stringify(summary),
      temperature: 0.1,
    });
    const result = wishAnalysisSchema.parse(output);

    return {
      capabilityGaps: result.capabilityGaps,
      rationale: result.rationale,
      version: WISH_ANALYSIS_VERSION,
    };
  } catch (error) {
    // 内部分类失败不应该阻断用户提交；保留稳定兜底标签，后续仍可重新分析。
    console.error("[wish-intake] capability analysis failed", error);
    return {
      capabilityGaps: ["other"],
      rationale: "自动分类暂时失败，等待后续重新分析。",
      version: WISH_ANALYSIS_VERSION,
    };
  }
}

function assertModelConfigured() {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error("服务端缺少 DEEPSEEK_API_KEY，暂时无法整理愿望。");
  }
}
