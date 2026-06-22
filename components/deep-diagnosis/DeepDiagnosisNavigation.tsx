"use client";

import Link from "next/link";
import {
  BrainCircuit,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  deepDiagnosisLogoMark,
  deepDiagnosisMicroInteraction,
  deepDiagnosisMono,
  deepDiagnosisMutedText,
  deepDiagnosisTopbar,
} from "./styles";

export function ConversationSidebar({ currentTitle }: { currentTitle: string }) {
  const mockSessions = [
    { title: currentTitle, meta: "Deep Diagnosis · 当前" },
    { title: "业务流程横向扫描", meta: "Deep Diagnosis · 占位" },
    { title: "AI 自动化想法评估", meta: "Deep Diagnosis · 占位" },
    { title: "7 / 30 / 90 天行动路线", meta: "Deep Diagnosis · 占位" },
  ];

  return (
    <aside className="hidden h-full w-[240px] min-w-[240px] border-r border-[#eaeaea] bg-[#f7f7f7]/92 px-3 py-3 text-[#4d4d4d] shadow-[inset_-1px_0_0_rgba(255,255,255,0.75)] lg:flex lg:flex-col">
      <div className="flex items-center justify-between gap-2 px-1">
        <h2 className={`text-[13px] font-semibold text-[#4d4d4d] ${deepDiagnosisMono}`}>对话历史</h2>
      </div>

      <div className="mt-5 space-y-4 overflow-y-auto">
        <SidebarGroup title="当前">
          {mockSessions.slice(0, 1).map((session) => (
            <SidebarSession key={session.title} session={session} active />
          ))}
        </SidebarGroup>
        <SidebarGroup title="占位历史">
          {mockSessions.slice(1).map((session) => (
            <SidebarSession key={session.title} session={session} />
          ))}
        </SidebarGroup>
      </div>
    </aside>
  );
}

export function Topbar({
  agentName,
}: {
  agentName: string;
}) {
  return (
    <header className={deepDiagnosisTopbar}>
      <div className="flex min-w-0 items-center gap-3">
        <Link href="/deep-diagnosis" className={deepDiagnosisLogoMark} aria-label="返回深度诊断首页">
          <BrainCircuit className="h-4 w-4" />
        </Link>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#171717]">{agentName}</p>
          <p className={`truncate text-xs ${deepDiagnosisMutedText}`}>
            独立工作台 · 从业务现场开始追问
          </p>
        </div>
      </div>
    </header>
  );
}

function SidebarGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className={`px-1 text-[11px] font-medium uppercase text-[#8f8f8f] ${deepDiagnosisMono}`}>{title}</h3>
      <div className="mt-2 space-y-1">{children}</div>
    </section>
  );
}

function SidebarSession({
  session,
  active,
}: {
  session: { title: string; meta: string };
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`block w-full rounded-md px-3 py-2 text-left ${deepDiagnosisMicroInteraction} ${active ? "border border-[#eaeaea] bg-white text-[#171717] shadow-[0_1px_1px_rgba(0,0,0,0.02)]" : "border border-transparent text-[#4d4d4d] hover:border-[#eaeaea] hover:bg-white/70 hover:text-[#171717]"}`}
    >
      <span className="block truncate text-sm font-medium">{session.title}</span>
      <span className="mt-0.5 block truncate text-xs text-[#8f8f8f]">{session.meta}</span>
    </button>
  );
}
