import type { UIMessage } from "ai";

export type DeepDiagnosisPortableReportAction = {
  disabled: boolean;
  disabledReason?: string;
  label: string;
};

export type DeepDiagnosisPortableReportStageInput = {
  hasPendingChoice: boolean;
  hasPortableReportReady: boolean;
  isBusy: boolean;
  isEmptyConversation: boolean;
  shouldShowConversationLoading: boolean;
};

export function getDeepDiagnosisPortableReportAction({
  hasPendingChoice,
  hasPortableReportReady,
  isBusy,
  isEmptyConversation,
  shouldShowConversationLoading,
}: DeepDiagnosisPortableReportStageInput): DeepDiagnosisPortableReportAction {
  if (shouldShowConversationLoading) {
    return {
      disabled: true,
      disabledReason: "诊断记录加载完成后可生成方案链接",
      label: "正在读取诊断",
    };
  }

  if (isBusy) {
    return {
      disabled: true,
      disabledReason: "等当前回复生成完成后可生成方案链接",
      label: "准备生成链接",
    };
  }

  if (hasPendingChoice) {
    return {
      disabled: true,
      disabledReason: "先完成上方选择，再生成方案链接",
      label: "先完成选择",
    };
  }

  if (isEmptyConversation) {
    return {
      disabled: false,
      label: "生成方案链接",
    };
  }

  if (hasPortableReportReady) {
    return {
      disabled: false,
      label: "生成当前方案链接",
    };
  }

  return {
    disabled: false,
    label: "补齐后生成链接",
  };
}

export function getDeepDiagnosisPortableReportStageLabel({
  hasPendingChoice,
  hasPortableReportReady,
  isBusy,
  isEmptyConversation,
  shouldShowConversationLoading,
}: DeepDiagnosisPortableReportStageInput) {
  if (shouldShowConversationLoading) return "读取诊断";
  if (isBusy) return "回复生成中";
  if (hasPendingChoice) return "等待选择";
  if (isEmptyConversation) return "准备开始";
  if (hasPortableReportReady) return "方案草稿已形成";
  return "信息补齐";
}

export function hasPendingDeepDiagnosisUserChoice(messages: UIMessage[]) {
  const lastUserMessageIndex = messages.findLastIndex((message) => message.role === "user");
  const currentTurnMessages = messages.slice(lastUserMessageIndex + 1);

  return currentTurnMessages.some((message) =>
    message.role === "assistant" &&
    (message.parts || []).some(isPendingRenderableChoicePart),
  );
}

function isPendingRenderableChoicePart(part: UIMessage["parts"][number]) {
  if (part.type !== "tool-askUserChoice") return false;
  if ("state" in part && part.state === "output-available") return false;
  if ("state" in part && part.state === "input-streaming") return false;
  const input = "input" in part && part.input && typeof part.input === "object"
    ? part.input as { options?: unknown }
    : {};
  return Array.isArray(input.options) && input.options.length > 0;
}
