import { WISH_CREATOR_START_IMPLEMENTATION_OPTION_ID } from "../../constants/wish-creator.ts";
import type {
  WishCreatorRequirementGateRuntimeStatus,
  WishCreatorRequirementPath,
} from "@/types/wish-creator";

export function shouldGateInitialRequirement(
  existingMessageCount: number,
  hasExplicitCreationIntent: boolean,
): boolean {
  return existingMessageCount === 0 && hasExplicitCreationIntent;
}

export function canRenderHtmlArtifact(
  status: WishCreatorRequirementGateRuntimeStatus,
): boolean {
  return status === "released";
}

export function shouldBlockHtmlArtifact(
  status: WishCreatorRequirementGateRuntimeStatus,
): boolean {
  return status === "awaiting-choice" || status === "grilling";
}

export function isRequirementImplementationRelease<
  TResponse extends { readonly optionId?: string },
>(
  responses: readonly TResponse[],
): boolean {
  return responses.some(({ optionId }) => optionId === WISH_CREATOR_START_IMPLEMENTATION_OPTION_ID);
}

export function filterBlockedHtmlArtifacts<
  TArtifact extends { readonly revision: string },
>(
  artifacts: readonly TArtifact[],
  blockedRevisions: ReadonlySet<string>,
): readonly TArtifact[] {
  return artifacts.filter(({ revision }) => !blockedRevisions.has(revision));
}

export function createRequirementPathClientContext(
  path: WishCreatorRequirementPath,
): string {
  if (path === "clarify") {
    return [
      "许愿池首次创建流程状态（用户已在客户端明确确认）：",
      "- 用户选择：先拆解需求。",
      "- 必须加载 `grill-me` Skill，并按照该 Skill 一次只询问一个问题。",
      "- 本轮禁止生成 HTML artifact，也不要加载页面实现 Skill。",
      `- 访谈结束时必须使用选项 ID \`${WISH_CREATOR_START_IMPLEMENTATION_OPTION_ID}\` 请求最终实现确认。`,
      "- 禁止再次调用 `ask_question` 询问是否需要拆解需求。",
    ].join("\n");
  }

  return [
    "许愿池首次创建流程状态（用户已在客户端明确确认）：",
    "- 用户选择：直接创建，不进行需求访谈。",
    "- 禁止调用 `ask_question` 询问是否需要拆解需求。",
    "- 不要加载 `grill-me` Skill，立即进入页面实现流程。",
  ].join("\n");
}
