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
  const options = Array.isArray(input.options) ? (input.options as ChoiceOption[]) : [];
  const mode = input.mode === "multiple" ? "multiple" : "single";
  const allowOther = input.allowOther !== false;
  const [selected, setSelected] = useState<string[]>([]);
  const [otherText, setOtherText] = useState("");
  const answered = part.state === "output-available";
  const output = part.output || {};

  function toggle(optionId: string) {
    if (answered || options.find((option) => option.id === optionId)?.disabled) return;
    setSelected((current) => {
      if (mode === "single") return current.includes(optionId) ? [] : [optionId];
      if (current.includes(optionId)) return current.filter((id) => id !== optionId);
      const max = Number(input.maxSelections || options.length);
      if (current.length >= max) return current;
      return [...current, optionId];
    });
  }

  function submitChoice() {
    const trimmedOther = otherText.trim();
    if (!selected.length && !trimmedOther && input.required !== false) return;
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
      <Card className="mt-3 border-border/70 bg-emerald-50/70 p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <strong className="text-sm font-semibold">{input.question || "已完成选择"}</strong>
          <span className="text-xs font-semibold text-muted-foreground">已提交</span>
        </div>
        <p className="text-sm leading-6">{[...labels, output.otherText].filter(Boolean).join("、") || "已提交选择"}</p>
      </Card>
    );
  }

  return (
    <Card className="mt-3 border-border/70 bg-background/80 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <strong className="text-sm font-semibold">{input.question || "请选择一个方向"}</strong>
        <span className="text-xs font-semibold text-muted-foreground">{mode === "multiple" ? "多选" : "单选"}</span>
      </div>
      {mode === "single" ? (
        <RadioGroup.Root className="grid gap-2" value={selected[0] || ""} onValueChange={(value) => setSelected(value ? [value] : [])}>
          {options.map((option) => (
            <RadioGroup.Item
              key={option.id}
              value={option.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border border-border bg-background p-3 text-left transition-colors hover:bg-accent/40 data-[state=checked]:border-primary",
                option.disabled && "opacity-50"
              )}
              disabled={option.disabled}
            >
              <span className="mt-0.5 grid h-4 w-4 place-items-center rounded-full border border-primary">
                <RadioGroup.Indicator>
                  <Check className="h-3 w-3 text-primary" />
                </RadioGroup.Indicator>
              </span>
              <span className="text-left">
                <strong className="block text-sm font-semibold">{option.label}</strong>
                {option.description ? <small>{option.description}</small> : null}
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
                "flex items-start gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:bg-accent/40",
                selected.includes(option.id) && "border-primary bg-accent/50"
              )}
            >
              <Checkbox.Root
                className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-sm border border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                checked={selected.includes(option.id)}
                disabled={option.disabled}
                onCheckedChange={() => toggle(option.id)}
              >
                <Checkbox.Indicator>
                  <Check className="h-3 w-3" />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <span className="text-left">
                <strong className="block text-sm font-semibold">{option.label}</strong>
                {option.description ? <small className="mt-1 block text-xs text-muted-foreground">{option.description}</small> : null}
              </span>
            </label>
          ))}
        </div>
      )}
      {allowOther ? (
        <Input
          className="mt-3"
          value={otherText}
          onChange={(event) => setOtherText(event.target.value)}
          placeholder={input.otherLabel || "没有合适选项？写下你的想法"}
        />
      ) : null}
      <Button className="mt-3" type="button" onClick={submitChoice} disabled={!selected.length && !otherText.trim() && input.required !== false}>
        提交选择
      </Button>
    </Card>
  );
}
