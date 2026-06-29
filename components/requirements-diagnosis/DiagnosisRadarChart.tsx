"use client";

import { memo, useMemo } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { DimensionScore } from "@/lib/requirements-diagnosis/types";

type Props = {
  scores: DimensionScore[];
};

type ChartEntry = {
  name: string;
  value: number;
  fullMark: number;
};

// 雷达图展示主导侧强度（0–100），平衡时取 50
function toDominantStrength(score: DimensionScore): number {
  if (score.diff < 15) return 50;
  return Math.max(score.left, score.right);
}

function DiagnosisRadarChart({ scores }: Props) {
  const data: ChartEntry[] = useMemo(
    () => scores.map((s) => ({
      name: s.label,
      value: toDominantStrength(s),
      fullMark: 100,
    })),
    [scores],
  );

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "#6b7280" }}
          />
          <Radar
            name="经营维度"
            dataKey="value"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Tooltip
            // recharts ValueType 包含 readonly array，需显式转换
            formatter={(value: unknown) => [value != null ? `${value}%` : "-", "主导强度"] as [string, string]}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function areScoresEqual(previous: Props, next: Props): boolean {
  if (previous.scores.length !== next.scores.length) return false;

  return previous.scores.every((score, index) => {
    const nextScore = next.scores[index];
    return Boolean(nextScore)
      && score.code === nextScore.code
      && score.label === nextScore.label
      && score.left === nextScore.left
      && score.right === nextScore.right
      && score.diff === nextScore.diff;
  });
}

export default memo(DiagnosisRadarChart, areScoresEqual);
