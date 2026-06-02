"use client";

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
    <Card className="mt-3 border-border/70 bg-background/80 p-4">
      <AguiHeader title={data?.title || "方案对比"} />
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {options.map((option: any) => (
          <article key={option.name} className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <h4 className="text-sm font-semibold">{option.name}</h4>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{option.summary}</p>
            {criteria.length ? (
              <div className="mt-3 grid gap-1.5 text-sm">
                {criteria.map((criterion: string) => (
                  <span key={criterion} className="flex items-center justify-between gap-3">
                    <b>{criterion}</b>
                    <em>{option.scores?.[criterion] ?? "-"}</em>
                  </span>
                ))}
              </div>
            ) : null}
            {option.recommendation ? <strong>{option.recommendation}</strong> : null}
          </article>
        ))}
      </div>
    </Card>
  );
}

export function ChecklistTool({ data }: { data: any }) {
  const items = Array.isArray(data?.items) ? data.items : [];
  return (
    <Card className="mt-3 border-border/70 bg-background/80 p-4">
      <AguiHeader title={data?.title || "行动清单"} description={data?.description} />
      <div className="mt-4 grid gap-2">
        {items.map((item: any, index: number) => (
          <label
            key={`${item.label}-${index}`}
            className={cn("flex items-start gap-3 rounded-lg border border-border bg-background p-3", item.priority === "high" && "border-destructive/40")}
          >
            <Checkbox />
            <span className="text-left">
              <strong className="block text-sm font-semibold">{item.label}</strong>
              {item.detail ? <small className="mt-1 block text-xs text-muted-foreground">{item.detail}</small> : null}
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
    <Card className="mt-3 border-border/70 bg-background/80 p-4">
      <AguiHeader title={data?.title || "时间线"} description={data?.description} />
      <div className="mt-4 grid gap-3">
        {steps.map((step: any, index: number) => (
          <article key={`${step.title}-${index}`} className="grid grid-cols-[92px_minmax(0,1fr)] gap-3">
            <span className="text-sm font-semibold text-primary">{step.time || `Step ${index + 1}`}</span>
            <div>
              <strong className="block text-sm font-semibold">{step.title}</strong>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.detail}</p>
              {step.owner ? <small className="mt-1 block text-xs text-muted-foreground">{step.owner}</small> : null}
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
    <Card className="mt-3 border-border/70 bg-background/80 p-4">
      <AguiHeader title={data?.title || "评分卡"} description={data?.summary} />
      <div className="mt-3 flex items-end gap-2">
        <strong className="text-4xl font-semibold">{Math.round(overall)}</strong>
        <span className="pb-1 text-sm text-muted-foreground">综合分</span>
      </div>
      <div className="mt-4 grid gap-3">
        {dimensions.map((dimension: any) => {
          const max = Number(dimension.max) || 10;
          const percent = Math.max(0, Math.min(100, (Number(dimension.score) / max) * 100));
          return (
            <div key={dimension.label} className="grid gap-1.5">
              <span className="flex items-center justify-between gap-3 text-sm">
                <strong>{dimension.label}</strong>
                <em>
                  {dimension.score}/{max}
                </em>
              </span>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <i className="block h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
              </div>
              {dimension.note ? <small className="text-xs text-muted-foreground">{dimension.note}</small> : null}
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
    <Card className="mt-3 overflow-hidden border-border/70 bg-background/80">
      <div className="p-4">
        <AguiHeader
          title={getOptionalString(tableData.title) || "数据表"}
          description={getOptionalString(tableData.description)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-t border-border text-sm">
          <thead className="bg-muted/70">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="border-b border-border px-3 py-2 text-left font-semibold">
                  {column.label || column.key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="odd:bg-card/50">
                {columns.map((column) => (
                  <td key={column.key} className="border-b border-border px-3 py-2 text-muted-foreground">
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
    <Card className="mt-3 border-border/70 bg-background/80 p-4">
      <AguiHeader
        title={getOptionalString(frameworkData.title) || "诊断框架"}
        description={getOptionalString(frameworkData.description)}
      />
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {nodes.map((node, index) => (
          <article key={`${node.title}-${index}`} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <strong className="text-sm font-semibold">{node.title}</strong>
              {node.status ? <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{node.status}</span> : null}
            </div>
            {node.description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{node.description}</p> : null}
            {node.items?.length ? (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
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
    <Card className="mt-3 border-border/70 bg-background/80 p-4">
      <div className="flex items-center justify-between gap-3">
        <strong className="text-sm font-semibold">{toolName}</strong>
        <span className="text-xs text-muted-foreground">{part.state === "output-available" ? "已完成" : "处理中"}</span>
      </div>
      {part.output ? <pre className="mt-3 overflow-auto rounded-md bg-muted p-3 text-xs">{JSON.stringify(part.output, null, 2)}</pre> : null}
    </Card>
  );
}

function AguiHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <strong className="block text-sm font-semibold">{title}</strong>
      {description ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p> : null}
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
