"use client";

import * as Checkbox from "@radix-ui/react-checkbox";
import * as RadioGroup from "@radix-ui/react-radio-group";
import type { ChatAddToolOutputFunction, UIMessage } from "ai";
import { Check, CornerDownRight } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { ToolPartShape } from "../MessagePartsRenderer";
import { AguiStatusBadge } from "./agui-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ChoiceOption = {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

export function hasRenderableChoiceOptions(input: unknown): boolean {
  return normalizeChoiceOptions(input).length > 0;
}

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
  const [limitHint, setLimitHint] = useState("");
  const answered = part.state === "output-available";
  const output = part.output || {};

  if (!answered && options.length === 0) {
    return (
      <section className="rounded-xl border border-[#d6e7ff] bg-[#f8fbff] p-4 shadow-[0_1px_1px_rgba(0,0,0,0.02)]">
        <AguiStatusBadge status="loading">正在整理选项</AguiStatusBadge>
        <strong className="mt-2 block text-sm font-semibold text-[#171717]">
          {input.question || getDefaultQuestion(mode)}
        </strong>
        <p className="mt-2 text-sm leading-6 text-[#666666]">
          选项马上出现，先别急着填写其他答案。
        </p>
      </section>
    );
  }

  function toggle(optionId: string) {
    if (answered || options.find((option) => option.id === optionId)?.disabled) return;
    setSelected((current) => {
      if (mode === "single") return current.includes(optionId) ? [] : [optionId];
      if (current.includes(optionId)) return current.filter((id) => id !== optionId);
      if (maxSelections > 0 && current.length >= maxSelections) {
        setLimitHint(`最多选择 ${maxSelections} 项`);
        return current;
      }
      setLimitHint("");
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
      <section className="rounded-xl border border-[#b9f5bc] bg-[#fbfffb] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <AguiStatusBadge status="success">选择已提交</AguiStatusBadge>
            <strong className="mt-2 block text-sm font-semibold text-[#171717]">{input.question || "已完成选择"}</strong>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[...labels, output.otherText].filter(Boolean).map((label) => (
            <span key={String(label)} className="rounded-md border border-[#b9f5bc] bg-white px-2.5 py-1.5 text-sm font-medium text-[#107d32]">
              {String(label)}
            </span>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-[#d6e7ff] bg-[#f8fbff] p-3 shadow-[0_1px_1px_rgba(0,0,0,0.02)] sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <AguiStatusBadge status="input">{mode === "multiple" ? getMultipleModeLabel(minSelections, maxSelections) : "单选确认"}</AguiStatusBadge>
          <strong className="mt-2 block text-sm font-semibold text-[#171717]">{input.question || getDefaultQuestion(mode)}</strong>
        </div>
        <span className="text-xs text-[#666666]">{getSelectionSummary({ mode, selectedCount: selected.length, minSelections, maxSelections })}</span>
      </div>

      {mode === "single" ? (
        <RadioGroup.Root className="mt-3 grid gap-2" value={selected[0] || ""} onValueChange={(value) => setSelected(value ? [value] : [])}>
          {options.map((option) => <ChoiceRow key={option.id} option={option} selected={selected.includes(option.id)} mode="single" />)}
        </RadioGroup.Root>
      ) : (
        <div className="mt-3 grid gap-2">
          {options.map((option) => (
            <label key={option.id} className={getChoiceRowClass(selected.includes(option.id), option.disabled)}>
              <Checkbox.Root className="group -ml-2 -mt-2 grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006bff] focus-visible:ring-offset-2 disabled:cursor-not-allowed" checked={selected.includes(option.id)} disabled={option.disabled} onCheckedChange={() => toggle(option.id)}>
                <ChoiceControlMark shape="square" selected={selected.includes(option.id)}>
                  <Checkbox.Indicator><Check className="h-3.5 w-3.5 stroke-[3]" /></Checkbox.Indicator>
                </ChoiceControlMark>
              </Checkbox.Root>
              <ChoiceText option={option} />
            </label>
          ))}
        </div>
      )}

      {allowOther ? (
        <label className="mt-3 block">
          <span className="mb-1 flex items-center gap-1 text-xs font-medium text-[#666666]">
            <CornerDownRight className="h-3.5 w-3.5" />
            其他答案
          </span>
          <Input className="rounded-md border-[#d6e7ff] bg-white text-sm shadow-none focus-visible:border-[#171717] focus-visible:ring-0 focus-visible:ring-offset-0" value={otherText} onChange={(event) => setOtherText(event.target.value)} placeholder={input.otherLabel || "没有合适选项？写下你的想法"} />
        </label>
      ) : null}
      {limitHint ? <p className="mt-2 text-xs text-[#8a5a00]">{limitHint}</p> : null}
      <Button className="mt-3 h-11 w-full rounded-md border border-[#171717] bg-[#171717] text-white shadow-none hover:bg-black focus-visible:ring-[#006bff] disabled:border-[#eaeaea] disabled:bg-[#f2f2f2] disabled:text-[#8f8f8f] sm:w-auto" type="button" onClick={submitChoice} disabled={isSubmitDisabled({ mode, selectedCount: selected.length, hasOtherText: Boolean(otherText.trim()), required: input.required !== false, minSelections })}>
        提交选择
      </Button>
    </section>
  );
}

function ChoiceRow({ option, selected, mode }: { option: ChoiceOption; selected: boolean; mode: "single" }) {
  return (
    <RadioGroup.Item value={option.id} className={getChoiceRowClass(selected, option.disabled)} disabled={option.disabled}>
      <span className="-ml-2 -mt-2 grid h-10 w-10 shrink-0 place-items-center rounded-md">
        <ChoiceControlMark shape="circle" selected={selected}>
          <RadioGroup.Indicator><Check className="h-3.5 w-3.5 stroke-[3]" /></RadioGroup.Indicator>
        </ChoiceControlMark>
      </span>
      <ChoiceText option={option} />
    </RadioGroup.Item>
  );
}

function ChoiceControlMark({
  shape,
  selected,
  children,
}: {
  shape: "circle" | "square";
  selected: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "grid h-[18px] w-[18px] place-items-center border-[1.5px] border-[#171717] bg-white text-transparent transition-[background-color,color] duration-150",
        shape === "circle" ? "rounded-full" : "rounded-[5px]",
        selected && "bg-[#171717] text-white",
      )}
    >
      {children}
    </span>
  );
}

function ChoiceText({ option }: { option: ChoiceOption }) {
  return (
    <span className="text-left">
      <strong className="block text-sm font-semibold text-[#171717]">{option.label}</strong>
      {option.description ? <small className="mt-1 block text-xs leading-5 text-[#666666]">{option.description}</small> : null}
    </span>
  );
}

function getChoiceRowClass(selected: boolean, disabled?: boolean) {
  return cn(
    "flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-[#d6e7ff] bg-white p-3 text-left transition-[border-color,background-color,box-shadow] duration-150 hover:border-[#9dc9ff] hover:shadow-[0_1px_1px_rgba(0,0,0,0.02)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006bff] focus-visible:ring-offset-2",
    selected && "border-[#171717] bg-white",
    disabled && "cursor-not-allowed opacity-50",
  );
}

function getSelectionSummary({
  mode,
  selectedCount,
  minSelections,
  maxSelections,
}: {
  mode: "single" | "multiple";
  selectedCount: number;
  minSelections: number;
  maxSelections: number;
}) {
  if (mode === "single") return selectedCount ? "已选 1 项" : "未选择";
  const maxText = maxSelections > 0 ? ` / 最多 ${maxSelections}` : "";
  const minText = minSelections > 0 ? ` / 至少 ${minSelections}` : "";
  return `已选 ${selectedCount}${minText}${maxText}`;
}

function getMultipleModeLabel(minSelections: number, maxSelections: number): string {
  if (maxSelections > 0) return minSelections > 0 ? `多选 ${minSelections}-${maxSelections} 项` : `最多 ${maxSelections} 项`;
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
  if (mode === "multiple" && minSelections > 0) return selectedCount < minSelections && !hasOtherText;
  return selectedCount === 0 && !hasOtherText;
}

function normalizeChoiceOptions(value: unknown): ChoiceOption[] {
  if (!Array.isArray(value)) return [];
  const usedIds = new Set<string>();
  return value.map((rawOption, index) => {
    const option = typeof rawOption === "object" && rawOption !== null ? rawOption as Partial<ChoiceOption> & { value?: unknown } : { label: String(rawOption) };
    const rawLabel = toOptionText(option.label);
    const rawDescription = toOptionText(option.description);
    const rawValue = toOptionText(option.value);
    const rawId = toOptionText(option.id);
    const label = getDisplayOptionLabel({
      id: rawId,
      value: rawValue,
      label: rawLabel,
      description: rawDescription,
      index,
    });
    const baseId = String(option.id || option.value || option.label || `option-${index}`);
    const id = toUniqueOptionId(baseId, index, usedIds);
    return {
      id,
      label,
      description: rawDescription && rawDescription !== label ? rawDescription : undefined,
      disabled: Boolean(option.disabled),
    };
  });
}

function toOptionText(value: unknown): string {
  return typeof value === "string" ? value.trim() : value === undefined || value === null ? "" : String(value).trim();
}

function getDisplayOptionLabel({
  id,
  value,
  label,
  description,
  index,
}: {
  id: string;
  value: string;
  label: string;
  description: string;
  index: number;
}): string {
  if (label && !isGenericOptionLabel(label)) return label;
  if (description) return description;
  if (value && !isGenericOptionLabel(value)) return value;
  if (id && !isGenericOptionLabel(id)) return id;
  return label || value || id || `未命名选项 ${index + 1}`;
}

function isGenericOptionLabel(value: string): boolean {
  return /^(?:选项|option|choice|item)[\s_-]*\d+$/i.test(value.trim());
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
