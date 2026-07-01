"use client";

import type { AiReadinessProfile, LandingPriority, AiConcern, AiLandingPreference, AiBlocker } from "@/lib/requirements-diagnosis/types";

type Props = {
  aiReadiness: AiReadinessProfile;
  aiConcern: AiConcern;
  aiLandingPreference: AiLandingPreference;
  aiBlocker: AiBlocker;
  landingPriority: LandingPriority;
  cognitiveWidth: string;
};

const levelColors: Record<string, string> = {
  高: "text-indigo-600 bg-indigo-50",
  中: "text-amber-600 bg-amber-50",
  低: "text-slate-500 bg-slate-100",
};

const stageColors: Record<string, string> = {
  L1: "bg-slate-100 text-slate-700",
  L2: "bg-blue-50 text-blue-700",
  L3: "bg-indigo-50 text-indigo-700",
  L4: "bg-violet-50 text-violet-700",
  L5: "bg-purple-50 text-purple-700",
};

export default function DiagnosisAiAdoptionProfile({
  aiReadiness,
  aiConcern,
  aiLandingPreference,
  aiBlocker,
  landingPriority,
  cognitiveWidth,
}: Props) {
  const axes = Object.values(aiReadiness.axes);

  return (
    <div className="space-y-5">
      {/* 阶段标签 + 总分 */}
      <div className="flex items-center gap-3">
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${stageColors[aiReadiness.level] || stageColors.L2}`}>
          {aiReadiness.level} · {aiReadiness.label}
        </span>
        <span className="text-sm text-slate-500">综合成熟度 {aiReadiness.total}%</span>
        <span className="text-sm text-slate-400">认知宽度：{cognitiveWidth}</span>
      </div>

      {/* 四轴成熟度 */}
      <div className="grid grid-cols-2 gap-3">
        {axes.map((axis) => (
          <div key={axis.code} className="rounded-lg border border-slate-100 p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">{axis.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${levelColors[axis.level] || levelColors["中"]}`}>
                {axis.level}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-400 transition-all"
                style={{ width: `${axis.score}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{axis.insight}</p>
          </div>
        ))}
      </div>

      {/* 阶段总结 */}
      <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-3">
        {aiReadiness.summary}
      </p>

      {/* 三项偏好标签 */}
      <div className="space-y-2">
        <InfoRow label="关注偏好" value={aiConcern.label} detail={aiConcern.description} />
        <InfoRow label="落地方式" value={aiLandingPreference.label} detail={aiLandingPreference.description} />
        <InfoRow label="主要阻力" value={aiBlocker.label} detail={aiBlocker.description} />
        <InfoRow label="优先场景" value={landingPriority.label} detail={landingPriority.description} />
      </div>

      {/* 第一步行动 */}
      <div className="rounded-lg border-l-4 border-indigo-400 bg-indigo-50 p-3">
        <p className="text-xs font-medium text-indigo-700 mb-1">建议第一步</p>
        <p className="text-sm text-indigo-800 leading-relaxed">{landingPriority.firstStep}</p>
      </div>

      {/* 推荐工具 */}
      {landingPriority.toolRecommendations && landingPriority.toolRecommendations.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-slate-500">推荐工具</p>
          <ul className="space-y-1">
            {landingPriority.toolRecommendations.map((tool) => (
              <li key={tool} className="flex items-start gap-2 text-xs text-slate-600">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                {tool}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="shrink-0 text-xs text-slate-400 pt-0.5 w-14">{label}</span>
      <div>
        <span className="font-medium text-slate-700">{value}</span>
        <span className="text-slate-500 ml-1">— {detail}</span>
      </div>
    </div>
  );
}
