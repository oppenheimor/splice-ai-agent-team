"use client";

import { AguiEmptyState, AguiToolCard, MetricToneBadge, ReadOnlyAction } from "./agui-ui";
import { cn } from "@/lib/utils";

type CardGroupVariant = "recommendation" | "comparison" | "insight" | "task" | "resource";
type CardGroupDensity = "compact" | "normal" | "detailed";
type CardGroupEmphasis = "none" | "first" | "scored" | "selected";
type CardGroupLayout = "grid" | "list" | "matrix" | "compact" | "comparison" | "product" | "plan";
type MetricsDisplay = "pills" | "rows" | "bars" | "table";

type AguiCardMetric = {
  label?: string;
  value?: string | number;
  tone?: "neutral" | "good" | "warn" | "danger";
  direction?: "higher" | "lower";
};

type AguiCardItem = {
  title?: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  price?: string;
  owner?: string;
  due?: string;
  recommendation?: string;
  risk?: string;
  nextStep?: string;
  metrics?: AguiCardMetric[];
  bullets?: string[];
  actions?: Array<{ label?: string; value?: string }>;
};

export function CardsTool({ data }: { data: any }) {
  const cards = Array.isArray(data?.cards) ? (data.cards as AguiCardItem[]) : [];
  const variant = resolveCardGroupVariant(data, cards);
  const density = resolveCardGroupDensity(data, variant);
  const emphasis = resolveCardGroupEmphasis(data, variant);
  const layout = resolveCardGroupLayout(data, variant);
  const metricsDisplay = resolveMetricsDisplay(data, variant, layout);
  const status = cards.length ? "success" : "empty";

  return (
    <AguiToolCard
      title={data?.title || "推荐方案"}
      description={data?.description || getCardPurpose(variant)}
      label={getCardLabel(variant)}
      status={status}
      statusText={cards.length ? `${cards.length} 项` : undefined}
      bodyClassName={layout === "matrix" ? "p-0" : "p-3"}
    >
      {!cards.length ? (
        <AguiEmptyState title="暂无可展示方案" description="当前工具没有收到 cards 数据，建议回退为文字摘要或重新生成结构化结果。" />
      ) : layout === "matrix" ? (
        <CardMatrix cards={cards} metricsDisplay={metricsDisplay} />
      ) : variant === "insight" ? (
        <InsightStack cards={cards} />
      ) : variant === "task" ? (
        <TaskPlan cards={cards} metricsDisplay={metricsDisplay} />
      ) : variant === "resource" ? (
        <ResourceShelf cards={cards} />
      ) : (
        <div
          className={cn(
            "grid gap-3",
            layout === "grid" && "md:grid-cols-2",
            layout === "compact" && "md:grid-cols-2",
            layout === "list" && "grid-cols-1",
            layout === "product" && "md:grid-cols-2",
            layout === "plan" && "md:grid-cols-2",
            variant === "comparison" && layout !== "grid" && "grid-cols-1",
          )}
        >
          {cards.map((card, index) => (
            <CardGroupItem
              key={`${card.title}-${index}`}
              card={card}
              index={index}
              variant={variant}
              density={density}
              emphasis={emphasis}
              metricsDisplay={metricsDisplay}
            />
          ))}
        </div>
      )}
    </AguiToolCard>
  );
}

