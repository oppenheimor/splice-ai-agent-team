"use client";

import type { ChatAddToolOutputFunction, UIMessage, UIMessagePart } from "ai";
import { Button as IslandButton, Card as IslandCard, Checkbox as IslandCheckbox, Icon as IslandIcon, Input as IslandInput } from "animal-island-ui";
import { Check, LoaderCircle } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { TreasureChartTool } from "./TreasureChartTool";
import {
  treasureGiftCard,
  treasureLinkButton,
  treasureMarkdown,
  treasureResultBody,
  treasureResultCard,
  treasureResultPill,
  treasureResultTones,
  treasureTimeline,
  treasureTimelineContent,
  treasureTimelineItem,
  treasureTimelineNode,
  treasureTimelineTime,
  treasureToolIcon,
  treasureToolPanel,
  treasureVideoCaption,
  treasureVideoIndex,
  treasureVideoMeta,
  treasureVideoScene,
  treasureWishCard,
} from "./styles";

type TreasureHuntMessagePartsRendererProps = {
  parts: UIMessagePart<any, any>[];
  addToolOutput: ChatAddToolOutputFunction<UIMessage>;
};

type ToolPartShape = {
  type: string;
  state?: string;
  toolCallId?: string;
  input?: any;
  output?: any;
};

export function TreasureHuntMessagePartsRenderer({ parts, addToolOutput }: TreasureHuntMessagePartsRendererProps) {
  const renderable = parts.length ? parts : [{ type: "text", text: "" }];
  let hasOpenChoice = false;

  return renderable.map((part, index) => {
    if (part.type === "text") return <IslandMarkdown key={index} content={part.text} />;

    if (part.type === "reasoning" && "text" in part && part.text) {
      return (
        <details key={index} className="mt-4 rounded-[24px] border-2 border-dashed border-[#d8c8a2] bg-[#fff8df]/85 p-4 text-[#725d42]">
          <summary className="cursor-pointer text-sm font-black">大喜的路线草稿</summary>
          <IslandMarkdown content={part.text} />
        </details>
      );
    }

    if (String(part.type).startsWith("tool-")) {
      const toolName = String(part.type).replace(/^tool-/, "");
      if (toolName === "askUserChoice" && "state" in part && part.state !== "output-available") {
        if (hasOpenChoice) return <IslandNotice key={index} title="还有一个小选择" body="先完成上面的选择，我再打开下一张藏宝图。" />;
        hasOpenChoice = true;
      }
      return <IslandToolPart key={index} part={part as ToolPartShape} toolName={toolName} addToolOutput={addToolOutput} />;
    }

    return null;
  });
}

