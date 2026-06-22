"use client";

import { useMemo, useState } from "react";
import type { ToolPartShape } from "../MessagePartsRenderer";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type DataTableColumn = {
  key: string;
  label?: string;
};

type FrameworkNode = {
  title: string;
  description?: string;
  status?: string;
  items?: string[];
};

export function ComparisonTool({ data }: { data: any }) {
  const criteria = Array.isArray(data?.criteria) ? data.criteria : [];
  const options = Array.isArray(data?.options) ? data.options : [];
  return (
    <Card className="overflow-hidden border-[#eaeaea] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.02),0_8px_16px_-8px_rgba(0,0,0,0.06)]">
      <div className="border-b border-[#eaeaea] bg-[#fafafa] p-4">
        <AguiHeader title={data?.title || "方案对比"} />
      </div>
      <div className="grid gap-3 p-3 md:grid-cols-2">
        {options.map((option: any) => (
          <article key={option.name} className="rounded-lg border border-[#eaeaea] bg-white p-4">
            <h4 className="text-sm font-semibold text-[#171717]">{option.name}</h4>
            <p className="mt-2 text-sm leading-6 text-[#666666]">{option.summary}</p>
            {criteria.length ? (
              <div className="mt-3 grid gap-1.5 text-sm">
                {criteria.map((criterion: string) => (
                  <span key={criterion} className="flex items-center justify-between gap-3 rounded-md border border-[#eaeaea] bg-white px-3 py-2">
                    <b>{criterion}</b>
                    <em className="text-[#666666]">{option.scores?.[criterion] ?? "-"}</em>
                  </span>
                ))}
              </div>
            ) : null}
            {option.recommendation ? <strong className="mt-3 block text-sm text-[#171717]">{option.recommendation}</strong> : null}
          </article>
        ))}
      </div>
    </Card>
  );
}

export function ChecklistTool({ data }: { data: any }) {
  const items = Array.isArray(data?.items) ? data.items : [];
  return (
    <Card className="overflow-hidden border-[#eaeaea] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.02),0_8px_16px_-8px_rgba(0,0,0,0.06)]">
      <div className="border-b border-[#eaeaea] bg-[#fafafa] p-4">
        <AguiHeader title={data?.title || "行动清单"} description={data?.description} />
      </div>
      <div className="grid gap-2 p-3">
        {items.map((item: any, index: number) => (
          <label
            key={`${item.label}-${index}`}
            className={cn("flex items-start gap-3 rounded-lg border border-[#eaeaea] bg-[#fafafa] p-3", item.priority === "high" && "border-[#ffd7d6] bg-[#ffeeef]")}
          >
            <Checkbox />
            <span className="text-left">
              <strong className="block text-sm font-semibold text-[#171717]">{item.label}</strong>
              {item.detail ? <small className="mt-1 block text-xs leading-5 text-[#666666]">{item.detail}</small> : null}
            </span>
          </label>
        ))}
      </div>
    </Card>
  );
}

