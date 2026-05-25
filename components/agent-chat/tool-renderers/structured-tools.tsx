"use client";

import type { ToolPartShape } from "../MessagePartsRenderer";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

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
