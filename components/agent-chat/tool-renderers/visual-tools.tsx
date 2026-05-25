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

export function CardsTool({ data }: { data: any }) {
  const cards = Array.isArray(data?.cards) ? data.cards : [];
  return (
    <Card className="mt-3 border-border/70 bg-background/80 p-4">
      <AguiHeader title={data?.title || "推荐方案"} description={data?.description} />
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {cards.map((card: any, index: number) => (
          <article key={`${card.title}-${index}`} className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="mb-2 flex flex-wrap gap-2">
              {card.badge ? <span>{card.badge}</span> : null}
              {card.price ? <strong>{card.price}</strong> : null}
            </div>
            <h4 className="text-sm font-semibold">{card.title}</h4>
            {card.subtitle ? <small className="mt-1 block text-xs text-muted-foreground">{card.subtitle}</small> : null}
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.description}</p>
            {Array.isArray(card.metrics) && card.metrics.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {card.metrics.map((metric: any) => (
                  <span key={metric.label} data-tone={metric.tone || "neutral"}>
                    {metric.label}: {metric.value}
                  </span>
                ))}
              </div>
            ) : null}
            {Array.isArray(card.bullets) && card.bullets.length ? (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {card.bullets.map((bullet: string) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </Card>
  );
}

export function ChartTool({ data }: { data: any }) {
  const rows = Array.isArray(data?.data) ? data.data : [];
  const { xKey, yKey } = getChartKeys(rows, data);
  const chartType = data?.chartType || "bar";
  const chartData = rows.map((row: any) => ({ ...row, [yKey]: Number(row[yKey]) || 0 }));

  return (
    <Card className="mt-3 border-border/70 bg-background/80 p-4">
      <AguiHeader title={data?.title || "数据图表"} description={data?.description} />
      <div className="mt-4 h-[280px] w-full">
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
      <strong className="block text-sm font-semibold">{title}</strong>
      {description ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p> : null}
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
      contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
    />
  );
  const colors = ["#0f766e", "#d97706", "#2563eb", "#7c3aed", "#dc2626", "#0891b2"];

  if (chartType === "line") {
    return (
      <LineChart data={rows} margin={{ top: 12, right: 20, bottom: 8, left: 0 }}>
        <CartesianGrid stroke="rgba(100,116,139,0.18)" vertical={false} />
        <XAxis dataKey={xKey} tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} tickFormatter={formatNumber} />
        {commonTooltip}
        <Line type="monotone" dataKey={yKey} stroke="#2f6f68" strokeWidth={3} dot={false} isAnimationActive={false} />
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
        <Radar dataKey={yKey} stroke="#2f6f68" fill="#2f6f68" fillOpacity={0.18} isAnimationActive={false} />
      </RadarChart>
    );
  }

  return (
    <BarChart data={rows} margin={{ top: 12, right: 20, bottom: 8, left: 0 }}>
      <CartesianGrid stroke="rgba(40,34,28,0.12)" vertical={false} />
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
