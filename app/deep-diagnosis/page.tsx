import Link from "next/link";
import { ArrowRight, ClipboardCheck, MessageSquareText, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getAgentById } from "@/lib/agent-team/agents/registry";
import { createId } from "@/lib/agent-team/id";
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

const deepDiagnosisFeatures = [
  { icon: MessageSquareText, title: "深度追问", description: "围绕业务环节、团队约束和投入边界继续收束。" },
  { icon: Sparkles, title: "Agent 判断", description: "把信息转成优先级、风险和可验证动作。" },
  { icon: ClipboardCheck, title: "行动路径", description: "输出本周、本月和持续推进的落地建议。" },
];

export default async function DeepDiagnosisPage() {
  await requireUser();
  const agent = getAgentById("deep-diagnosis");
  const conversationId = createId("deep-diagnosis");

  if (!agent) {
    throw new Error("Deep diagnosis agent is not registered.");
  }

  return (
    <main className={diagnosisShell}>
      <section className={diagnosisStage}>
        <div className={diagnosisAppSurface}>
          <div className="flex flex-1 flex-col">
            <section className={`mt-6 ${diagnosisHero}`}>
              <p className={diagnosisHeroEyebrow}>深度 Agent 问答诊断</p>
              <h1 className={diagnosisHeroTitle}>
                <span className="block">把业务现场，</span>
                <span className="block">问到能行动</span>
              </h1>
              <p className={`mt-2 text-sm leading-7 ${diagnosisMutedText}`}>
                独立进入时从追问开始；从初步诊断结果进入时，会自动带入报告上下文。
              </p>
            </section>

            <div className="mt-8 grid gap-2.5">
              {deepDiagnosisFeatures.map(({ icon: Icon, title, description }) => (
                <div key={title} className={`${diagnosisMetric} flex items-center gap-4 p-4`}>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e8f3ed] text-[#277652]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <strong className="block text-sm font-black">{title}</strong>
                    <small className={`block ${diagnosisMutedText}`}>{description}</small>
                  </span>
                </div>
              ))}
            </div>

            <div className={`${diagnosisBottomActions} md:grid-cols-2`}>
              <Button asChild size="lg" className={`h-14 text-sm font-bold ${diagnosisPrimaryButton}`}>
                <Link href={`/deep-diagnosis/chat/${conversationId}`}>
                  开始深度诊断
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className={`h-14 text-sm font-bold ${diagnosisSecondaryButton}`}>
                <Link href="/requirements-diagnosis/quiz">先做初步答题诊断</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
