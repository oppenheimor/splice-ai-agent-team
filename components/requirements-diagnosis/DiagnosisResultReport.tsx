"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, RefreshCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getOperatorAvatar } from "@/lib/requirements-diagnosis/operator-avatars";
import type { DiagnosisResult } from "@/lib/requirements-diagnosis/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  diagnosisAppSurface,
  diagnosisBadge,
  diagnosisBottomActions,
  diagnosisMutedText,
  diagnosisOutlineBadge,
  diagnosisPrimaryButton,
  diagnosisSecondaryButton,
  diagnosisSerif,
  diagnosisStage,
} from "@/components/requirements-diagnosis/styles";

type DiagnosisResultReportProps = {
  result: DiagnosisResult;
  recordId?: string | null;
  narrativeStatus?: "idle" | "saving" | "streaming" | "done" | "error";
  narrativeDraft?: string;
  errorMessage?: string | null;
  onRetry?: () => void;
};

export function DiagnosisResultReport({ result, recordId, narrativeStatus = "idle", narrativeDraft, errorMessage, onRetry }: DiagnosisResultReportProps) {
  const showDraft = narrativeStatus === "streaming" && Boolean(narrativeDraft?.trim());
  const bottomActionsRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isBottomActionNear, setIsBottomActionNear] = useState(false);
  const dimensions = Object.values(result.dimensionScores);
  const decisiveDimensions = dimensions
    .filter((score) => score.diff >= 20)
    .sort((a, b) => b.diff - a.diff)
    .slice(0, 3);
  const operatorAvatar = getOperatorAvatar(result.operatorTypeName);
  const showFloatingAction = Boolean(recordId) && scrollProgress >= 0.3 && scrollProgress < 0.8 && !isBottomActionNear;
  const deepDiagnosisHref = "/deep-diagnosis";

  useEffect(() => {
    function updateFloatingAction() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) {
        setScrollProgress(0);
        return;
      }
      setScrollProgress(window.scrollY / scrollable);
    }

    updateFloatingAction();
    window.addEventListener("scroll", updateFloatingAction, { passive: true });
    window.addEventListener("resize", updateFloatingAction);
    return () => {
      window.removeEventListener("scroll", updateFloatingAction);
      window.removeEventListener("resize", updateFloatingAction);
    };
  }, []);

  useEffect(() => {
    const actionNode = bottomActionsRef.current;
    if (!actionNode) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsBottomActionNear(Boolean(entry?.isIntersecting)),
      { rootMargin: "0px 0px 120px 0px" },
    );
    observer.observe(actionNode);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={diagnosisStage}>
      <article className={`${diagnosisAppSurface} overflow-auto`}>
        <div className="flex flex-1 flex-col">
          <header className="border-b border-[#deded8] pb-8 pt-3 text-center">
            <Image
              src={operatorAvatar}
              alt={`${result.operatorTypeName}头像`}
              width={128}
              height={128}
              priority
              className="mx-auto mt-5 h-32 w-32 rounded-full object-cover object-top ring-1 ring-[#deded8]"
            />
            <h1 className={`mt-4 text-[38px] font-black leading-[1.08] tracking-tight ${diagnosisSerif}`}>{result.operatorTypeName}</h1>
            <p className="mx-auto mt-4 max-w-[68ch] text-[15px] leading-7 text-[#4f504c]">{result.operatorTypeDefinition}</p>
          </header>

          <section className="mt-7">
            <div className="flex items-center gap-2 text-[#686965]">
              <CheckCircle2 className="h-4 w-4" />
              <strong className="text-sm">简要解释</strong>
            </div>
            <div className="mt-3 grid max-w-[72ch] gap-2 text-[15px] leading-7 text-[#2e2f2d]">
              {formatConclusionLines(result, decisiveDimensions).map((line) => (
                <p key={line} className="font-semibold">{line}</p>
              ))}
            </div>
          </section>

          <div className="mt-7 grid gap-8">
            <Section index="01" title="判断依据" status={narrativeStatus} errorMessage={errorMessage} onRetry={onRetry}>
              {showDraft ? <NarrativeDraft content={narrativeDraft || ""} /> : null}
              <div className="grid gap-7">
                <div>
                  <SubsectionLabel>经营判断依据</SubsectionLabel>
                  <div className="mt-4 grid gap-5">
                    {dimensions.map((score, index) => (
                      <DimensionEvidenceItem
                        key={score.code}
                        score={score}
                        insight={result.narrative.actionInsights[index]}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <SubsectionLabel>AI 使用基础</SubsectionLabel>
                  <div className="mt-4 grid gap-3">
                    <InfoRow label="当前阶段" value={`${result.aiAdoptionStageLabel}（${result.aiAdoptionStage}）`} />
                    <InfoRow label="关注偏好" value={result.userTypeLabel} />
                    <InfoRow label="认知宽度" value={result.cognitiveWidth} />
                  </div>
                  {result.blindSpots.length ? (
                    <div className="mt-5">
                      <SubsectionLabel>还需要补齐的视角</SubsectionLabel>
                      <ul className={`mt-3 list-disc space-y-2 pl-5 text-sm leading-6 ${diagnosisMutedText}`}>
                        {result.blindSpots.map((spot) => (
                          <li key={spot}>{spot}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </div>
            </Section>

            <Section index="02" title="落地建议" status={narrativeStatus} errorMessage={errorMessage} onRetry={onRetry}>
              {showDraft ? <NarrativeDraft content={narrativeDraft || ""} compact /> : null}
              <RecommendationLead value={result.justNeedLabel} />
              <ActionPlan items={[
                ["本周", result.narrative.actionPlan.week],
                ["本月", result.narrative.actionPlan.month],
                ["持续", result.narrative.actionPlan.ongoing],
              ]} />
              <ClosingNotes
                items={[
                  ["AI技术逻辑", result.narrative.closing.technology],
                  ["做事哲学", result.narrative.closing.philosophy],
                  ["一句话", cleanRepeatedClosingQuote(result.narrative.closing.quote, result.operatorTypeName)],
                ]}
              />
              <div className="pt-3">
                <RecommendationPath
                  title={result.recommendation.title}
                  description={result.recommendation.description}
                  hook={result.recommendation.hook}
                />
              </div>
            </Section>
          </div>

          <div ref={bottomActionsRef} className={`${diagnosisBottomActions} !mt-7 grid-cols-1 gap-2 !pb-[env(safe-area-inset-bottom)] md:grid-cols-2`}>
            {recordId ? (
              <Button asChild className={`h-[52px] text-sm font-bold shadow-none ${diagnosisPrimaryButton}`}>
                <Link href={deepDiagnosisHref}>
                  深度诊断
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : null}
            <Button asChild variant="outline" className={`h-11 text-sm font-bold shadow-none ${diagnosisSecondaryButton}`}>
              <Link href="/requirements-diagnosis/quiz">重新评测</Link>
            </Button>
          </div>

          {showFloatingAction ? (
            <div className="fixed bottom-5 right-4 z-20 md:hidden">
              <Link
                href={deepDiagnosisHref}
                className="group flex items-center gap-2 rounded-full border border-[#2e2f2d]/10 bg-[#fffffc]/92 px-4 py-3 text-sm font-black text-[#2e2f2d] shadow-[0_12px_28px_rgba(0,0,0,0.12)] backdrop-blur transition hover:bg-[#f7f7f3]"
              >
                <span className="h-2 w-2 rounded-full bg-[#277652]" />
                <span>深度诊断</span>
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
            </div>
          ) : null}
        </div>
      </article>
    </div>
  );
}

function SubsectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[13px] font-black leading-none tracking-[0.08em] text-[#686965]">
      {children}
    </h3>
  );
}

function DimensionEvidenceItem({ score, insight }: { score: DiagnosisResult["dimensionScores"][keyof DiagnosisResult["dimensionScores"]]; insight?: string }) {
  return (
    <div className="grid gap-3 md:grid-cols-[220px_minmax(0,1fr)]">
      <DimensionMeter score={score} />
      <p className="text-sm leading-6 text-[#3f403c]">
        {insight || `当前主导倾向是${score.dominantLabel}，${getStarMeaning(score.stars)}`}
      </p>
    </div>
  );
}

function DimensionMeter({ score }: { score: DiagnosisResult["dimensionScores"][keyof DiagnosisResult["dimensionScores"]] }) {
  const tone = getDimensionTone(score.code);
  const isBalanced = score.diff < 20;
  const inactiveColor = "#d8d8d3";
  const leftColor = isBalanced ? inactiveColor : score.left > score.right ? tone.accent : inactiveColor;
  const rightColor = isBalanced ? tone.accent : score.right > score.left ? tone.accent : inactiveColor;
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <strong className="flex items-center gap-2">
          <i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tone.accent }} />
          {score.label}
        </strong>
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 text-sm">
        <span>
          {score.leftLabel} {score.left}%
        </span>
        <span className="text-right">
          {score.rightLabel} {score.right}%
        </span>
      </div>
      <div className="mt-2 flex overflow-hidden rounded-full bg-[#e4e4df]">
        <i className="h-2" style={{ width: `${score.left}%`, backgroundColor: leftColor }} />
        <i className="h-2" style={{ width: `${score.right}%`, backgroundColor: rightColor }} />
      </div>
    </div>
  );
}

function Section({
  index,
  title,
  status,
  errorMessage,
  onRetry,
  children,
}: {
  index: string;
  title: string;
  status: DiagnosisResultReportProps["narrativeStatus"];
  errorMessage?: string | null;
  onRetry?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[#deded8] pt-6">
      <div className="grid gap-2 md:grid-cols-[72px_minmax(0,1fr)_auto] md:items-start">
        <span className="text-xs font-black tracking-[0.18em] text-[#8a8a86]">{index}</span>
        <h2 className={`text-[24px] font-black leading-tight ${diagnosisSerif}`}>{title}</h2>
        {status === "saving" || status === "streaming" ? <Badge variant="secondary" className={diagnosisOutlineBadge}>生成中</Badge> : null}
      </div>
      {errorMessage ? (
        <div className="mt-5 flex items-center justify-between gap-3 bg-[#f7f7f3] px-4 py-3 text-sm text-[#2e2f2d]">
          <span>{errorMessage}</span>
          {onRetry ? (
            <Button size="sm" variant="outline" type="button" onClick={onRetry} className={diagnosisSecondaryButton}>
              <RefreshCcw className="h-4 w-4" />
              重试
            </Button>
          ) : null}
        </div>
      ) : null}
      <div className="mt-5 grid gap-4 md:pl-[72px]">{children}</div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 text-sm">
      <span className="font-semibold text-[#8a8a86]">{label}</span>
      <strong className="font-semibold text-[#222322]">{value}</strong>
    </div>
  );
}

function RecommendationLead({ value }: { value: string }) {
  return (
    <div className="grid gap-1">
      <span className="text-[13px] font-black tracking-[0.08em] text-[#8a8a86]">建议切入</span>
      <strong className="text-[19px] font-black leading-snug text-[#222322]">{value}</strong>
    </div>
  );
}

function ActionPlan({ items }: { items: Array<[string, string]> }) {
  return (
    <div className="grid gap-4">
      {items.map(([label, value]) => (
        <div key={label} className="grid grid-cols-[64px_minmax(0,1fr)] gap-4">
          <span className="pt-0.5 text-sm font-bold text-[#8a8a86]">{label}</span>
          <p className="text-[15px] font-medium leading-7 text-[#2f302d]">{value}</p>
        </div>
      ))}
    </div>
  );
}

function ClosingNotes({ items }: { items: Array<[string, string]> }) {
  return (
    <div className="grid gap-3 pt-1">
      {items.map(([label, value]) => (
        <div key={label} className="grid gap-2 sm:grid-cols-[88px_minmax(0,1fr)]">
          <strong className="text-xs font-bold leading-6 tracking-[0.06em] text-[#a0a19b]">{label}</strong>
          <p className="text-sm font-normal leading-6 text-[#4f504c]">{value}</p>
        </div>
      ))}
    </div>
  );
}

function RecommendationPath({ title, description, hook }: { title: string; description: string; hook: string }) {
  return (
    <div>
      <strong className="block text-[13px] font-bold tracking-[0.06em] text-[#a0a19b]">可选后续路径</strong>
      <strong className="mt-2 block text-lg font-black text-[#222322]">{title}</strong>
      <p className="mt-2 text-sm font-normal leading-6 text-[#4f504c]">{description}</p>
      <p className="mt-2 text-sm font-bold text-[#3f403c]">
        下一步：{hook}
      </p>
    </div>
  );
}

function NarrativeDraft({ content, compact = false }: { content: string; compact?: boolean }) {
  const receivedLength = cleanNarrativeDraft(content).length;
  return (
    <div className="bg-[#f7f7f3] px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <strong className={`text-sm font-semibold ${diagnosisMutedText}`}>个性化叙事正在生成</strong>
        <span className="text-xs text-[#2e2f2d]">流式接收中</span>
      </div>
      <p className={compact ? `mt-3 max-h-28 overflow-hidden text-xs leading-5 ${diagnosisMutedText}` : `mt-3 max-h-40 overflow-auto text-xs leading-5 ${diagnosisMutedText}`}>
        已接收 {receivedLength} 字叙事内容，正在整理成可行动的报告段落。结构化报告已可阅读，生成完成后会自动替换当前段落。
      </p>
    </div>
  );
}

function getStarMeaning(stars: 1 | 2 | 3): string {
  if (stars === 1) return "极端倾向，优势锋利，另一侧也可能是关键短板。";
  if (stars === 2) return "有明显倾向，同时保留一定弹性空间。";
  return "接近平衡，切换自如，但需要确认真正优势。";
}

function formatConclusionLines(
  result: DiagnosisResult,
  scores: Array<DiagnosisResult["dimensionScores"][keyof DiagnosisResult["dimensionScores"]]>,
): string[] {
  const stage = `AI 使用基础处在「${result.aiAdoptionStageLabel}（${result.aiAdoptionStage}）」。`;
  if (!scores.length) {
    return [
      "你的经营画像整体比较均衡，暂时没有单一维度明显拉开差异。",
      `${stage}下一步重点是选定一个真实业务流程，把工具使用转化为可复用的方法。`,
    ];
  }
  const summary = scores.map((score) => `${score.label}偏${score.dominantLabel}`).join("、");
  return [
    `这个结果主要来自三个明显倾向：${summary}。`,
    `${stage}下一步重点是选定一个真实业务流程，把优势转化为可验证的业务产出。`,
  ];
}

function getDimensionTone(code: string): { accent: string } {
  const tones: Record<string, { accent: string }> = {
    V: { accent: "#277652" },
    D: { accent: "#4f6f86" },
    E: { accent: "#b96b2c" },
    A: { accent: "#9a762d" },
    B: { accent: "#7b5d73" },
  };
  return tones[code] || { accent: "#2e2f2d" };
}

function cleanNarrativeDraft(content: string): string {
  return content
    .replace(/[{}[\]",]/g, " ")
    .replace(/actionInsights|actionPlan|closing|week|month|ongoing|technology|philosophy|quote/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(-360);
}

function cleanRepeatedClosingQuote(quote: string, operatorTypeName: string): string {
  const prefix = `送给${operatorTypeName}一句话：`;
  return quote.startsWith(prefix) ? quote.slice(prefix.length).trim() : quote;
}