function InsightStack({ cards }: { cards: AguiCardItem[] }) {
  return (
    <div className="divide-y divide-[#d6e7ff] overflow-hidden rounded-lg border border-[#d6e7ff] bg-[#f8fbff]">
      {cards.map((card, index) => (
        <article key={`${card.title}-${index}`} className="grid gap-3 bg-white/70 px-4 py-4 sm:grid-cols-[44px_minmax(0,1fr)]">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#0059ec] text-xs font-semibold tabular-nums text-white">
            I{index + 1}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {card.badge ? <MetricToneBadge tone="good">{card.badge}</MetricToneBadge> : null}
              {card.subtitle ? <span className="text-xs font-medium text-[#0059ec]">{card.subtitle}</span> : null}
            </div>
            <strong className="mt-2 block text-base font-semibold leading-6 text-[#171717]">{card.title || `洞察 ${index + 1}`}</strong>
            {card.description ? <p className="mt-2 rounded-md bg-[#f8fbff] px-3 py-2 text-sm leading-6 text-[#4d4d4d]">{card.description}</p> : null}
            {card.recommendation || card.risk ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {card.recommendation ? <DecisionLine label="判断" value={card.recommendation} /> : null}
                {card.risk ? <DecisionLine label="证据缺口" value={card.risk} tone="warning" /> : null}
              </div>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

function TaskPlan({ cards, metricsDisplay }: { cards: AguiCardItem[]; metricsDisplay: MetricsDisplay }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#eaeaea] bg-white">
      {cards.map((card, index) => (
        <article key={`${card.title}-${index}`} className="grid gap-0 border-b border-[#eaeaea] last:border-b-0 md:grid-cols-[88px_minmax(0,1fr)]">
          <div className="bg-[#fafafa] px-4 py-4">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-[#171717] bg-white text-xs font-semibold tabular-nums text-[#171717]">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <strong className="text-sm font-semibold text-[#171717]">{card.title || `任务 ${index + 1}`}</strong>
                {card.description ? <p className="mt-1 text-sm leading-6 text-[#666666]">{card.description}</p> : null}
              </div>
              {card.badge ? <MetricToneBadge tone={index === 0 ? "good" : "neutral"}>{card.badge}</MetricToneBadge> : null}
            </div>
            {card.owner || card.due || card.price ? (
              <p className="mt-2 text-xs text-[#8f8f8f]">
                {card.owner ? `负责人：${card.owner}` : null}
                {card.owner && (card.due || card.price) ? " · " : null}
                {card.due ? `截止：${card.due}` : card.price}
              </p>
            ) : null}
            {card.nextStep ? <DecisionLine label="交付口径" value={card.nextStep} tone="success" /> : null}
            {Array.isArray(card.metrics) && card.metrics.length ? <MetricsBlock metrics={card.metrics} display={metricsDisplay} /> : null}
          </div>
        </article>
      ))}
    </div>
  );
}

function ResourceShelf({ cards }: { cards: AguiCardItem[] }) {
  return (
    <div className="grid gap-px overflow-hidden rounded-lg border border-[#eaeaea] bg-[#eaeaea]">
      {cards.map((card, index) => (
        <article key={`${card.title}-${index}`} className="grid gap-3 bg-white p-4 md:grid-cols-[minmax(0,1fr)_180px] md:items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold tabular-nums text-[#8f8f8f]">R{index + 1}</span>
              {card.badge ? <MetricToneBadge>{card.badge}</MetricToneBadge> : null}
            </div>
            <strong className="mt-2 block text-sm font-semibold text-[#171717]">{card.title || `资源 ${index + 1}`}</strong>
            {card.description ? <p className="mt-1 text-sm leading-6 text-[#666666]">{card.description}</p> : null}
            {card.risk ? <p className="mt-2 text-xs leading-5 text-[#8a5a00]">使用限制：{card.risk}</p> : null}
          </div>
          <div className="rounded-md border border-[#eaeaea] bg-[#fafafa] px-3 py-2">
            <span className="block text-xs text-[#8f8f8f]">资源投入</span>
            <strong className="mt-1 block text-sm font-semibold text-[#171717]">{card.price || card.nextStep || "按需调用"}</strong>
          </div>
        </article>
      ))}
    </div>
  );
}

function CardGroupItem({
  card,
  index,
  variant,
  density,
  emphasis,
  metricsDisplay,
}: {
  card: AguiCardItem;
  index: number;
  variant: CardGroupVariant;
  density: CardGroupDensity;
  emphasis: CardGroupEmphasis;
  metricsDisplay: MetricsDisplay;
}) {
  const isRecommendation = variant === "recommendation" || variant === "task";
  const isCompact = density === "compact";
  const isEmphasized = shouldEmphasizeCard(card, index, emphasis);

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-lg border bg-white shadow-[0_1px_1px_rgba(0,0,0,0.02)] transition-[border-color,background-color,box-shadow] duration-150 hover:border-[#c9c9c9]",
        isRecommendation ? "p-4 hover:shadow-[0_8px_16px_-8px_rgba(0,0,0,0.08)]" : "p-3",
        isEmphasized ? "border-[#171717]" : "border-[#eaeaea]",
        variant === "comparison" && "bg-[#fcfcfc]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {card.badge ? <MetricToneBadge tone={isEmphasized ? "good" : "neutral"}>{card.badge}</MetricToneBadge> : null}
            {isRecommendation && isEmphasized ? <MetricToneBadge tone="good">首选</MetricToneBadge> : null}
          </div>
          <h4 className={cn("font-semibold text-[#171717]", isCompact ? "mt-1 text-sm leading-5" : "mt-2 text-base leading-6")}>
            {card.title || `方案 ${index + 1}`}
          </h4>
          {card.subtitle ? <small className="mt-1 block text-sm leading-5 text-[#666666]">{card.subtitle}</small> : null}
        </div>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-[#eaeaea] bg-[#fafafa] text-xs font-semibold tabular-nums text-[#4d4d4d]">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {card.description ? <p className={cn("text-[#4d4d4d]", isCompact ? "mt-2 text-sm leading-5" : "mt-3 text-sm leading-6")}>{card.description}</p> : null}

      {card.recommendation || card.risk || card.nextStep ? (
        <div className="mt-3 grid gap-2">
          {card.recommendation ? <DecisionLine label="推荐理由" value={card.recommendation} /> : null}
          {card.risk ? <DecisionLine label="主要风险" value={card.risk} tone="warning" /> : null}
          {card.nextStep ? <DecisionLine label="下一步" value={card.nextStep} tone="success" /> : null}
        </div>
      ) : null}

      {card.price ? (
        <div className="mt-3 rounded-md border border-[#eaeaea] bg-[#fafafa] px-3 py-2">
          <span className="block text-xs text-[#8f8f8f]">投入估算</span>
          <strong className="mt-1 block text-sm font-semibold text-[#171717]">{card.price}</strong>
        </div>
      ) : null}

      {Array.isArray(card.metrics) && card.metrics.length ? <MetricsBlock metrics={card.metrics} display={metricsDisplay} /> : null}

      {Array.isArray(card.bullets) && card.bullets.length ? (
        <ul className={cn("space-y-1.5 text-sm text-[#4d4d4d]", isCompact ? "mt-3" : "mt-4")}>
          {card.bullets.map((bullet) => (
            <li key={bullet} className="grid grid-cols-[14px_minmax(0,1fr)] gap-2 leading-6">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#171717]" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {Array.isArray(card.actions) && card.actions.length ? (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-[#eaeaea] pt-3" aria-label="建议后续动作">
          {card.actions.map((action) => (
            <ReadOnlyAction key={action.label}>{action.label}</ReadOnlyAction>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function DecisionLine({ label, value, tone = "info" }: { label: string; value: string; tone?: "info" | "warning" | "success" }) {
  return (
    <div className="grid gap-1 rounded-md border border-[#eaeaea] bg-[#fafafa] px-3 py-2">
      <span className={cn("text-xs font-medium", tone === "warning" ? "text-[#8a5a00]" : tone === "success" ? "text-[#107d32]" : "text-[#666666]")}>{label}</span>
      <span className="text-sm leading-5 text-[#171717]">{value}</span>
    </div>
  );
}

function CardMatrix({ cards, metricsDisplay }: { cards: AguiCardItem[]; metricsDisplay: MetricsDisplay }) {
  const metricLabels = getSharedMetricLabels(cards).slice(0, 6);

  if (!metricLabels.length) {
    return (
      <div className="grid gap-px bg-[#eaeaea]">
        {cards.map((card, index) => (
          <div key={`${card.title}-${index}`} className="bg-white p-3">
            <strong className="text-sm text-[#171717]">{card.title}</strong>
            {card.description ? <p className="mt-1 text-sm leading-6 text-[#666666]">{card.description}</p> : null}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto overscroll-x-contain">
      <table className="w-max min-w-[700px] table-fixed border-t border-[#eaeaea] text-sm">
        <caption className="sr-only">按共享指标对比候选方案</caption>
        <thead className="bg-[#fafafa]">
          <tr>
            <th className="w-[190px] border-b border-[#eaeaea] px-3 py-2 text-left font-semibold text-[#171717]">对象</th>
            {metricLabels.map((label) => (
              <th key={label} className="w-[160px] border-b border-[#eaeaea] px-3 py-2 text-left font-semibold text-[#171717]">{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cards.map((card, index) => (
            <tr key={`${card.title}-${index}`} className="odd:bg-[#fcfcfc]">
              <td className="border-b border-[#eaeaea] px-3 py-3 align-top">
                <strong className="block whitespace-normal break-words text-[#171717]">{card.title}</strong>
                {card.description ? <span className="mt-1 line-clamp-2 block text-xs leading-5 text-[#666666]">{card.description}</span> : null}
              </td>
              {metricLabels.map((label) => (
                <td key={label} className="whitespace-normal break-words border-b border-[#eaeaea] px-3 py-3 align-top text-[#4d4d4d]">
                  {formatMetricValue(findMetric(card.metrics, label)?.value)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {metricsDisplay === "table" ? null : <span className="sr-only">卡片组已按共享指标转为对比矩阵。</span>}
    </div>
  );
}

function MetricsBlock({ metrics, display }: { metrics: AguiCardMetric[]; display: MetricsDisplay }) {
  if (display === "pills") {
    return (
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {metrics.map((metric) => (
          <span key={metric.label} className="rounded-md border border-[#eaeaea] bg-[#fafafa] px-3 py-2">
            <span className="flex items-center justify-between gap-2 text-xs text-[#8f8f8f]">
              {metric.label}
              {metric.direction ? <span>{metric.direction === "higher" ? "越高越好" : "越低越好"}</span> : null}
            </span>
            <strong className="mt-1 block text-sm font-semibold text-[#171717]">{formatMetricValue(metric.value)}</strong>
          </span>
        ))}
      </div>
    );
  }

  if (display === "bars") {
    return (
      <div className="mt-3 grid gap-2">
        {metrics.map((metric) => {
          const percent = parseMetricPercent(metric.value);
          return (
            <div key={metric.label} className="grid gap-1.5">
              <span className="flex items-center justify-between gap-3 text-xs">
                <strong className="font-medium text-[#4d4d4d]">{metric.label}</strong>
                <em className="text-[#666666]">{formatMetricValue(metric.value)}</em>
              </span>
              <span className="h-1.5 overflow-hidden rounded-full bg-[#f2f2f2]">
                <i className="block h-full rounded-full bg-[#171717]" style={{ width: `${percent}%` }} />
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <dl className="mt-3 divide-y divide-[#eaeaea] rounded-md border border-[#eaeaea] bg-white">
      {metrics.map((metric) => (
        <div key={metric.label} className="grid grid-cols-[minmax(112px,0.42fr)_minmax(0,1fr)] gap-3 px-3 py-2.5">
          <dt className="text-xs font-medium leading-5 text-[#666666]">{metric.label}</dt>
          <dd className="min-w-0 text-sm leading-5 text-[#171717]">{formatMetricValue(metric.value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function getCardLabel(variant: CardGroupVariant): string {
  return {
    recommendation: "方案推荐",
    comparison: "横向对比",
    insight: "关键洞察",
    task: "行动任务",
    resource: "资源建议",
  }[variant];
}

function getCardPurpose(variant: CardGroupVariant): string {
  return variant === "comparison" ? "用于把候选项按共同指标摆在一起，帮助用户做取舍。" : "用于展示候选方案、推荐理由、风险和下一步动作。";
}

function resolveCardGroupVariant(data: any, cards: AguiCardItem[]): CardGroupVariant {
  if (isCardGroupVariant(data?.variant)) return data.variant;
  if (data?.layout === "comparison") return "comparison";
  if (data?.layout === "plan") return "task";
  if (cards.length >= 3 && getSharedMetricLabels(cards).length >= 3) return "comparison";
  return "recommendation";
}

function resolveCardGroupDensity(data: any, variant: CardGroupVariant): CardGroupDensity {
  if (isCardGroupDensity(data?.density)) return data.density;
  return variant === "recommendation" || variant === "task" ? "normal" : "compact";
}

function resolveCardGroupEmphasis(data: any, variant: CardGroupVariant): CardGroupEmphasis {
  if (isCardGroupEmphasis(data?.emphasis)) return data.emphasis;
  return variant === "recommendation" || variant === "task" ? "first" : "none";
}

function resolveCardGroupLayout(data: any, variant: CardGroupVariant): CardGroupLayout {
  if (isCardGroupLayout(data?.layout)) {
    if (data.layout === "comparison") return "matrix";
    if (data.layout === "compact") return "compact";
    if (data.layout === "product" || data.layout === "plan") return "grid";
    return data.layout;
  }
  return variant === "comparison" ? "matrix" : "grid";
}

function resolveMetricsDisplay(data: any, variant: CardGroupVariant, layout: CardGroupLayout): MetricsDisplay {
  if (isMetricsDisplay(data?.metricsDisplay)) return data.metricsDisplay;
  if (layout === "matrix") return "table";
  return variant === "recommendation" || variant === "task" ? "pills" : "rows";
}

function shouldEmphasizeCard(card: AguiCardItem, index: number, emphasis: CardGroupEmphasis): boolean {
  if (emphasis === "none") return false;
  if (emphasis === "first") return index === 0;
  if (emphasis === "selected") return /推荐|优先|首选|selected/i.test(String(card.badge || card.subtitle || ""));
  if (emphasis === "scored") return index === 0;
  return false;
}

function getSharedMetricLabels(cards: AguiCardItem[]): string[] {
  const labelCounts = new Map<string, number>();
  for (const card of cards) {
    const labels = new Set((card.metrics || []).map((metric) => String(metric.label || "").trim()).filter(Boolean));
    for (const label of labels) labelCounts.set(label, (labelCounts.get(label) || 0) + 1);
  }
  return Array.from(labelCounts.entries()).filter(([, count]) => count >= Math.max(2, Math.ceil(cards.length * 0.6))).map(([label]) => label);
}

function findMetric(metrics: AguiCardMetric[] = [], label: string): AguiCardMetric | undefined {
  return metrics.find((metric) => metric.label === label);
}

function formatMetricValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function parseMetricPercent(value: unknown): number {
  if (typeof value === "number") return Math.max(0, Math.min(100, value));
  const match = String(value ?? "").match(/\d+(\.\d+)?/);
  if (!match) return 50;
  return Math.max(0, Math.min(100, Number(match[0])));
}

function isCardGroupVariant(value: unknown): value is CardGroupVariant {
  return typeof value === "string" && ["recommendation", "comparison", "insight", "task", "resource"].includes(value);
}

function isCardGroupDensity(value: unknown): value is CardGroupDensity {
  return typeof value === "string" && ["compact", "normal", "detailed"].includes(value);
}

function isCardGroupEmphasis(value: unknown): value is CardGroupEmphasis {
  return typeof value === "string" && ["none", "first", "scored", "selected"].includes(value);
}

function isCardGroupLayout(value: unknown): value is CardGroupLayout {
  return typeof value === "string" && ["grid", "list", "matrix", "compact", "comparison", "product", "plan"].includes(value);
}

function isMetricsDisplay(value: unknown): value is MetricsDisplay {
  return typeof value === "string" && ["pills", "rows", "bars", "table"].includes(value);
}
