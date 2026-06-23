import type { UIMessage } from "ai";

type ToolPartView = {
  toolName: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
};

export type DeepDiagnosisRuntimeEvents = {
  userText: string;
  assistantText: string;
  allText: string;
  toolParts: ToolPartView[];
  choiceSelectionIds: string[];
  choiceSelectionLabels: string[];
  webSearchOutputs: Record<string, unknown>[];
};

export function extractDeepDiagnosisRuntimeEvents(messages: UIMessage[]): DeepDiagnosisRuntimeEvents {
  const userTextParts: string[] = [];
  const assistantTextParts: string[] = [];
  const toolParts: ToolPartView[] = [];
  const choiceSelectionIds: string[] = [];
  const choiceSelectionLabels: string[] = [];
  const webSearchOutputs: Record<string, unknown>[] = [];

  for (const message of messages) {
    for (const part of message.parts || []) {
      if (part.type === "text" && "text" in part) {
        const text = String(part.text || "");
        if (message.role === "user") userTextParts.push(text);
        if (message.role === "assistant") assistantTextParts.push(text);
        continue;
      }

      if (!String(part.type).startsWith("tool-")) continue;

      const toolName = String(part.type).replace(/^tool-/, "");
      const input = "input" in part && isRecord(part.input) ? part.input : {};
      const output = "output" in part && isRecord(part.output) ? part.output : {};
      toolParts.push({ toolName, input, output });

      if (toolName === "askUserChoice") {
        const selected = readChoiceSelection(output);
        choiceSelectionIds.push(...selected.ids);
        choiceSelectionLabels.push(...selected.labels);
      }

      if (toolName === "webSearch") {
        webSearchOutputs.push(output);
      }
    }
  }

  const userText = normalizeWhitespace(userTextParts.join("\n"));
  const assistantText = normalizeWhitespace(assistantTextParts.join("\n"));

  return {
    userText,
    assistantText,
    allText: normalizeWhitespace([userText, assistantText].filter(Boolean).join("\n")),
    toolParts,
    choiceSelectionIds: uniqueStrings(choiceSelectionIds),
    choiceSelectionLabels: uniqueStrings(choiceSelectionLabels),
    webSearchOutputs,
  };
}

export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function readChoiceSelection(output: Record<string, unknown>): { ids: string[]; labels: string[] } {
  const ids = [
    ...readStringList(output, "selected"),
    ...readStringList(output, "selectedIds"),
    ...readStringList(output, "selectedOptionIds"),
    ...readStringList(output, "values"),
    ...readStringList(output, "value"),
    ...readStringList(output, "id"),
  ];
  const labels = [
    ...readStringList(output, "selectedLabels"),
    ...readStringList(output, "labels"),
    ...readStringList(output, "label"),
  ];

  return { ids, labels };
}

function readStringList(source: Record<string, unknown>, key: string): string[] {
  const value = source[key];
  if (typeof value === "string" && value.trim()) return [value.trim()];
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())).map((item) => item.trim());
}

function uniqueStrings(items: string[]): string[] {
  return Array.from(new Set(items.filter(Boolean)));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
