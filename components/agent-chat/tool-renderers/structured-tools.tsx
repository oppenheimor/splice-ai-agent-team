"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, CircleDot, GitBranch, Target } from "lucide-react";
import type { ToolPartShape } from "../MessagePartsRenderer";
import { AguiEmptyState, AguiNotice, AguiToolCard, MetricToneBadge } from "./agui-ui";
import { cn } from "@/lib/utils";

type DataTableColumn = {
  key: string;
  label?: string;
  align?: "left" | "right" | "center";
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
  const recommendedIndex = getRecommendedIndex(options);

  return (
    <AguiToolCard title={data?.title || "方案对比"} description={data?.description || "用于在多个方向之间做取舍，重点看收益、复杂度、风险和下一步。"} label="决策对比" status={options.length ? "success" : "empty"} statusText={options.length ? `${options.length} 个方案` : undefined} bodyClassName="p-0">
      {!options.length ? (
        <div className="p-4">
          <AguiEmptyState title="暂无对比方案" description="工具需要至少两个 options 才能形成有效对比。" />
        </div>
      ) : (
        <div className="overflow-x-auto overscroll-x-contain">
          <table className="w-max min-w-[720px] table-fixed border-t border-[#eaeaea] text-sm">
            <caption className="sr-only">方案对比矩阵</caption>
            <thead className="bg-[#fafafa]">
              <tr>
                <th className="w-[148px] border-b border-[#eaeaea] px-4 py-3 text-left font-semibold text-[#171717]">判断维度</th>
                {options.map((option: any, index: number) => (
                  <th key={`${option.name}-${index}`} className={cn("w-[190px] border-b border-[#eaeaea] px-4 py-3 text-left align-top", index === recommendedIndex && "bg-white")}>
                    <div className="flex flex-wrap items-center gap-2">
                      {index === recommendedIndex ? <MetricToneBadge tone="good">推荐优先</MetricToneBadge> : <MetricToneBadge>备选</MetricToneBadge>}
                    </div>
                    <strong className="mt-2 block whitespace-normal break-words text-sm font-semibold leading-5 text-[#171717]">{option.name || `方案 ${index + 1}`}</strong>
                    <p className="mt-1 whitespace-normal break-words text-xs font-normal leading-5 text-[#666666]">{option.summary}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {criteria.map((criterion: string) => (
                <tr key={criterion} className="odd:bg-[#fcfcfc]">
                  <th className="border-b border-[#eaeaea] px-4 py-3 text-left font-medium text-[#4d4d4d]">{criterion}</th>
                  {options.map((option: any, index: number) => (
                    <td key={`${option.name}-${criterion}-${index}`} className={cn("whitespace-normal break-words border-b border-[#eaeaea] px-4 py-3 text-[#171717]", index === recommendedIndex && "bg-white")}>
                      {option.scores?.[criterion] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <th className="border-b border-[#eaeaea] px-4 py-3 text-left font-medium text-[#4d4d4d]">取舍判断</th>
                {options.map((option: any, index: number) => (
                  <td key={`${option.name}-recommendation-${index}`} className={cn("whitespace-normal break-words border-b border-[#eaeaea] px-4 py-3 text-sm leading-6 text-[#171717]", index === recommendedIndex && "bg-[#f8fff8]")}>
                    {option.recommendation || "暂无判断"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <p className="sticky left-0 px-3 py-2 text-xs text-[#8f8f8f] sm:hidden">左右滑动查看完整对比。</p>
        </div>
      )}
    </AguiToolCard>
  );
}

export function ChecklistTool({ data }: { data: any }) {
  const items = Array.isArray(data?.items) ? data.items : [];
  const highPriorityCount = items.filter((item: any) => item.priority === "high").length;
  return (
    <AguiToolCard title={data?.title || "行动清单"} description={data?.description || "这是只读执行建议，不会自动保存任务状态。"} label="行动核查" status={items.length ? "success" : "empty"} statusText={items.length ? `${items.length} 项 · ${highPriorityCount} 个高优先级` : undefined} bodyClassName="p-0">
      {!items.length ? (
        <div className="p-4">
          <AguiEmptyState title="暂无清单项" description="工具需要 items 数组才能展示执行清单。" />
        </div>
      ) : (
        <div className="divide-y divide-[#eaeaea]">
          <div className="grid gap-2 bg-[#fafafa] px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <p className="text-sm leading-6 text-[#4d4d4d]">按优先级与执行顺序整理，适合转入下一轮行动排期。</p>
            <span className="text-xs font-medium text-[#8f8f8f]">只读建议</span>
          </div>
          {items.map((item: any, index: number) => (
            <article key={`${item.label}-${index}`} className={cn("grid grid-cols-[52px_minmax(0,1fr)] gap-3 bg-white px-4 py-3", item.priority === "high" && "bg-[#fffafa]")}>
              <span className={cn("grid h-9 w-9 place-items-center rounded-md border text-xs font-semibold tabular-nums", item.priority === "high" ? "border-[#ffd7d6] bg-[#ffeeef] text-[#d8001b]" : "border-[#eaeaea] bg-[#fafafa] text-[#171717]")}>
                {index + 1}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <strong className="text-sm font-semibold text-[#171717]">{item.label}</strong>
                  <PriorityBadge priority={item.priority} />
                </div>
                {item.detail ? <p className="mt-1 text-xs leading-5 text-[#666666]">{item.detail}</p> : null}
                {item.owner || item.due ? (
                  <p className="mt-2 text-xs text-[#8f8f8f]">
                    {item.owner ? `负责人：${item.owner}` : null}
                    {item.owner && item.due ? " · " : null}
                    {item.due ? `截止：${item.due}` : null}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </AguiToolCard>
  );
}

export function TimelineTool({ data }: { data: any }) {
  const steps = Array.isArray(data?.steps) ? data.steps : [];
  return (
    <AguiToolCard title={data?.title || "时间线"} description={data?.description || "用于表达阶段、节奏、责任人和依赖关系。"} label="时间轴" status={steps.length ? "success" : "empty"} statusText={steps.length ? `${steps.length} 节点` : undefined} bodyClassName="p-0">
      {!steps.length ? (
        <div className="p-4">
          <AguiEmptyState title="暂无路线步骤" description="工具需要 steps 数组才能展示时间线。" />
        </div>
      ) : (
        <div className="relative overflow-hidden px-3 py-5 sm:px-4 sm:py-6">
          <div className="absolute bottom-5 left-5 top-5 w-px bg-[#d9d9d9] sm:left-6 sm:bottom-6 sm:top-6 md:left-1/2" aria-hidden="true" />
          {steps.map((step: any, index: number) => (
            <article key={`${step.title}-${index}`} className={cn("relative grid gap-3 pb-10 last:pb-0 md:grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)]", index % 2 === 0 ? "md:[&_.timeline-card]:col-start-3 md:[&_.timeline-date]:col-start-1 md:[&_.timeline-date]:justify-self-end" : "md:[&_.timeline-card]:col-start-1 md:[&_.timeline-card]:row-start-1 md:[&_.timeline-card]:text-right md:[&_.timeline-date]:col-start-3 md:[&_.timeline-date]:row-start-1")}>
              <div className="timeline-date ml-8 sm:ml-10 md:ml-0">
                <span className={cn("inline-flex rounded-md px-2.5 py-1 text-xs font-semibold shadow-[0_1px_1px_rgba(0,0,0,0.04)]", index === 0 ? "bg-[#171717] text-white" : "bg-[#e5e5e5] text-[#4d4d4d]")}>
                  {step.time || `Step ${index + 1}`}
                </span>
              </div>
              <div className={cn("timeline-card ml-8 rounded-lg border border-[#e1e1e1] bg-white p-3 shadow-[0_1px_1px_rgba(0,0,0,0.02),0_12px_20px_-16px_rgba(0,0,0,0.18)] sm:ml-10 sm:p-4 md:ml-0", index % 2 !== 0 && "md:text-right")}>
                <strong className="block text-base font-semibold leading-6 text-[#171717]">{step.title}</strong>
                <p className="mt-2 text-sm leading-6 text-[#666666]">{step.detail}</p>
                <div className={cn("mt-3 flex flex-wrap gap-2", index % 2 !== 0 && "md:justify-end")}>
                  {step.owner ? <MetricToneBadge>负责人：{step.owner}</MetricToneBadge> : null}
                  {step.risk ? <MetricToneBadge tone="warn">风险：{step.risk}</MetricToneBadge> : null}
                </div>
              </div>
              <span className="absolute left-[10px] top-1 z-10 grid h-5 w-5 place-items-center rounded-full border border-[#d9d9d9] bg-[#f2f2f2] sm:left-[16px] md:left-1/2 md:-ml-2.5">
                <span className={cn("h-2.5 w-2.5 rounded-full", index === 0 ? "bg-[#171717]" : "bg-[#737373]")} />
              </span>
            </article>
          ))}
        </div>
      )}
    </AguiToolCard>
  );
}

export function ScorecardTool({ data }: { data: any }) {
  const dimensions = Array.isArray(data?.dimensions) ? data.dimensions : [];
  const overall = typeof data?.overall === "number" ? data.overall : 0;
  const verdict = getScoreVerdict(overall);

  return (
    <AguiToolCard title={data?.title || "评分卡"} description={data?.summary || "用于判断优先级、风险和是否进入试点。"} label="评分门禁" status={dimensions.length ? "success" : "empty"} statusText={dimensions.length ? verdict : undefined} bodyClassName="p-0">
      {!dimensions.length ? (
        <div className="p-4">
          <AguiEmptyState title="暂无评分维度" description="工具需要 dimensions 数组才能计算评分卡。" />
        </div>
      ) : (
        <>
          <div className="grid gap-px bg-[#eaeaea] md:grid-cols-[220px_minmax(0,1fr)]">
            <div className="bg-[#171717] p-5 text-white">
              <span className="text-xs text-[#a8a8a8]">综合门禁分</span>
              <div className="mt-3 flex items-end gap-1">
                <strong className="block text-6xl font-semibold leading-none tabular-nums">{Math.round(overall)}</strong>
                <span className="pb-1 text-sm text-[#a8a8a8]">/100</span>
              </div>
              <span className="mt-3 inline-flex text-xs font-medium text-[#d9d9d9]">{verdict}</span>
              <div className="mt-5 grid grid-cols-3 gap-1 text-[10px] text-[#a8a8a8]">
                <span>暂缓</span>
                <span className="text-center">验证</span>
                <span className="text-right text-white">试点</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#343434]">
                <i className="block h-full rounded-full bg-white" style={{ width: `${Math.max(0, Math.min(100, overall))}%` }} />
              </div>
            </div>
            <div className="bg-white p-4">
              <AguiNotice tone={overall >= 75 ? "success" : overall >= 55 ? "warning" : "error"}>{getScoreAdvice(overall)}</AguiNotice>
              <div className="mt-3 grid grid-cols-3 divide-x divide-[#eaeaea] rounded-lg border border-[#eaeaea] bg-[#fafafa] text-center">
                <Threshold label="≥75" value="可试点" active={overall >= 75} />
                <Threshold label="55-74" value="先验证" active={overall >= 55 && overall < 75} />
                <Threshold label="<55" value="暂缓" active={overall < 55} />
              </div>
            </div>
          </div>
          <div className="divide-y divide-[#eaeaea]">
            {dimensions.map((dimension: any) => {
              const max = Number(dimension.max) || 10;
              const percent = Math.max(0, Math.min(100, (Number(dimension.score) / max) * 100));
              return (
                <div key={dimension.label} className="grid gap-3 px-4 py-3 sm:grid-cols-[160px_minmax(0,1fr)_56px] sm:items-center">
                  <strong className="text-sm text-[#171717]">{dimension.label}</strong>
                  <div className="min-w-0">
                    <div className="h-2 overflow-hidden rounded-full bg-[#f2f2f2]">
                      <i className={cn("block h-full rounded-full", percent >= 75 ? "bg-[#107d32]" : percent >= 55 ? "bg-[#aa4d00]" : "bg-[#d8001b]")} style={{ width: `${percent}%` }} />
                    </div>
                    {dimension.note ? <small className="mt-1 block text-xs leading-5 text-[#666666]">{dimension.note}</small> : null}
                    {dimension.nextStep ? <small className="mt-1 block text-xs leading-5 text-[#107d32]">提升动作：{dimension.nextStep}</small> : null}
                  </div>
                  <em className="text-right text-sm font-semibold tabular-nums text-[#171717]">{dimension.score}/{max}</em>
                </div>
              );
            })}
          </div>
        </>
      )}
    </AguiToolCard>
  );
}

export function DataTableTool({ data }: { data: unknown }) {
  const tableData = isRecord(data) ? data : {};
  const columns = Array.isArray(tableData.columns) ? tableData.columns.filter(isDataTableColumn) : [];
  const rows = Array.isArray(tableData.rows) ? tableData.rows.filter(isRecord) : [];

  return (
    <AguiToolCard title={getOptionalString(tableData.title) || "数据表"} description={getOptionalString(tableData.description) || "用于承载高密度结构化信息，移动端可横向滑动。"} label="数据表" status={rows.length ? "success" : "empty"} statusText={rows.length ? `${rows.length} 行` : undefined} bodyClassName="p-0">
      {!columns.length || !rows.length ? (
        <div className="p-4">
          <AguiEmptyState title="暂无表格数据" description="工具需要 columns 和 rows 才能展示表格。" />
        </div>
      ) : (
        <div className="overflow-x-auto overscroll-x-contain">
          <table className="w-max min-w-[640px] table-fixed border-t border-[#eaeaea] text-sm">
            <caption className="sr-only">{getOptionalString(tableData.title) || "数据表"}</caption>
            <thead className="bg-[#fafafa]">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className={cn("w-[160px] border-b border-[#eaeaea] px-3 py-2 font-semibold text-[#171717]", getAlignClass(column.align || inferColumnAlign(rows, column.key), true))}>
                    {column.label || column.key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="odd:bg-[#fafafa]">
                  {columns.map((column) => (
                    <td key={column.key} className={cn("border-b border-[#eaeaea] px-3 py-2 text-[#666666]", getAlignClass(column.align || inferColumnAlign(rows, column.key)))}>
                      <span className="line-clamp-2">{String(row?.[column.key] ?? "-")}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="sticky left-0 px-3 py-2 text-xs text-[#8f8f8f] sm:hidden">左右滑动查看更多列。</p>
        </div>
      )}
    </AguiToolCard>
  );
}

export function FrameworkTool({ data }: { data: unknown }) {
  const frameworkData = isRecord(data) ? data : {};
  const nodes = Array.isArray(frameworkData.nodes) ? frameworkData.nodes.filter(isFrameworkNode) : [];

  return (
    <AguiToolCard title={getOptionalString(frameworkData.title) || "诊断框架"} description={getOptionalString(frameworkData.description) || "用于把复杂判断拆成阶段、节点和行动条件。"} label="诊断框架" status={nodes.length ? "success" : "empty"} statusText={nodes.length ? `${nodes.length} 个节点` : undefined} bodyClassName="p-3">
      {!nodes.length ? (
        <AguiEmptyState title="暂无框架节点" description="工具需要 nodes 数组才能展示诊断框架。" />
      ) : (
        <div className="overflow-hidden rounded-lg border border-[#eaeaea] bg-white">
          {nodes.map((node, index) => (
            <article key={`${node.title}-${index}`} className="grid gap-0 border-b border-[#eaeaea] last:border-b-0 md:grid-cols-[120px_minmax(0,1fr)]">
              <div className="relative bg-[#fafafa] px-4 py-4">
                <div className="absolute bottom-0 left-9 top-11 hidden w-px bg-[#d9d9d9] md:block" aria-hidden="true" />
                <span className="relative z-10 grid h-10 w-10 place-items-center rounded-full border border-[#171717] bg-white text-sm font-semibold tabular-nums text-[#171717]">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {index === 0 ? <Target className="h-4 w-4 text-[#171717]" /> : index === nodes.length - 1 ? <GitBranch className="h-4 w-4 text-[#171717]" /> : <CircleDot className="h-4 w-4 text-[#171717]" />}
                    <strong className="text-sm font-semibold text-[#171717]">{node.title}</strong>
                  </div>
                  {node.status ? <MetricToneBadge>{node.status}</MetricToneBadge> : null}
                </div>
                {node.description ? <p className="mt-2 text-sm leading-6 text-[#666666]">{node.description}</p> : null}
                {node.items?.length ? (
                  <ul className="mt-3 grid gap-1 text-sm text-[#666666]">
                    {node.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-[#107d32]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </AguiToolCard>
  );
}

export function GenericTool({ part, toolName }: { part: ToolPartShape; toolName: string }) {
  return (
    <AguiToolCard title={toolName} description="当前工具尚未配置专属渲染器，已降级为原始结果查看。" label="通用工具" status={part.state === "output-available" ? "warning" : "loading"}>
      {part.output ? <LazyRawJson data={part.output} /> : <AguiNotice tone="warning">工具还在处理中，暂无结构化结果。</AguiNotice>}
    </AguiToolCard>
  );
}

function Threshold({ label, value, active }: { label: string; value: string; active: boolean }) {
  return (
    <div className={cn("px-2 py-2", active && "bg-[#171717] text-white")}>
      <strong className="block text-xs font-semibold">{label}</strong>
      <span className={cn("mt-0.5 block text-xs", active ? "text-[#d9d9d9]" : "text-[#666666]")}>{value}</span>
    </div>
  );
}

function PriorityBadge({ priority }: { priority?: string }) {
  if (priority === "high") return <MetricToneBadge tone="danger">高优先级</MetricToneBadge>;
  if (priority === "medium") return <MetricToneBadge tone="warn">中优先级</MetricToneBadge>;
  if (priority === "low") return <MetricToneBadge>低优先级</MetricToneBadge>;
  return null;
}

function LazyRawJson({ data }: { data: unknown }) {
  const [isOpen, setIsOpen] = useState(false);
  const rawJson = useMemo(() => (isOpen ? JSON.stringify(data, null, 2) : ""), [data, isOpen]);

  return (
    <details className="rounded-lg border border-[#eaeaea] bg-[#fafafa] px-3 py-2" onToggle={(event) => setIsOpen(event.currentTarget.open)}>
      <summary className="cursor-pointer text-xs font-medium text-[#666666]">查看原始返回</summary>
      {isOpen ? <pre className="mt-3 max-h-72 overflow-auto rounded-md bg-white p-3 text-xs leading-5 text-[#4d4d4d]">{rawJson}</pre> : null}
    </details>
  );
}

function getRecommendedIndex(options: any[]): number {
  const explicit = options.findIndex((option) => /推荐|优先|首选/.test(String(option.recommendation || option.badge || option.summary || "")));
  return explicit >= 0 ? explicit : 0;
}

function getScoreVerdict(score: number): string {
  if (score >= 85) return "强烈建议推进";
  if (score >= 75) return "建议试点";
  if (score >= 55) return "谨慎验证";
  return "暂缓推进";
}

function getScoreAdvice(score: number): string {
  if (score >= 75) return "当前分数已达到试点门槛，建议先做小闭环验证，不直接扩成大项目。";
  if (score >= 55) return "当前分数还需要补数据、责任人或风险兜底，再进入试点更稳。";
  return "当前不建议直接投入实施，先确认真实业务闭环和约束条件。";
}

function inferColumnAlign(rows: Record<string, unknown>[], key: string): "left" | "right" {
  return rows.some((row) => typeof row[key] === "number") ? "right" : "left";
}

function getAlignClass(align: "left" | "right" | "center", isHeader = false) {
  if (align === "right") return isHeader ? "text-right" : "text-right tabular-nums";
  if (align === "center") return "text-center";
  return "text-left";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isDataTableColumn(value: unknown): value is DataTableColumn {
  return isRecord(value) && typeof value.key === "string";
}

function isFrameworkNode(value: unknown): value is FrameworkNode {
  return isRecord(value) && typeof value.title === "string";
}

function getOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}