function IslandMarkdown({ content }: { content: string }) {
  if (!content) return <p className="text-sm font-bold text-[#9f927d]">正在写下线索...</p>;
  return (
    <div className={treasureMarkdown}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

function IslandToolPart({
  part,
  toolName,
  addToolOutput,
}: {
  part: ToolPartShape;
  toolName: string;
  addToolOutput: ChatAddToolOutputFunction<UIMessage>;
}) {
  if (toolName === "askUserChoice") return <IslandChoiceTool part={part} addToolOutput={addToolOutput} />;
  if (toolName === "showCards") return part.state === "output-available" ? <IslandCardsTool data={part.output || part.input} /> : <IslandLoading label="正在摆放方案卡片" />;
  if (toolName === "showChecklist") return part.state === "output-available" ? <IslandChecklistTool data={part.output || part.input} /> : <IslandLoading label="正在整理行动清单" />;
  if (toolName === "showTimeline") return part.state === "output-available" ? <IslandTimelineTool data={part.output || part.input} /> : <IslandLoading label="正在画路线图" />;
  if (toolName === "showScorecard") return part.state === "output-available" ? <IslandScorecardTool data={part.output || part.input} /> : <IslandLoading label="正在计算惊喜指数" />;
  if (toolName === "showGiftList") return part.state === "output-available" ? <IslandGiftListTool data={part.output || part.input} /> : <IslandLoading label="正在整理采购清单" />;
  if (toolName === "showWishCard") return part.state === "output-available" ? <IslandWishCardTool data={part.output || part.input} /> : <IslandLoading label="正在写心声卡" />;
  if (toolName === "showVideoScript") return part.state === "output-available" ? <IslandVideoScriptTool data={part.output || part.input} /> : <IslandLoading label="正在编排照片视频" />;
  if (toolName === "showComparison") return part.state === "output-available" ? <IslandComparisonTool data={part.output || part.input} /> : <IslandLoading label="正在比较路线" />;
  if (toolName === "showChart") {
    return (
      <IslandPanel title={(part.output || part.input)?.title || "数据图表"} icon="icon-miles">
        {part.state === "output-available" ? <TreasureChartTool data={part.output || part.input} /> : <IslandLoading label="正在生成图表" compact />}
      </IslandPanel>
    );
  }

  return <IslandGenericTool part={part} toolName={toolName} />;
}

function IslandChoiceTool({
  part,
  addToolOutput,
}: {
  part: ToolPartShape;
  addToolOutput: ChatAddToolOutputFunction<UIMessage>;
}) {
  const input = part.input || {};
  const options = Array.isArray(input.options) ? input.options : [];
  const mode = input.mode === "multiple" ? "multiple" : "single";
  const allowOther = input.allowOther !== false;
  const [selected, setSelected] = useState<string[]>([]);
  const [otherText, setOtherText] = useState("");
  const answered = part.state === "output-available";
  const output = part.output || {};

  function toggle(optionId: string) {
    if (answered || options.find((option: any) => option.id === optionId)?.disabled) return;
    setSelected((current) => {
      if (mode === "single") return current.includes(optionId) ? [] : [optionId];
      if (current.includes(optionId)) return current.filter((id) => id !== optionId);
      const max = Number(input.maxSelections || options.length);
      if (current.length >= max) return current;
      return [...current, optionId];
    });
  }

  function submitChoice() {
    const trimmedOther = otherText.trim();
    if (!selected.length && !trimmedOther && input.required !== false) return;
    if (!part.toolCallId) return;
    addToolOutput({
      tool: "askUserChoice",
      toolCallId: part.toolCallId,
      output: {
        selected,
        otherText: trimmedOther || null,
        selectedLabels: options.filter((option: any) => selected.includes(option.id)).map((option: any) => option.label),
      },
    });
  }

  if (answered) {
    const labels =
      Array.isArray(output.selectedLabels) && output.selectedLabels.length
        ? output.selectedLabels
        : options.filter((option: any) => output.selected?.includes(option.id)).map((option: any) => option.label);
    return <IslandNotice title={input.question || "已完成选择"} body={[...labels, output.otherText].filter(Boolean).join("、") || "已提交选择"} icon="icon-variant" />;
  }

  return (
    <IslandPanel title={input.question || "请选择一个方向"} description={mode === "multiple" ? "可以多选" : "选择一个最接近的答案"} icon="icon-map">
      {mode === "single" ? (
        <div className="grid gap-3">
          {options.map((option: any) => (
            <button
              key={option.id}
              type="button"
              disabled={option.disabled}
              onClick={() => toggle(option.id)}
              className={cn(
                "rounded-[22px] border-2 border-[#d8c8a2] bg-[#fffdf2] px-4 py-3 text-left font-bold text-[#725d42] shadow-[0_4px_0_#d8c8a2] transition disabled:opacity-50",
                selected.includes(option.id) && "border-[#19c8b9] bg-[#e6f9f6] shadow-[0_4px_0_#50b9ab]",
              )}
            >
              <span className="flex items-start gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-[#19c8b9] bg-white">
                  {selected.includes(option.id) ? <Check className="h-4 w-4 text-[#19c8b9]" /> : null}
                </span>
                <span>
                  <strong className="block text-sm">{option.label}</strong>
                  {option.description ? <small className="mt-1 block text-xs leading-5 text-[#9f927d]">{option.description}</small> : null}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <IslandCheckbox
          direction="vertical"
          size="large"
          value={selected}
          options={options.map((option: any) => ({ label: option.label, value: option.id, disabled: option.disabled }))}
          onChange={(values) => setSelected(values.map(String))}
        />
      )}
      {allowOther ? (
        <div className="mt-4">
          <IslandInput
            size="large"
            allowClear
            value={otherText}
            onChange={(event) => setOtherText(event.target.value)}
            onClear={() => setOtherText("")}
            placeholder={input.otherLabel || "还有别的想法？写在这里"}
          />
        </div>
      ) : null}
      <div className="mt-4">
        <IslandButton type="primary" size="large" onClick={submitChoice} disabled={!selected.length && !otherText.trim() && input.required !== false}>
          交给大喜
        </IslandButton>
      </div>
    </IslandPanel>
  );
}

function IslandCardsTool({ data }: { data: any }) {
  const cards = Array.isArray(data?.cards) ? data.cards : [];
  return (
    <IslandPanel title={stripLeadingIcon(data?.title || "推荐方案")} description={data?.description} icon="icon-diy">
      <div className="grid gap-4 lg:grid-cols-2">
        {cards.map((card: any, index: number) => (
          <article key={`${card.title}-${index}`} className={cn(treasureResultCard, resultTone(index))}>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                {card.badge ? <span className={treasureResultPill}>{card.badge}</span> : null}
                {card.price ? <span className={treasureResultPill}>{card.price}</span> : null}
              </div>
              <h4 className="text-xl font-black leading-snug">{stripLeadingIcon(card.title)}</h4>
              {card.subtitle ? <p className={cn(treasureResultBody, "text-sm font-bold")}>{card.subtitle}</p> : null}
              <p className={cn(treasureResultBody, "text-[15px] font-semibold leading-7")}>{card.description}</p>
              {Array.isArray(card.bullets) && card.bullets.length ? (
                <ul className={cn(treasureResultBody, "space-y-1 text-[15px] font-semibold leading-7")}>
                  {card.bullets.map((bullet: string) => (
                    <li key={bullet}>· {bullet}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </IslandPanel>
  );
}

function IslandChecklistTool({ data }: { data: any }) {
  const items = Array.isArray(data?.items) ? data.items : [];
  return (
    <IslandPanel title={stripLeadingIcon(data?.title || "行动清单")} description={data?.description} icon="icon-design">
      <div className="grid gap-3">
        {items.map((item: any, index: number) => (
          <div key={`${item.label}-${index}`} className="rounded-[22px] border-2 border-[#e8e2d6] bg-[#fffdf2] p-4 shadow-[0_3px_0_#d8c8a2]">
            <div className="flex gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#19c8b9] text-sm font-black text-white">{index + 1}</span>
              <span>
                <strong className="block text-sm font-black text-[#725d42]">{stripLeadingIcon(item.label)}</strong>
                {item.detail ? <small className="mt-1 block text-xs font-bold leading-5 text-[#9f927d]">{item.detail}</small> : null}
              </span>
            </div>
          </div>
        ))}
      </div>
    </IslandPanel>
  );
}

function IslandTimelineTool({ data }: { data: any }) {
  const steps = Array.isArray(data?.steps) ? data.steps : [];
  return (
    <IslandPanel title={stripLeadingIcon(data?.title || "路线图")} description={data?.description} icon="icon-map">
      <div className={treasureTimeline}>
        {steps.map((step: any, index: number) => (
          <article key={`${step.title}-${index}`} className={treasureTimelineItem}>
            <div className={treasureTimelineNode}>
              <span>{index + 1}</span>
            </div>
            <div className={treasureTimelineContent}>
              <div className="flex flex-wrap items-center gap-2">
                <span className={treasureTimelineTime}>{step.time || `第 ${index + 1} 步`}</span>
                <strong className="min-w-0 text-base font-black leading-snug text-[#725d42]">{stripLeadingIcon(step.title)}</strong>
              </div>
              <p className="mt-3 text-[15px] font-medium leading-7 text-[#8f806b]">{step.detail}</p>
              {step.owner ? <small className="mt-2 block text-xs font-bold text-[#725d42]">{step.owner}</small> : null}
            </div>
          </article>
        ))}
      </div>
    </IslandPanel>
  );
}

function IslandScorecardTool({ data }: { data: any }) {
  const dimensions = Array.isArray(data?.dimensions) ? data.dimensions : [];
  const overall = typeof data?.overall === "number" ? data.overall : 0;
  return (
    <IslandPanel title={stripLeadingIcon(data?.title || "惊喜指数")} description={data?.summary} icon="icon-miles">
      <div className="mb-4 flex items-end gap-2 text-[#725d42]">
        <strong className="text-5xl font-black">{Math.round(overall)}</strong>
        <span className="pb-2 text-sm font-black">综合分</span>
      </div>
      <div className="grid gap-3">
        {dimensions.map((dimension: any) => {
          const max = Number(dimension.max) || 10;
          const percent = Math.max(0, Math.min(100, (Number(dimension.score) / max) * 100));
          return (
            <div key={dimension.label} className="grid gap-1.5">
              <span className="flex justify-between gap-3 text-sm font-black text-[#725d42]">
                <b>{dimension.label}</b>
                <em>
                  {dimension.score}/{max}
                </em>
              </span>
              <div className="h-4 overflow-hidden rounded-full border-2 border-[#d8c8a2] bg-[#fffdf2]">
                <i className="block h-full rounded-full bg-[#19c8b9]" style={{ width: `${percent}%` }} />
              </div>
              {dimension.note ? <small className="text-xs font-bold leading-5 text-[#9f927d]">{dimension.note}</small> : null}
            </div>
          );
        })}
      </div>
    </IslandPanel>
  );
}

function IslandComparisonTool({ data }: { data: any }) {
  const criteria = Array.isArray(data?.criteria) ? data.criteria : [];
  const options = Array.isArray(data?.options) ? data.options : [];
  return (
    <IslandPanel title={stripLeadingIcon(data?.title || "路线对比")} icon="icon-variant">
      <div className="grid gap-4 lg:grid-cols-2">
        {options.map((option: any, index: number) => (
          <article key={option.name} className={cn(treasureResultCard, resultTone(index))}>
            <h4 className="text-base font-black">{stripLeadingIcon(option.name)}</h4>
            <p className={cn(treasureResultBody, "mt-2 text-sm font-semibold leading-6")}>{option.summary}</p>
            {criteria.length ? (
              <div className={cn(treasureResultBody, "mt-3 grid gap-1.5 text-sm font-bold")}>
                {criteria.map((criterion: string) => (
                  <span key={criterion} className="flex items-center justify-between gap-3">
                    <b>{criterion}</b>
                    <em>{option.scores?.[criterion] ?? "-"}</em>
                  </span>
                ))}
              </div>
            ) : null}
            {option.recommendation ? <strong className="mt-3 block text-sm">{option.recommendation}</strong> : null}
          </article>
        ))}
      </div>
    </IslandPanel>
  );
}

function IslandGiftListTool({ data }: { data: any }) {
  const items = Array.isArray(data?.items) ? data.items : [];
  return (
    <IslandPanel title={stripLeadingIcon(data?.title || "礼物与物料清单")} description={data?.description || data?.totalBudget} icon="icon-shopping">
      <div className="grid gap-3">
        {items.map((item: any, index: number) => (
          <article key={`${item.name}-${index}`} className={treasureGiftCard}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="text-base font-black leading-snug text-[#725d42]">{stripLeadingIcon(item.name)}</h4>
                {item.budget ? <p className="mt-1 text-sm font-black text-[#0aa99e]">{item.budget}</p> : null}
              </div>
              <span className="rounded-full bg-[#e6f9f6] px-3 py-1 text-xs font-black text-[#0aa99e]">#{index + 1}</span>
            </div>
            {item.reason ? <p className="mt-3 text-sm font-medium leading-6 text-[#8f806b]">{item.reason}</p> : null}
            <div className="mt-3 grid gap-2 text-xs font-bold text-[#725d42]">
              {item.whereToBuy ? <span>购买渠道：{item.whereToBuy}</span> : null}
              {item.searchKeywords ? <span>搜索关键词：{item.searchKeywords}</span> : null}
              {item.backup ? <span>替代方案：{item.backup}</span> : null}
              {item.note ? <span>注意：{item.note}</span> : null}
            </div>
            {item.searchUrl ? (
              <a className={treasureLinkButton} href={item.searchUrl} target="_blank" rel="noreferrer">
                去搜索
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </IslandPanel>
  );
}

function IslandWishCardTool({ data }: { data: any }) {
  return (
    <IslandPanel title={stripLeadingIcon(data?.title || "心声卡")} description={data?.style ? `风格：${data.style}` : undefined} icon="icon-design">
      <article className={treasureWishCard}>
        {data?.recipient ? <p className="text-sm font-black text-[#0aa99e]">To {data.recipient}</p> : null}
        <div className="mt-3 whitespace-pre-wrap text-[15px] font-medium leading-8 text-[#725d42]">{data?.body || ""}</div>
        {data?.signature ? <p className="mt-5 text-right text-sm font-black text-[#725d42]">{data.signature}</p> : null}
      </article>
      {data?.writingTip ? <p className="mt-3 rounded-[18px] bg-[#fffdf2] px-4 py-3 text-sm font-medium leading-6 text-[#8f806b]">手写提示：{data.writingTip}</p> : null}
    </IslandPanel>
  );
}

function IslandVideoScriptTool({ data }: { data: any }) {
  const scenes = Array.isArray(data?.scenes) ? data.scenes : [];
  const tips = Array.isArray(data?.tips) ? data.tips : [];
  return (
    <IslandPanel
      title={stripLeadingIcon(data?.title || "照片回顾视频脚本")}
      description={[data?.duration, data?.music, data?.editingApp].filter(Boolean).join(" · ")}
      icon="icon-camera"
    >
      <div className="grid gap-3.5 max-sm:gap-3">
        {scenes.map((scene: any, index: number) => (
          <article key={`${scene.timeRange}-${index}`} className={treasureVideoScene}>
            <div className={treasureVideoIndex}>{index + 1}</div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={treasureTimelineTime}>{scene.timeRange || `${index + 1}`}</span>
                <h4 className="min-w-0 text-base font-black leading-snug text-[#725d42]">{stripLeadingIcon(scene.photo)}</h4>
              </div>
              <blockquote className={treasureVideoCaption}>{scene.caption}</blockquote>
              <div className="mt-3 grid gap-2">
                {scene.motion ? (
                  <p className={treasureVideoMeta}>
                    <span>镜头</span>
                    <b>{scene.motion}</b>
                  </p>
                ) : null}
                {scene.note ? (
                  <p className={treasureVideoMeta}>
                    <span>备注</span>
                    <b>{scene.note}</b>
                  </p>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
      {tips.length ? (
        <ul className="mt-4 space-y-1 rounded-[18px] bg-[#fffdf2] px-4 py-3 text-sm font-medium leading-6 text-[#8f806b]">
          {tips.map((tip: string) => (
            <li key={tip}>· {tip}</li>
          ))}
        </ul>
      ) : null}
    </IslandPanel>
  );
}

function IslandGenericTool({ part, toolName }: { part: ToolPartShape; toolName: string }) {
  return (
    <IslandPanel title={toolName} description={part.state === "output-available" ? "已完成" : "处理中"} icon="icon-chat">
      {part.output ? <pre className="overflow-auto rounded-[18px] bg-[#fffdf2] p-3 text-xs text-[#725d42]">{JSON.stringify(part.output, null, 2)}</pre> : null}
    </IslandPanel>
  );
}

function IslandPanel({ title, description, icon, children }: { title: string; description?: string; icon: React.ComponentProps<typeof IslandIcon>["name"]; children: React.ReactNode }) {
  return (
    <section className={treasureToolPanel}>
      <div className="mb-4 flex items-start gap-3">
        <span className={treasureToolIcon}>
          <IslandIcon name={icon} size={30} bounce />
        </span>
        <div className="min-w-0">
          <strong className="block text-lg font-black leading-snug text-[#725d42]">{title}</strong>
          {description ? <p className="mt-1 text-[15px] font-medium leading-7 text-[#9f927d]">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function stripLeadingIcon(value: unknown): string {
  if (typeof value !== "string") return String(value ?? "");
  return value.replace(/^[\s\p{Extended_Pictographic}\p{Emoji_Presentation}\uFE0F\u200D]+/u, "").trimStart();
}

function IslandLoading({ label, compact }: { label: string; compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 text-sm font-black text-[#725d42]">
        <LoaderCircle className="h-4 w-4 animate-spin text-[#19c8b9]" />
        {label}
      </div>
    );
  }
  return (
    <IslandNotice title={label} body="稍等一下，结构化内容马上展示。" icon="icon-chat">
      <LoaderCircle className="h-5 w-5 animate-spin text-[#19c8b9]" />
    </IslandNotice>
  );
}

function IslandNotice({ title, body, icon = "icon-chat", children }: { title: string; body: string; icon?: React.ComponentProps<typeof IslandIcon>["name"]; children?: React.ReactNode }) {
  return (
    <IslandCard color="app-yellow" className="mt-4">
      <div className="flex items-center gap-3">
        {children || <IslandIcon name={icon} size={36} bounce />}
        <div>
          <strong className="block text-sm font-black">{title}</strong>
          <p className="mt-1 text-sm font-bold leading-6">{body}</p>
        </div>
      </div>
    </IslandCard>
  );
}

function resultTone(index: number) {
  return treasureResultTones[index % treasureResultTones.length];
}
