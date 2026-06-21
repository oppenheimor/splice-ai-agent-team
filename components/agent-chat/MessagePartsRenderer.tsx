"use client";

import type { ChatAddToolOutputFunction, UIMessage, UIMessagePart } from "ai";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import {
  CardsTool,
  ChartTool,
  ChecklistTool,
  ChoiceTool,
  ComparisonTool,
  DataTableTool,
  FrameworkTool,
  GenericTool,
  PublishHtmlReportTool,
  ScorecardTool,
  TimelineTool,
} from "./tool-renderers";
import { Card } from "@/components/ui/card";

type MessagePartsRendererProps = {
  parts: UIMessagePart<any, any>[];
  addToolOutput: ChatAddToolOutputFunction<UIMessage>;
};

export function MessagePartsRenderer({ parts, addToolOutput }: MessagePartsRendererProps) {
  const renderable = parts.length ? parts : [{ type: "text", text: "" }];
  let hasOpenChoice = false;

  return renderable.map((part, index) => {
    if (part.type === "text") {
      return <MarkdownMessage key={index} content={part.text} />;
    }

    if (part.type === "reasoning" && "text" in part && part.text) {
      return (
        <details key={index} className="mt-3 rounded-lg border border-border bg-muted/50 p-4">
          <summary className="cursor-pointer text-sm font-semibold">思考摘要</summary>
          <MarkdownMessage content={part.text} />
        </details>
      );
    }

    if (String(part.type).startsWith("tool-")) {
      const toolName = String(part.type).replace(/^tool-/, "");
      if (toolName === "askUserChoice" && "state" in part && part.state !== "output-available") {
        if (hasOpenChoice) return <DeferredChoice key={index} />;
        hasOpenChoice = true;
      }
      return <ToolPart key={index} part={part as ToolPartShape} toolName={toolName} addToolOutput={addToolOutput} />;
    }

    return null;
  });
}

function MarkdownMessage({ content }: { content: string }) {
  if (!content) return <p className="text-sm text-muted-foreground">正在生成...</p>;
  return (
    <div className="space-y-3 text-sm leading-7 [&_a]:font-medium [&_a]:text-primary [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.92em] [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold [&_ol]:ml-5 [&_ol]:list-decimal [&_ol]:space-y-1 [&_p]:m-0 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1.5 [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-2 [&_th]:py-1.5 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-1">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

export type ToolPartShape = {
  type: string;
  state?: string;
  toolCallId?: string;
  input?: any;
  output?: any;
};

function ToolPart({
  part,
  toolName,
  addToolOutput,
}: {
  part: ToolPartShape;
  toolName: string;
  addToolOutput: ChatAddToolOutputFunction<UIMessage>;
}) {
  if (toolName === "askUserChoice") return <ChoiceTool part={part} addToolOutput={addToolOutput} />;
  if (toolName === "showCards") return part.state === "output-available" ? <CardsTool data={part.output || part.input} /> : <ToolLoading label="正在整理方案卡片" />;
  if (toolName === "showChart") return part.state === "output-available" ? <ChartTool data={part.output || part.input} /> : <ToolLoading label="正在生成图表" />;
  if (toolName === "showComparison") return part.state === "output-available" ? <ComparisonTool data={part.output || part.input} /> : <ToolLoading label="正在生成对比" />;
  if (toolName === "showChecklist") return part.state === "output-available" ? <ChecklistTool data={part.output || part.input} /> : <ToolLoading label="正在生成清单" />;
  if (toolName === "showTimeline") return part.state === "output-available" ? <TimelineTool data={part.output || part.input} /> : <ToolLoading label="正在生成时间线" />;
  if (toolName === "showScorecard") return part.state === "output-available" ? <ScorecardTool data={part.output || part.input} /> : <ToolLoading label="正在生成评分卡" />;
  if (toolName === "showDataTable") return part.state === "output-available" ? <DataTableTool data={part.output || part.input} /> : <ToolLoading label="正在生成数据表" />;
  if (toolName === "showFramework") return part.state === "output-available" ? <FrameworkTool data={part.output || part.input} /> : <ToolLoading label="正在生成诊断框架" />;
  if (toolName === "publishHtmlReport") return part.state === "output-available" ? <PublishHtmlReportTool data={part.output || part.input} /> : <ToolLoading label="正在生成完整方案链接" />;

  return <GenericTool part={part} toolName={toolName} />;
}

function ToolLoading({ label }: { label: string }) {
  return (
    <Card className="mt-3 border-border/70 bg-background/80 p-4">
      <strong className="block text-sm font-semibold">{label}</strong>
      <p className="mt-1 text-sm text-muted-foreground">稍等一下，结构化内容马上展示。</p>
    </Card>
  );
}

function DeferredChoice() {
  return (
    <Card className="mt-3 border-border/70 bg-background/80 p-4">
      <strong className="block text-sm font-semibold">还有一个问题待确认</strong>
      <p className="mt-1 text-sm text-muted-foreground">先完成上面的选择，我再继续展示下一步。</p>
    </Card>
  );
}
