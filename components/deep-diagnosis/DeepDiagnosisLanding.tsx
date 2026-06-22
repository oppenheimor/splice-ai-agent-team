import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { AgentManifest } from "@/lib/agent-team/agents/types";
import { Button } from "@/components/ui/button";
import {
  deepDiagnosisAccentButton,
  deepDiagnosisPanel,
  deepDiagnosisShell,
  deepDiagnosisWorkbench,
} from "./styles";

interface DeepDiagnosisLandingProps {
  agent: AgentManifest;
  conversationId: string;
}

export function DeepDiagnosisLanding({ conversationId }: DeepDiagnosisLandingProps) {
  return (
    <main className={deepDiagnosisShell}>
      <div className={deepDiagnosisWorkbench}>
        <section className="grid min-h-0 gap-3 pt-3 lg:grid-cols-[minmax(0,1fr)_420px]">
          <section className={`${deepDiagnosisPanel} overflow-hidden bg-white/95 backdrop-blur-xl`}>
            <div className="grid min-h-[calc(100vh-5.75rem)] content-between gap-8">
              <div className="border-b border-[#eaeaea] p-5 sm:p-8 lg:p-10">
                  <Button asChild size="lg" className={`h-12 px-5 text-white ${deepDiagnosisAccentButton}`}>
                    <Link href={`/deep-diagnosis/chat/${conversationId}`}>
                      开始深度诊断
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
