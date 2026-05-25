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

export function TreasureChartTool({ data }: { data: any }) {
  const rows = Array.isArray(data?.data) ? data.data : [];
  const { xKey, yKey } = getChartKeys(rows, data);
  const chartType = data?.chartType || "bar";
  const chartData = rows.map((row: any) => ({ ...row, [yKey]: Number(row[yKey]) || 0 }));

  return (
    <div className="h-[280px] w-full rounded-[22px] bg-[#fffdf2]/70 p-3 shadow-[inset_0_0_0_1px_rgba(216,200,162,0.65)]">
      <ResponsiveContainer width="100%" height="100%">
        {renderChart({ chartType, rows: chartData, xKey, yKey })}
      </ResponsiveContainer>
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
      contentStyle={{
        background: "#fffdf2",
        border: "2px solid #d8c8a2",
        borderRadius: 16,
        color: "#725d42",
      }}
    />
  );
  const colors = ["#19c8b9", "#f7cd67", "#889df0", "#f8a6b2", "#e59266", "#82d5bb"];

  if (chartType === "line") {
    return (
      <LineChart data={rows} margin={{ top: 12, right: 20, bottom: 8, left: 0 }}>
        <CartesianGrid stroke="rgba(114,93,66,0.16)" vertical={false} />
        <XAxis dataKey={xKey} tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} tickFormatter={formatNumber} />
        {commonTooltip}
        <Line type="monotone" dataKey={yKey} stroke="#19c8b9" strokeWidth={3} dot={false} isAnimationActive={false} />
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
          <LabelList position="right" fill="#725d42" stroke="none" dataKey={xKey} fontSize={12} />
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
        <Radar dataKey={yKey} stroke="#19c8b9" fill="#19c8b9" fillOpacity={0.2} isAnimationActive={false} />
      </RadarChart>
    );
  }

  return (
    <BarChart data={rows} margin={{ top: 12, right: 20, bottom: 8, left: 0 }}>
      <CartesianGrid stroke="rgba(114,93,66,0.14)" vertical={false} />
      <XAxis dataKey={xKey} tickLine={false} axisLine={false} />
      <YAxis tickLine={false} axisLine={false} tickFormatter={formatNumber} />
      {commonTooltip}
      <Bar dataKey={yKey} radius={[8, 8, 0, 0]} isAnimationActive={false}>
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
