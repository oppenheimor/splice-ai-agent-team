"use client";

import * as Checkbox from "@radix-ui/react-checkbox";
import * as RadioGroup from "@radix-ui/react-radio-group";
import type { ChatAddToolOutputFunction, UIMessage } from "ai";
import { Check } from "lucide-react";
import { useState } from "react";
import type { ToolPartShape } from "../MessagePartsRenderer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ChoiceOption = {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

export function ChoiceTool({
  part,
  addToolOutput,
}: {
  part: ToolPartShape;
  addToolOutput: ChatAddToolOutputFunction<UIMessage>;
}) {
  const input = part.input || {};
  const options = normalizeChoiceOptions(input.options);
  const mode = input.mode === "multiple" ? "multiple" : "single";
  const allowOther = input.allowOther !== false;
  const minSelections = Number(input.minSelections || 0);
  const maxSelections = Number(input.maxSelections || 0);
  const [selected, setSelected] = useState<string[]>([]);
  const [otherText, setOtherText] = useState("");
  const answered = part.state === "output-available";
  const output = part.output || {};
  const microInteraction =
    "motion-safe:transition-[border-color,background-color,box-shadow,color,transform] motion-safe:duration-150 motion-safe:ease-[cubic-bezier(0.175,0.885,0.32,1.1)] active:scale-[0.99] motion-reduce:transition-none";

  function toggle(optionId: string) {
    if (answered || options.find((option) => option.id === optionId)?.disabled) return;
    setSelected((current) => {
      if (mode === "single") return current.includes(optionId) ? [] : [optionId];
      if (current.includes(optionId)) return current.filter((id) => id !== optionId);
      if (maxSelections > 0 && current.length >= maxSelections) return current;
      return [...current, optionId];
    });
  }

  function submitChoice() {
    const trimmedOther = otherText.trim();
    if (!selected.length && !trimmedOther && input.required !== false) return;
    if (mode === "multiple" && minSelections > 0 && selected.length < minSelections && !trimmedOther) return;
    if (!part.toolCallId) return;
    addToolOutput({
      tool: "askUserChoice",
      toolCallId: part.toolCallId,
      output: {
        selected,
        otherText: trimmedOther || null,
        selectedLabels: options.filter((option) => selected.includes(option.id)).map((option) => option.label),
      },
    });
  }

  if (answered) {
    const labels = Array.isArray(output.selectedLabels) && output.selectedLabels.length
      ? output.selectedLabels
      : options.filter((option) => output.selected?.includes(option.id)).map((option) => option.label);

    return (
      <Card className="border-[#eaeaea] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.02),0_8px_16px_-12px_rgba(0,0,0,0.12)]">
        <div className="mb-3 flex items-start justify-between gap-3">
          <strong className="text-sm font-semibold text-[#171717]">{input.question || "已完成选择"}</strong>
          <span className="rounded-full border border-[#eaeaea] bg-[#fafafa] px-2.5 py-1 text-xs font-semibold text-[#107d32]">已提交</span>
        </div>
        <p className="text-sm leading-6 text-[#4d4d4d]">{[...labels, output.otherText].filter(Boolean).join("、") || "已提交选择"}</p>
      </Card>
    );
  }

  return (
    <Card className="border-[#eaeaea] bg-white p-4 shadow-[0_2px_2px_rgba(0,0,0,0.04)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <strong className="text-sm font-semibold text-[#171717]">{input.question || getDefaultQuestion(mode)}</strong>
        <span className="rounded-full border border-[#eaeaea] bg-[#fafafa] px-2.5 py-1 text-xs font-semibold text-[#666666]">
          {mode === "multiple" ? getMultipleModeLabel(minSelections, maxSelections) : "单选"}
        </span>
      </div>
      {mode === "single" ? (
        <RadioGroup.Root className="grid gap-2" value={selected[0] || ""} onValueChange={(value) => setSelected(value ? [value] : [])}>
          {options.map((option) => (
            <RadioGroup.Item
              key={option.id}
              value={option.id}
              className={cn(
                `flex items-start gap-3 rounded-lg border border-[#eaeaea] bg-[#fafafa] p-3 text-left hover:border-[#c9c9c9] hover:bg-white hover:shadow-[0_1px_1px_rgba(0,0,0,0.02)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006bff] focus-visible:ring-offset-2 data-[state=checked]:border-[#171717] data-[state=checked]:bg-white ${microInteraction}`,
                option.disabled && "opacity-50"
              )}
              disabled={option.disabled}
            >
              <span className="mt-0.5 grid h-4 w-4 place-items-center rounded-full border border-[#171717]">
                <RadioGroup.Indicator>
                  <Check className="h-3 w-3 text-[#171717]" />
                </RadioGroup.Indicator>
              </span>
              <span className="text-left">
                <strong className="block text-sm font-semibold text-[#171717]">{option.label}</strong>
                {option.description ? <small className="mt-1 block text-xs leading-5 text-[#666666]">{option.description}</small> : null}
              </span>
            </RadioGroup.Item>
          ))}
        </RadioGroup.Root>
      ) : (
        <div className="grid gap-2">
          {options.map((option) => (
            <label
              key={option.id}
              className={cn(
                `flex items-start gap-3 rounded-lg border border-[#eaeaea] bg-[#fafafa] p-3 hover:border-[#c9c9c9] hover:bg-white hover:shadow-[0_1px_1px_rgba(0,0,0,0.02)] ${microInteraction}`,
                selected.includes(option.id) && "border-[#171717] bg-white",
                option.disabled && "opacity-50"
              )}
            >
              <Checkbox.Root
                className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-[4px] border border-[#171717] data-[state=checked]:bg-[#171717] data-[state=checked]:text-white"
                checked={selected.includes(option.id)}
                disabled={option.disabled}
                onCheckedChange={() => toggle(option.id)}
              >
                <Checkbox.Indicator>
                  <Check className="h-3 w-3" />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <span className="text-left">
                <strong className="block text-sm font-semibold text-[#171717]">{option.label}</strong>
                {option.description ? <small className="mt-1 block text-xs leading-5 text-[#666666]">{option.description}</small> : null}
              </span>
            </label>
          ))}
        </div>
      )}
      {allowOther ? (
        <Input
          className="mt-3 rounded-md border-[#eaeaea] bg-white text-sm shadow-none focus-visible:border-[#006bff] focus-visible:ring-2 focus-visible:ring-[#006bff] focus-visible:ring-offset-2"
          value={otherText}
          onChange={(event) => setOtherText(event.target.value)}
          placeholder={input.otherLabel || "没有合适选项？写下你的想法"}
        />
      ) : null}
      <Button
        className={`mt-3 rounded-md border border-[#171717] bg-[#171717] text-white shadow-none hover:bg-black focus-visible:ring-[#006bff] disabled:border-[#eaeaea] disabled:bg-[#f2f2f2] disabled:text-[#8f8f8f] ${microInteraction}`}
        type="button"
        onClick={submitChoice}
        disabled={isSubmitDisabled({ mode, selectedCount: selected.length, hasOtherText: Boolean(otherText.trim()), required: input.required !== false, minSelections })}
      >
        提交选择
      </Button>
    </Card>
  );
}

function getMultipleModeLabel(minSelections: number, maxSelections: number): string {
  if (maxSelections > 0) {
    return minSelections > 0 ? `多选 ${minSelections}-${maxSelections} 项` : `最多 ${maxSelections} 项`;
  }

  return minSelections > 0 ? `至少 ${minSelections} 项，可全选` : "可多选";
}

function getDefaultQuestion(mode: "single" | "multiple"): string {
  return mode === "multiple" ? "请选择你想一起评估的问题" : "请选择一个方向";
}

function isSubmitDisabled({
  mode,
  selectedCount,
  hasOtherText,
  required,
  minSelections,
}: {
  mode: "single" | "multiple";
  selectedCount: number;
  hasOtherText: boolean;
  required: boolean;
  minSelections: number;
}): boolean {
  if (!required) return false;
  if (mode === "multiple" && minSelections > 0) {
    return selectedCount < minSelections && !hasOtherText;
  }

  return selectedCount === 0 && !hasOtherText;
}

function normalizeChoiceOptions(value: unknown): ChoiceOption[] {
  if (!Array.isArray(value)) return [];

  const usedIds = new Set<string>();

  return value.map((rawOption, index) => {
    const option = typeof rawOption === "object" && rawOption !== null
      ? rawOption as Partial<ChoiceOption> & { value?: unknown }
      : { label: String(rawOption) };
    const baseId = String(option.id || option.value || option.label || `option-${index}`);
    const id = toUniqueOptionId(baseId, index, usedIds);

    return {
      id,
      label: String(option.label || option.id || option.value || `选项 ${index + 1}`),
      description: option.description ? String(option.description) : undefined,
      disabled: Boolean(option.disabled),
    };
  });
}

function toUniqueOptionId(baseId: string, index: number, usedIds: Set<string>): string {
  const normalized = baseId.trim() || `option-${index}`;
  if (!usedIds.has(normalized)) {
    usedIds.add(normalized);
    return normalized;
  }

  const fallback = `${normalized}-${index}`;
  usedIds.add(fallback);
  return fallback;
}
