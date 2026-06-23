"use client";

import type { ChatAddToolOutputFunction, UIMessage } from "ai";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Boxes, ExternalLink } from "lucide-react";
import {
  CardsTool,
  ChecklistTool,
  ChoiceTool,
  ComparisonTool,
  DataTableTool,
  FrameworkTool,
  PublishHtmlReportTool,
  ScorecardTool,
  TimelineTool,
  WebSearchTool,
} from "@/components/agent-chat/tool-renderers";
import type { ToolPartShape } from "@/components/agent-chat/MessagePartsRenderer";
import { Badge } from "@/components/ui/badge";
import { deepDiagnosisAguiDemoSections, type AguiDemoCase, type AguiDemoSection } from "@/constants/deep-diagnosis-agui-demo";
import { deepDiagnosisShell } from "@/components/deep-diagnosis/styles";
import { cn } from "@/lib/utils";

const noopAddToolOutput: ChatAddToolOutputFunction<UIMessage> = () => undefined;

const ClientChartTool = dynamic(
  () => import("@/components/agent-chat/tool-renderers").then((module) => module.ChartTool),
  {
    ssr: false,
    loading: () => (
      <section className="rounded-lg border border-[#eaeaea] bg-white p-4 shadow-[0_2px_2px_rgba(0,0,0,0.04)]">
        <strong className="block text-sm font-semibold text-[#171717]">数据图表</strong>
        <div className="mt-4 h-[280px] w-full rounded-lg border border-[#eaeaea] bg-[#fafafa]" />
      </section>
    ),
  },
);