export function TimelineTool({ data }: { data: any }) {
  const steps = Array.isArray(data?.steps) ? data.steps : [];
  return (
    <Card className="overflow-hidden border-[#eaeaea] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.02),0_8px_16px_-8px_rgba(0,0,0,0.06)]">
      <div className="border-b border-[#eaeaea] bg-[#fafafa] p-4">
        <AguiHeader title={data?.title || "时间线"} description={data?.description} />
      </div>
      <div className="grid gap-0 p-3">
        {steps.map((step: any, index: number) => (
          <article key={`${step.title}-${index}`} className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 border-l border-[#eaeaea] pb-4 pl-4 last:pb-0">
            <span className="text-sm font-semibold text-[#0059ec]">{step.time || `Step ${index + 1}`}</span>
            <div className="relative">
              <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border border-[#171717] bg-white" />
              <strong className="block text-sm font-semibold text-[#171717]">{step.title}</strong>
              <p className="mt-1 text-sm leading-6 text-[#666666]">{step.detail}</p>
              {step.owner ? <small className="mt-1 block text-xs text-[#8f8f8f]">{step.owner}</small> : null}
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}

export function ScorecardTool({ data }: { data: any }) {
  const dimensions = Array.isArray(data?.dimensions) ? data.dimensions : [];
  const overall = typeof data?.overall === "number" ? data.overall : 0;
  return (
    <Card className="overflow-hidden border-[#eaeaea] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.02),0_8px_16px_-8px_rgba(0,0,0,0.06)]">
      <div className="grid gap-px bg-[#eaeaea] md:grid-cols-[180px_minmax(0,1fr)]">
        <div className="bg-[#171717] p-4 text-white">
          <span className="text-xs text-[#a8a8a8]">综合分</span>
          <strong className="mt-2 block text-5xl font-semibold leading-none">{Math.round(overall)}</strong>
        </div>
        <div className="bg-white p-4">
          <AguiHeader title={data?.title || "评分卡"} description={data?.summary} />
        </div>
      </div>
      <div className="grid gap-3 p-4">
        {dimensions.map((dimension: any) => {
          const max = Number(dimension.max) || 10;
          const percent = Math.max(0, Math.min(100, (Number(dimension.score) / max) * 100));
          return (
            <div key={dimension.label} className="grid gap-1.5">
              <span className="flex items-center justify-between gap-3 text-sm text-[#171717]">
                <strong>{dimension.label}</strong>
                <em className="text-[#666666]">
                  {dimension.score}/{max}
                </em>
              </span>
              <div className="h-2 overflow-hidden rounded-full bg-[#f2f2f2]">
                <i className="block h-full rounded-full bg-[#171717]" style={{ width: `${percent}%` }} />
              </div>
              {dimension.note ? <small className="text-xs leading-5 text-[#666666]">{dimension.note}</small> : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function DataTableTool({ data }: { data: unknown }) {
  const tableData = isRecord(data) ? data : {};
  const columns = Array.isArray(tableData.columns)
    ? tableData.columns.filter(isDataTableColumn)
    : [];
  const rows = Array.isArray(tableData.rows)
    ? tableData.rows.filter(isRecord)
    : [];

  return (
    <Card className="overflow-hidden border-[#eaeaea] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.02),0_8px_16px_-8px_rgba(0,0,0,0.06)]">
      <div className="p-4">
        <AguiHeader
          title={getOptionalString(tableData.title) || "数据表"}
          description={getOptionalString(tableData.description)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-t border-[#eaeaea] text-sm">
          <thead className="bg-[#fafafa]">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="border-b border-[#eaeaea] px-3 py-2 text-left font-semibold text-[#171717]">
                  {column.label || column.key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="odd:bg-[#fafafa]">
                {columns.map((column) => (
                  <td key={column.key} className="border-b border-[#eaeaea] px-3 py-2 text-[#666666]">
                    {String(row?.[column.key] ?? "-")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function FrameworkTool({ data }: { data: unknown }) {
  const frameworkData = isRecord(data) ? data : {};
  const nodes = Array.isArray(frameworkData.nodes)
    ? frameworkData.nodes.filter(isFrameworkNode)
    : [];

  return (
    <Card className="overflow-hidden border-[#eaeaea] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.02),0_8px_16px_-8px_rgba(0,0,0,0.06)]">
      <div className="border-b border-[#eaeaea] bg-[#fafafa] p-4">
        <AguiHeader
          title={getOptionalString(frameworkData.title) || "诊断框架"}
          description={getOptionalString(frameworkData.description)}
        />
      </div>
      <div className="grid gap-3 p-3 md:grid-cols-2">
        {nodes.map((node, index) => (
          <article key={`${node.title}-${index}`} className="rounded-lg border border-[#eaeaea] bg-[#fafafa] p-4">
            <div className="flex items-start justify-between gap-3">
              <strong className="text-sm font-semibold text-[#171717]">{node.title}</strong>
              {node.status ? <span className="rounded-full border border-[#eaeaea] bg-white px-2 py-0.5 text-xs text-[#666666]">{node.status}</span> : null}
            </div>
            {node.description ? <p className="mt-2 text-sm leading-6 text-[#666666]">{node.description}</p> : null}
            {node.items?.length ? (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#666666]">
                {node.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </Card>
  );
}

export function GenericTool({ part, toolName }: { part: ToolPartShape; toolName: string }) {
  return (
    <Card className="border-[#eaeaea] bg-white p-4 shadow-[0_2px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <strong className="text-sm font-semibold text-[#171717]">{toolName}</strong>
        <span className="text-xs text-[#666666]">{part.state === "output-available" ? "已完成" : "处理中"}</span>
      </div>
      {part.output ? (
        <LazyRawJson data={part.output} />
      ) : null}
    </Card>
  );
}

function LazyRawJson({ data }: { data: unknown }) {
  const [isOpen, setIsOpen] = useState(false);
  const rawJson = useMemo(() => {
    if (!isOpen) return "";
    return JSON.stringify(data, null, 2);
  }, [data, isOpen]);

  return (
    <details
      className="mt-3 rounded-lg border border-[#eaeaea] bg-[#fafafa] px-3 py-2"
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary className="cursor-pointer text-xs font-medium text-[#666666]">查看原始返回</summary>
      {isOpen ? <pre className="mt-3 max-h-72 overflow-auto rounded-md bg-white p-3 text-xs leading-5 text-[#4d4d4d]">{rawJson}</pre> : null}
    </details>
  );
}

function AguiHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <strong className="block text-sm font-semibold text-[#171717]">{title}</strong>
      {description ? <p className="mt-1 text-sm leading-6 text-[#666666]">{description}</p> : null}
    </div>
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isDataTableColumn(value: unknown): value is DataTableColumn {
  return isRecord(value) && typeof value.key === "string";
}

function isFrameworkNode(value: unknown): value is FrameworkNode {
  return (
    isRecord(value) &&
    typeof value.title === "string" &&
    (value.items === undefined || (Array.isArray(value.items) && value.items.every((item) => typeof item === "string")))
  );
}

function getOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}
