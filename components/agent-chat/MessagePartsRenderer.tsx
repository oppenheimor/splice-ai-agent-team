"use client";

import type { ChatAddToolOutputFunction, UIMessage, UIMessagePart } from "ai";
import { memo } from "react";
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
  hasRenderableChoiceOptions,
  PublishHtmlReportTool,
  ScorecardTool,
  TimelineTool,
  WebSearchTool,
} from "./tool-renderers";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MessagePartsRendererProps = {
  parts: UIMessagePart<any, any>[];
  addToolOutput: ChatAddToolOutputFunction<UIMessage>;
  textClassName?: string;
};

function MessagePartsRendererBase({ parts, addToolOutput, textClassName }: MessagePartsRendererProps) {
  const renderable = parts.length ? parts : [{ type: "text", text: "" }];
  const webSearchParts = renderable.filter(isWebSearchPart) as ToolPartShape[];
  const firstWebSearchIndex = renderable.findIndex(isWebSearchPart);
  const hasPendingWebSearch = webSearchParts.some((part) => part.state !== "output-available");
  const webSearchOutputs = webSearchParts
    .filter((part) => part.state === "output-available")
    .map((part) => part.output || part.input);
  const firstOpenChoiceIndex = renderable.findIndex((part) => {
    if (!String(part.type).startsWith("tool-")) return false;
    const toolName = String(part.type).replace(/^tool-/, "");
    return toolName === "askUserChoice" &&
      "state" in part &&
      part.state !== "output-available" &&
      part.state !== "input-streaming" &&
      hasRenderableChoiceOptions((part as ToolPartShape).input?.options);
  });

  const children = renderable.map((part, index) => {
    if (part.type === "text") {
      return <MarkdownMessage key={index} content={part.text} className={textClassName} />;
    }

    if (part.type === "reasoning" && "text" in part && part.text) {
      return (
        <details key={index} className="rounded-lg border border-border bg-muted/50 p-4">
          <summary className="cursor-pointer text-sm font-semibold">思考摘要</summary>
          <MarkdownMessage content={part.text} className={textClassName} />
        </details>
      );
    }

    if (String(part.type).startsWith("tool-")) {
      const toolName = String(part.type).replace(/^tool-/, "");
      if (toolName === "webSearch") {
        if (firstWebSearchIndex !== index) return null;
        if (hasPendingWebSearch || !webSearchOutputs.length) {
          return <ToolLoading key={index} label="正在检索外部资料" />;
        }
        return <WebSearchTool key={index} data={webSearchOutputs.length === 1 ? webSearchOutputs[0] : webSearchOutputs} />;
      }
      if (toolName === "askUserChoice" && "state" in part && part.state !== "output-available") {
        const choicePart = part as ToolPartShape;
        const hasRenderableOptions = hasRenderableChoiceOptions(choicePart.input?.options);
        if (choicePart.state === "input-streaming" || !hasRenderableOptions) {
          return <ToolLoading key={index} label="正在整理选项" />;
        }
        if (firstOpenChoiceIndex !== index) return <DeferredChoice key={index} />;
      }
      return <ToolPart key={index} part={part as ToolPartShape} toolName={toolName} addToolOutput={addToolOutput} />;
    }

    return null;
  });

  return <div className="min-w-0 space-y-4">{children}</div>;
}

export const MessagePartsRenderer = memo(MessagePartsRendererBase);

const markdownMessageClassName =
  "min-w-0 space-y-3 text-sm leading-7 [&_a]:break-words [&_a]:font-medium [&_a]:text-primary [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_code]:break-words [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.92em] [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold [&_ol]:ml-5 [&_ol]:list-decimal [&_ol]:space-y-1 [&_p]:m-0 [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3 [&_pre_code]:whitespace-pre [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-1";

const MarkdownMessage = memo(function MarkdownMessage({ content, className }: { content: string; className?: string }) {
  if (!content) return <p className={cn("text-sm text-muted-foreground", className)}>正在生成...</p>;
  return (
    <div className={cn(markdownMessageClassName, className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          table: ({ children }) => (
            <div className="max-w-full overflow-x-auto overscroll-x-contain">
              <table className="w-max min-w-[560px] border-collapse text-sm">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border bg-muted px-3 py-2 text-left font-semibold text-[#171717]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-3 py-2 align-top text-[#171717]">
              <span className="block whitespace-normal break-words">{children}</span>
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

export type ToolPartShape = {
  type: string;
  state?: string;
  toolCallId?: string;
  input?: any;
  output?: any;
};

function isWebSearchPart(part: UIMessagePart<any, any> | { type: string }): boolean {
  return String(part.type) === "tool-webSearch";
}

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
  if (toolName === "webSearch") return part.state === "output-available" ? <WebSearchTool data={part.output || part.input} /> : <ToolLoading label="正在检索外部资料" />;
  if (toolName === "publishHtmlReport") return part.state === "output-available" ? <PublishHtmlReportTool data={part.output || part.input} /> : <ToolLoading label="正在生成完整方案链接" />;

  return <GenericTool part={part} toolName={toolName} />;
}

function ToolLoading({ label }: { label: string }) {
  return (
    <Card className="border-[#eaeaea] bg-white p-4 shadow-[0_2px_2px_rgba(0,0,0,0.04)]">
      <strong className="block text-sm font-semibold text-[#171717]">{label}</strong>
      <p className="mt-1 text-sm text-[#666666]">稍等一下，结构化内容马上展示。</p>
    </Card>
  );
}

function DeferredChoice() {
  return (
    <Card className="border-[#eaeaea] bg-white p-4 shadow-[0_2px_2px_rgba(0,0,0,0.04)]">
      <strong className="block text-sm font-semibold text-[#171717]">还有一个问题待确认</strong>
      <p className="mt-1 text-sm text-[#666666]">先完成上面的选择，我再继续展示下一步。</p>
    </Card>
  );
}