export function DeepDiagnosisAguiDemoWall() {
  const totalCases = deepDiagnosisAguiDemoSections.reduce((sum, section) => sum + section.cases.length, 0);

  return (
    <main className={cn(deepDiagnosisShell, "min-h-screen")}>
      <section className="mx-auto w-full max-w-[1480px] px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <header className="grid gap-5 border-b border-[#eaeaea] pb-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <Link
              href="/deep-diagnosis"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[#eaeaea] bg-white px-3 py-2 text-sm font-medium text-[#171717] shadow-[0_1px_1px_rgba(0,0,0,0.02)] transition hover:border-[#c9c9c9] hover:bg-[#f2f2f2]"
            >
              <ArrowLeft className="h-4 w-4" />
              返回 deep-diagnosis
            </Link>
            <div className="mt-6 flex items-center gap-3 sm:mt-8">
              <span className="grid h-10 w-10 place-items-center rounded-md border border-[#eaeaea] bg-white text-[#171717]">
                <Boxes className="h-5 w-5" />
              </span>
              <Badge className="rounded-full border-[#eaeaea] bg-white px-3 py-1 text-[#4d4d4d] hover:bg-white">
                临时样板墙
              </Badge>
            </div>
            <h1 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight tracking-normal text-[#171717] sm:text-5xl">
              deep-diagnosis AGUI 组件样板墙
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#666666] sm:text-base">
              按 deep-diagnosis 实际启用的 AGUI 与外部工具结果卡片展示，所有内容均为本地 Mock 数据。配置型组件会逐项展开配置值，方便横向扫样式。
            </p>
          </div>
          <div className="grid gap-3 rounded-lg border border-[#eaeaea] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.02)]">
            <Stat label="组件" value={deepDiagnosisAguiDemoSections.length} />
            <Stat label="样例" value={totalCases} />
            <Stat label="数据源" value="Mock" />
          </div>
        </header>

        <div className="grid gap-6 py-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <nav className="top-6 h-fit overflow-x-auto rounded-lg border border-[#eaeaea] bg-white p-2 text-sm shadow-[0_1px_1px_rgba(0,0,0,0.02)] lg:sticky lg:overflow-visible lg:p-3">
            <strong className="mb-3 block px-2 text-xs font-semibold uppercase text-[#8f8f8f]">工具索引</strong>
            <div className="flex gap-1 lg:grid">
              {deepDiagnosisAguiDemoSections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex min-h-10 shrink-0 items-center justify-between gap-2 rounded-md px-2.5 py-2 text-[#4d4d4d] transition hover:bg-[#f2f2f2] hover:text-[#171717] lg:shrink"
                >
                  <span className="truncate">{section.name}</span>
                  <span className="text-xs text-[#8f8f8f]">{section.cases.length}</span>
                </a>
              ))}
            </div>
          </nav>

          <div className="grid gap-10">
            {deepDiagnosisAguiDemoSections.map((section) => (
              <DemoSection key={section.id} section={section} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-[#eaeaea] bg-[#fafafa] px-3 py-2">
      <span className="text-xs font-medium text-[#666666]">{label}</span>
      <strong className="text-sm font-semibold text-[#171717]">{value}</strong>
    </div>
  );
}

function DemoSection({ section }: { section: AguiDemoSection }) {
  return (
    <section id={section.id} className="scroll-mt-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-[#eaeaea] pb-3">
        <div>
          <h2 className="text-2xl font-semibold leading-tight text-[#171717]">{section.name}</h2>
          <p className="mt-1 text-sm leading-6 text-[#666666]">{section.description}</p>
        </div>
        <Badge className="rounded-full border-[#eaeaea] bg-white text-[#666666] hover:bg-white">{section.cases.length} 个样例</Badge>
      </div>
      <div className="grid gap-5">
        {section.cases.map((demoCase) => (
          <DemoCasePanel key={demoCase.id} sectionId={section.id} demoCase={demoCase} />
        ))}
      </div>
    </section>
  );
}

function DemoCasePanel({ sectionId, demoCase }: { sectionId: AguiDemoSection["id"]; demoCase: AguiDemoCase }) {
  return (
    <article className="grid gap-3 rounded-lg border border-[#eaeaea] bg-white/55 p-3 sm:p-4">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-[#171717]">{demoCase.title}</h3>
            {demoCase.config ? (
              <span className="rounded-full border border-[#eaeaea] bg-white px-2 py-0.5 font-mono text-xs text-[#666666]">
                {demoCase.config}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm leading-6 text-[#666666]">{demoCase.description}</p>
        </div>
        <a
          href={`#${sectionId}`}
          className="inline-flex min-h-10 items-center gap-1 rounded-md border border-[#eaeaea] bg-white px-3 py-2 text-xs font-medium text-[#666666] transition hover:border-[#c9c9c9] hover:text-[#171717]"
        >
          {sectionId}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <div className="min-w-0">
        <ToolPreview sectionId={sectionId} demoCase={demoCase} />
      </div>
    </article>
  );
}

function ToolPreview({ sectionId, demoCase }: { sectionId: AguiDemoSection["id"]; demoCase: AguiDemoCase }) {
  if (sectionId === "askUserChoice") {
    const data = demoCase.data && typeof demoCase.data === "object" ? demoCase.data as Record<string, unknown> : {};
    const part: ToolPartShape = {
      type: "tool-askUserChoice",
      state: demoCase.state || "input-available",
      toolCallId: demoCase.id,
      input: data,
      output: demoCase.state === "output-available" ? data : undefined,
    };
    return <ChoiceTool part={part} addToolOutput={noopAddToolOutput} />;
  }

  if (sectionId === "showCards") return <CardsTool data={demoCase.data} />;
  if (sectionId === "showChart") return <ClientChartTool data={demoCase.data} />;
  if (sectionId === "showComparison") return <ComparisonTool data={demoCase.data} />;
  if (sectionId === "showChecklist") return <ChecklistTool data={demoCase.data} />;
  if (sectionId === "showTimeline") return <TimelineTool data={demoCase.data} />;
  if (sectionId === "showScorecard") return <ScorecardTool data={demoCase.data} />;
  if (sectionId === "showDataTable") return <DataTableTool data={demoCase.data} />;
  if (sectionId === "showFramework") return <FrameworkTool data={demoCase.data} />;
  if (sectionId === "webSearch") return <WebSearchTool data={demoCase.data} />;
  if (sectionId === "publishHtmlReport") return <PublishHtmlReportTool data={demoCase.data} />;

  return null;
}
