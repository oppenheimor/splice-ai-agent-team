"use client";

import { useCallback, useEffect, useState } from "react";
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
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AguiEmptyState, AguiNotice, AguiToolCard } from "./agui-ui";

export function ChartTool({ data }: { data: any }) {
  const rows = Array.isArray(data?.data) ? data.data : [];
  const { xKey, yKey } = getChartKeys(rows, data);
  const chartType = data?.chartType || "bar";
  const chartData = rows.map((row: any) => ({ ...row, [yKey]: Number(row[yKey]) || 0 }));
  const [chartElement, setChartElement] = useState<HTMLDivElement | null>(null);
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 });
  const handleChartElement = useCallback((element: HTMLDivElement | null) => {
    setChartElement(element);
  }, []);

  useEffect(() => {
    if (!chartElement) return;
    const observer = new ResizeObserver(([entry]) => {
      setChartSize({
        width: Math.max(0, Math.floor(entry.contentRect.width)),
        height: Math.max(0, Math.floor(entry.contentRect.height)),
      });
    });
    observer.observe(chartElement);
    return () => observer.disconnect();
  }, [chartElement]);

  const isChartReady = chartSize.width > 0 && chartSize.height > 0;

  return (
    <AguiToolCard
      title={data?.title || "数据图表"}
      description={data?.description || "用于把趋势、结构或评分拆解转成可判断的数据证据。"}
      label="数据证据"
      status={rows.length ? "success" : "empty"}
      statusText={rows.length ? `${rows.length} 条数据` : undefined}
      bodyClassName="p-0"
    >
      <div className="grid gap-3 p-3 sm:gap-4 sm:p-4">
        {data?.insight ? <AguiNotice>{data.insight}</AguiNotice> : null}
        {data?.source || data?.unit ? (
          <p className="text-xs leading-5 text-[#8f8f8f]">
            {data?.unit ? `单位：${data.unit}` : null}
            {data?.unit && data?.source ? " · " : null}
            {data?.source ? `来源：${data.source}` : null}
          </p>
        ) : null}
        {!rows.length ? (
          <AguiEmptyState title="暂无图表数据" description="当前工具没有收到 data 数组，建议展示文字解释或重新生成数据。" />
        ) : (
          <div ref={handleChartElement} className="h-[220px] min-h-[220px] min-w-0 w-full rounded-lg border border-[#eaeaea] bg-[#fafafa] p-2 sm:h-[280px] sm:min-h-[280px] sm:p-3">
            {isChartReady ? (
              renderChart({ chartType, rows: chartData, xKey, yKey, width: chartSize.width, height: chartSize.height })
            ) : (
              <div className="grid h-full place-items-center text-sm text-[#666666]">正在准备图表容器...</div>
            )}
          </div>
        )}
        {rows.length ? <DataFallback rows={chartData} xKey={xKey} yKey={yKey} /> : null}
      </div>
    </AguiToolCard>
  );
}

function DataFallback({ rows, xKey, yKey }: { rows: any[]; xKey: string; yKey: string }) {
  return (
    <details className="rounded-lg border border-[#eaeaea] bg-white px-3 py-2">
      <summary className="cursor-pointer text-xs font-medium text-[#666666]">查看数据明细</summary>
      <dl className="mt-2 grid gap-1 border-t border-[#eaeaea] pt-2 text-sm">
        {rows.map((row, index) => (
          <div key={`${row[xKey]}-${index}`} className="flex items-center justify-between gap-3">
            <dt className="truncate text-[#666666]">{String(row[xKey])}</dt>
            <dd className="font-medium tabular-nums text-[#171717]">{formatNumber(row[yKey])}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

function renderChart({
  chartType,
  rows,
  xKey,
  yKey,
  width,
  height,
}: {
  chartType: string;
  rows: any[];
  xKey: string;
  yKey: string;
  width: number;
  height: number;
}) {
  const commonTooltip = <Tooltip formatter={(value) => formatNumber(value)} contentStyle={{ borderRadius: 8, border: "1px solid #eaeaea", background: "#ffffff", boxShadow: "0 2px 2px rgba(0,0,0,0.04)" }} />;
  const colors = ["#171717", "#006bff", "#107d32", "#aa4d00", "#d8001b", "#007f70"];

  if (chartType === "line") {
    return (
      <LineChart width={width} height={height} data={rows} margin={{ top: 12, right: 20, bottom: 8, left: 0 }}>
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
      <PieChart width={width} height={height}>
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
      <FunnelChart width={width} height={height}>
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
      <RadarChart width={width} height={height} data={rows} outerRadius="72%">
        <PolarGrid />
        <PolarAngleAxis dataKey={xKey} />
        <PolarRadiusAxis tick={false} axisLine={false} />
        {commonTooltip}
        <Radar dataKey={yKey} stroke="#171717" fill="#171717" fillOpacity={0.12} isAnimationActive={false} />
      </RadarChart>
    );
  }

  return (
    <BarChart width={width} height={height} data={rows} margin={{ top: 12, right: 20, bottom: 8, left: 0 }}>
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

function formatNumber(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value ?? "");
  return Intl.NumberFormat("zh-CN", { maximumFractionDigits: 1 }).format(number);
}
