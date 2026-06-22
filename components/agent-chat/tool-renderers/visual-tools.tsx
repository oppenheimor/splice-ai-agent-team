"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
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
};

type AguiCardItem = {
  title?: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  price?: string;
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

  return (
    <Card className="overflow-hidden border-[#eaeaea] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.02),0_8px_16px_-8px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between gap-4 border-b border-[#eaeaea] bg-[#fafafa] px-4 py-3">
        <AguiHeader title={data?.title || "推荐方案"} description={data?.description} />
        <span className="hidden rounded-full border border-[#eaeaea] bg-white px-2.5 py-1 text-xs font-medium text-[#666666] sm:inline-flex">
          {cards.length} 项
        </span>
      </div>

      {layout === "matrix" ? (
        <CardMatrix cards={cards} metricsDisplay={metricsDisplay} />
      ) : (
        <div
          className={cn(
            "grid gap-3 p-3",
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
    </Card>
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
        "group relative overflow-hidden rounded-lg border bg-white shadow-[0_1px_1px_rgba(0,0,0,0.02)] transition-[border-color,background-color,box-shadow] duration-150 hover:border-[#c9c9c9]",
        isRecommendation ? "p-4 hover:shadow-[0_8px_16px_-8px_rgba(0,0,0,0.08)]" : "p-3",
        isEmphasized ? "border-[#171717]" : "border-[#eaeaea]",
        variant === "comparison" && "bg-[#fcfcfc]",
      )}
    >
      {isRecommendation && isEmphasized ? <span className="absolute inset-y-0 left-0 w-1 bg-[#171717]" /> : null}

      <div className={cn("flex items-start justify-between gap-3", !isRecommendation && "items-center")}>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {card.badge ? <StatusBadge>{card.badge}</StatusBadge> : null}
            {isRecommendation && isEmphasized ? <StatusBadge tone="dark">推荐</StatusBadge> : null}
          </div>
          <h4
            className={cn(
              "font-semibold text-[#171717]",
              isCompact ? "text-sm leading-5" : "text-base leading-6",
              (card.badge || (isRecommendation && isEmphasized)) && "mt-2",
            )}
          >
            {card.title}
          </h4>
          {card.subtitle ? <small className="mt-1 block text-sm leading-5 text-[#666666]">{card.subtitle}</small> : null}
        </div>
        {isRecommendation ? (
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-[#eaeaea] bg-[#fafafa] text-xs font-semibold tabular-nums text-[#4d4d4d]">
            {String(index + 1).padStart(2, "0")}
          </span>
        ) : null}
      </div>

      {card.description ? (
        <p className={cn("text-[#4d4d4d]", isCompact ? "mt-2 text-sm leading-5" : "mt-3 text-sm leading-6")}>
          {card.description}
        </p>
      ) : null}

      {card.price ? (
        <div className="mt-3 rounded-md border border-[#eaeaea] bg-[#fafafa] px-3 py-2">
          <span className="block text-xs text-[#8f8f8f]">投入估算</span>
          <strong className="mt-1 block text-sm font-semibold text-[#171717]">{card.price}</strong>
        </div>
      ) : null}

      {Array.isArray(card.metrics) && card.metrics.length ? (
        <MetricsBlock metrics={card.metrics} display={metricsDisplay} />
      ) : null}

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
        <div className="mt-4 flex flex-wrap gap-2 border-t border-[#eaeaea] pt-3">
          {card.actions.map((action) => (
            <span key={action.label} className="rounded-md border border-[#eaeaea] bg-[#fafafa] px-2.5 py-1.5 text-xs font-medium text-[#171717]">
              {action.label}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function CardMatrix({ cards, metricsDisplay }: { cards: AguiCardItem[]; metricsDisplay: MetricsDisplay }) {
  if (!cards.length) return null;
  const metricLabels = getSharedMetricLabels(cards).slice(0, 6);

  if (!metricLabels.length) {
    return (
      <div className="grid gap-px bg-[#eaeaea]">
        {cards.map((card: any, index: number) => (
          <div key={`${card.title}-${index}`} className="bg-white p-3">
            <strong className="text-sm text-[#171717]">{card.title}</strong>
            {card.description ? <p className="mt-1 text-sm leading-6 text-[#666666]">{card.description}</p> : null}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-t border-[#eaeaea] text-sm">
        <thead className="bg-[#fafafa]">
          <tr>
            <th className="w-48 border-b border-[#eaeaea] px-3 py-2 text-left font-semibold text-[#171717]">对象</th>
            {metricLabels.map((label) => (
              <th key={label} className="border-b border-[#eaeaea] px-3 py-2 text-left font-semibold text-[#171717]">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cards.map((card, index) => (
            <tr key={`${card.title}-${index}`} className="odd:bg-[#fcfcfc]">
              <td className="border-b border-[#eaeaea] px-3 py-3 align-top">
                <strong className="block text-[#171717]">{card.title}</strong>
                {card.description ? <span className="mt-1 line-clamp-2 block text-xs leading-5 text-[#666666]">{card.description}</span> : null}
              </td>
              {metricLabels.map((label) => (
                <td key={label} className="border-b border-[#eaeaea] px-3 py-3 align-top text-[#4d4d4d]">
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
          <MetricPill key={metric.label} label={String(metric.label || "")} value={formatMetricValue(metric.value)} tone={metric.tone} />
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

function resolveCardGroupVariant(data: any, cards: AguiCardItem[]): CardGroupVariant {
  const explicit = data?.variant;
  if (isCardGroupVariant(explicit)) return explicit;
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
  return Array.from(labelCounts.entries())
    .filter(([, count]) => count >= Math.max(2, Math.ceil(cards.length * 0.6)))
    .map(([label]) => label);
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

function StatusBadge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "dark" }) {
  return (
    <span className={cn("inline-flex rounded-full px-2 py-1 text-xs font-medium", tone === "dark" ? "bg-[#171717] text-white" : "border border-[#eaeaea] bg-[#fafafa] text-[#666666]")}>
      {children}
    </span>
  );
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

function MetricPill({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <span
      className={cn(
        "rounded-md border px-3 py-2",
        tone === "good" && "border-[#b9f5bc] bg-[#ecfdec]",
        tone === "warn" && "border-[#fff1c1] bg-[#fff6de]",
        tone === "danger" && "border-[#ffd7d6] bg-[#ffeeef]",
        (!tone || tone === "neutral") && "border-[#eaeaea] bg-[#fafafa]",
      )}
    >
      <span className="block text-xs text-[#8f8f8f]">{label}</span>
      <strong className="mt-1 block text-sm font-semibold text-[#171717]">{value}</strong>
    </span>
  );
}

export function ChartTool({ data }: { data: any }) {
  const rows = Array.isArray(data?.data) ? data.data : [];
  const { xKey, yKey } = getChartKeys(rows, data);
  const chartType = data?.chartType || "bar";
  const chartData = rows.map((row: any) => ({ ...row, [yKey]: Number(row[yKey]) || 0 }));

  return (
    <Card className="border-[#eaeaea] bg-white p-4 shadow-[0_2px_2px_rgba(0,0,0,0.04)]">
      <AguiHeader title={data?.title || "数据图表"} description={data?.description} />
      <div className="mt-4 h-[280px] w-full rounded-lg border border-[#eaeaea] bg-[#fafafa] p-3">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart({ chartType, rows: chartData, xKey, yKey })}
        </ResponsiveContainer>
      </div>
    </Card>
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

function getChartKeys(rows: any[], data: any) {
  const keys = Object.keys(rows[0] || {});
  const preferredX = data?.xKey && keys.includes(data.xKey) ? data.xKey : null;
  const preferredY = data?.yKey && keys.includes(data.yKey) && isNumericLike(rows[0]?.[data.yKey]) ? data.yKey : null;
  const xKey = preferredX || keys.find((key) => !isNumericLike(rows[0]?.[key])) || keys[0] || "name";
  const yKey = preferredY || keys.find((key) => key !== xKey && isNumericLike(rows[0]?.[key])) || keys[1] || "value";
  return { xKey, yKey };
}

function isNumericLike(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value !== "string") return false;
  return value.trim() !== "" && Number.isFinite(Number(value));
}

function renderChart({ chartType, rows, xKey, yKey }: { chartType: string; rows: any[]; xKey: string; yKey: string }) {
  const commonTooltip = (
    <Tooltip
      formatter={(value) => formatNumber(value)}
      contentStyle={{ borderRadius: 8, border: "1px solid #eaeaea", background: "#ffffff", boxShadow: "0 2px 2px rgba(0,0,0,0.04)" }}
    />
  );
  const colors = ["#171717", "#006bff", "#107d32", "#aa4d00", "#d8001b", "#007f70"];

  if (chartType === "line") {
    return (
      <LineChart data={rows} margin={{ top: 12, right: 20, bottom: 8, left: 0 }}>
        <CartesianGrid stroke="#eaeaea" vertical={false} />
        <XAxis dataKey={xKey} tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} tickFormatter={formatNumber} />
        {commonTooltip}
        <Line type="monotone" dataKey={yKey} stroke="#171717" strokeWidth={2} dot={false} isAnimationActive={false} />
      </LineChart>
    );
  }

  if (chartType === "donut") {
    return (
      <PieChart>
        {commonTooltip}
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        <Pie data={rows} dataKey={yKey} nameKey={xKey} innerRadius="58%" outerRadius="82%" paddingAngle={3} isAnimationActive={false}>
          {rows.map((row, index) => <Cell key={`${row[xKey]}-${index}`} fill={colors[index % colors.length]} />)}
        </Pie>
      </PieChart>
    );
  }

  if (chartType === "funnel") {
    return (
      <FunnelChart>
        {commonTooltip}
        <Funnel dataKey={yKey} data={rows} nameKey={xKey} isAnimationActive={false}>
          <LabelList position="right" fill="#19221d" stroke="none" dataKey={xKey} fontSize={12} />
          {rows.map((row, index) => <Cell key={`${row[xKey]}-${index}`} fill={colors[index % colors.length]} />)}
        </Funnel>
      </FunnelChart>
    );
  }

  if (chartType === "radar") {
    return (
      <RadarChart data={rows} outerRadius="72%">
        <PolarGrid />
        <PolarAngleAxis dataKey={xKey} />
        <PolarRadiusAxis tick={false} axisLine={false} />
        {commonTooltip}
        <Radar dataKey={yKey} stroke="#171717" fill="#171717" fillOpacity={0.12} isAnimationActive={false} />
      </RadarChart>
    );
  }

  return (
    <BarChart data={rows} margin={{ top: 12, right: 20, bottom: 8, left: 0 }}>
      <CartesianGrid stroke="#eaeaea" vertical={false} />
      <XAxis dataKey={xKey} tickLine={false} axisLine={false} />
      <YAxis tickLine={false} axisLine={false} tickFormatter={formatNumber} />
      {commonTooltip}
      <Bar dataKey={yKey} radius={[6, 6, 0, 0]} isAnimationActive={false}>
        {rows.map((row, index) => <Cell key={`${row[xKey]}-${index}`} fill={colors[index % colors.length]} />)}
      </Bar>
    </BarChart>
  );
}

function formatNumber(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value ?? "");
  return Intl.NumberFormat("zh-CN", { maximumFractionDigits: 1 }).format(number);
}
