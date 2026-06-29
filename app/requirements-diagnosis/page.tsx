import Link from "next/link";
import { ArrowRight, History } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import {
  diagnosisAppSurface,
  diagnosisBottomActions,
  diagnosisHero,
  diagnosisHeroEyebrow,
  diagnosisHeroTitle,
  diagnosisMetric,
  diagnosisMutedText,
  diagnosisPrimaryButton,
  diagnosisSecondaryButton,
  diagnosisStage,
  diagnosisShell,
} from "@/components/requirements-diagnosis/styles";

export default async function RequirementsDiagnosisPage() {
  await requireUser();

  return (
    <main className={diagnosisShell}>
      <section className={diagnosisStage}>
        <div className={diagnosisAppSurface}>
          <div className="flex flex-1 flex-col">
            <section className={`mt-6 ${diagnosisHero}`}>
              <p className={diagnosisHeroEyebrow}>AI 需求诊断</p>
              <h1 className={diagnosisHeroTitle}>
                <span className="block">你的 AI 转型</span>
                <span className="block">从照见自己开始</span>
              </h1>
              <p className={`mt-2 text-sm leading-7 ${diagnosisMutedText}`}>
                24 道题，找到你的 AI 转型切入点。
              </p>
            </section>

            <div className="mt-8 grid gap-2.5">
              {[
                ["01", "五维商业画像", "照出你的决策底色。"],
                ["02", "AI 实践定位", "找到你的真实起点。"],
                ["03", "1V1 AI 深度诊断", "开启你的行动路径。"],
              ].map(([no, title, description]) => (
                <div
                  key={title}
                  className={`${diagnosisMetric} flex items-center gap-4 p-4`}
                >
                  <span className="text-xl font-black text-[#2e2f2d]">
                    {no}
                  </span>
                  <span>
                    <strong className="block text-sm font-black">
                      {title}
                    </strong>
                    <small className={`block ${diagnosisMutedText}`}>
                      {description}
                    </small>
                  </span>
                </div>
              ))}
            </div>

            <div className={diagnosisBottomActions}>
              <Button
                asChild
                size="lg"
                className={`h-14 text-sm font-bold ${diagnosisPrimaryButton}`}
              >
                <Link href="/requirements-diagnosis/quiz">
                  开始评测
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className={`h-12 text-sm font-bold ${diagnosisSecondaryButton}`}
              >
                <Link href="/requirements-diagnosis/history">
                  <History className="h-4 w-4" />
                  查看历史
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
