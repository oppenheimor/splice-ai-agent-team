import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  MessageSquareText,
  SearchCheck,
  Send,
  SquareUserRound,
} from "lucide-react";
import { quizQuestions } from "@/lib/requirements-diagnosis/quiz";
import type { DimensionScore } from "@/lib/requirements-diagnosis/types";
import type { DiagnosisDemoStyle } from "./demo-data";
import { demoResult } from "./demo-data";

type DiagnosisDemoWallProps = {
  style: DiagnosisDemoStyle;
  page: "home" | "quiz" | "result" | "chat";
};

const styleLinks = [
  ["demo-consulting", "Mono"],
  ["demo-instrument", "Finance"],
  ["demo-boardroom", "Editorial"],
] as const;

export function DiagnosisDemoWall({ style, page }: DiagnosisDemoWallProps) {
  return (
    <main className={style.shell}>
      <section className="mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-center lg:px-8">
        <DesktopBrief style={style} page={page} />
        <PhoneFrame style={style}>
          <PhoneScreen style={style} page={page} />
        </PhoneFrame>
      </section>
    </main>
  );
}

function DesktopBrief({ style, page }: { style: DiagnosisDemoStyle; page: DiagnosisDemoWallProps["page"] }) {
  return (
    <section className="order-2 space-y-7 pb-4 lg:order-1 lg:pb-0">
      <div className="flex flex-wrap gap-2">
        {styleLinks.map(([id, label]) => (
          <Link key={id} href={buildDemoStyleHref(id, page)} className={`px-4 py-2 text-sm font-semibold transition ${style.id === id ? style.primaryButton : style.secondaryButton}`}>
            {label}
          </Link>
        ))}
      </div>
      <div className="max-w-3xl space-y-5">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] opacity-60">Requirements Diagnosis Demo Wall</p>
        <h1 className="max-w-4xl text-5xl font-black leading-none tracking-tight text-balance md:text-7xl">{style.label}</h1>
        <p className="max-w-2xl text-base leading-8 opacity-72 md:text-lg">{style.thesis}</p>
      </div>
      <div className="grid max-w-3xl gap-3 sm:grid-cols-3">
        {[
          ["问卷优先", "先让第一屏像真实手机产品，再扩展报告和对话。"],
          ["控件语言", "选项、CTA、状态块共用同一种触控质感。"],
          ["静态隔离", "不读库、不调接口、不污染正式功能。"],
        ].map(([title, desc]) => (
          <div key={title} className={`p-4 ${style.surface}`}>
            <strong className="block text-sm">{title}</strong>
            <p className="mt-2 text-sm leading-6 opacity-65">{desc}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {[
          ["首页", style.basePath],
          ["问卷", `${style.basePath}/quiz`],
          ["结果", `${style.basePath}/result`],
          ["Chat", `${style.basePath}/chat/demo-record-1`],
        ].map(([label, href]) => (
          <Link key={href} href={href} className={`px-4 py-2 text-sm font-semibold transition ${style.secondaryButton}`}>
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}

function buildDemoStyleHref(styleId: string, page: DiagnosisDemoWallProps["page"]): string {
  const basePath = `/requirements-diagnosis/${styleId}`;
  if (page === "home") return basePath;
  if (page === "chat") return `${basePath}/chat/demo-record-1`;
  return `${basePath}/${page}`;
}

function PhoneFrame({ style, children }: { style: DiagnosisDemoStyle; children: React.ReactNode }) {
  return (
    <section className="order-1 mx-auto w-full max-w-[390px] lg:order-2">
      <div className="rounded-[42px] bg-black/25 p-2 shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
        <div className={`relative h-[812px] overflow-hidden ${style.raised}`}>
          <StatusBar />
          {children}
          <div className="absolute bottom-2 left-1/2 h-1 w-28 -translate-x-1/2 rounded-full bg-black/20" />
        </div>
      </div>
    </section>
  );
}

function StatusBar() {
  return (
    <div className="absolute inset-x-0 top-0 z-20 flex h-12 items-center justify-between px-8 text-sm font-black">
      <span>9:41</span>
      <span className="flex items-center gap-1">
        <i className="h-3 w-4 rounded-sm border-2 border-current" />
        <i className="h-3 w-1 rounded-full bg-current" />
      </span>
    </div>
  );
}

function PhoneScreen({ style, page }: { style: DiagnosisDemoStyle; page: DiagnosisDemoWallProps["page"] }) {
  if (page === "quiz") return <QuizScreen style={style} />;
  if (page === "result") return <ResultScreen style={style} />;
  if (page === "chat") return <ChatScreen style={style} />;
  return <HomeScreen style={style} />;
}

function ScreenScaffold({ style, title, eyebrow, children }: { style: DiagnosisDemoStyle; title: string; eyebrow?: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col px-7 pb-8 pt-16">
      <header className="grid grid-cols-[36px_minmax(0,1fr)_36px] items-start gap-4">
        <Link href={style.basePath} className={`grid h-9 w-9 place-items-center ${style.secondaryButton}`} aria-label="返回样品首页">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          {eyebrow ? <span className={style.outlineBadge}>{eyebrow}</span> : null}
          <h2 className={`mt-3 text-[34px] font-black leading-[1.02] tracking-tight ${style.strong}`}>{title}</h2>
        </div>
        <span aria-hidden="true" />
      </header>
      {children}
    </div>
  );
}

function HomeScreen({ style }: { style: DiagnosisDemoStyle }) {
  return (
    <div className="flex h-full flex-col px-7 pb-8 pt-16">
      <section className="mt-14">
        <h2 className={`text-[46px] font-black leading-[0.96] tracking-tight ${style.strong}`}>
          不给你答案，
          <span className={`block ${style.accentText}`}>只给你镜子。</span>
        </h2>
        <p className={`mt-5 text-sm leading-7 ${style.muted}`}>24 道题建立企业 AI 落地诊断，再把结果带入深度诊断对话。</p>
      </section>
      <div className="mt-10 grid gap-3">
        {[
          ["01", "经营画像", "商业视野、判断方式、组织落地。"],
          ["02", "落地画像", "落地阶段、认知宽度、刚需方向。"],
          ["03", "深度诊断", "带着结果进入业务转型对话。"],
        ].map(([no, title, desc]) => (
          <div key={title} className={`flex items-center gap-4 p-4 ${style.metric}`}>
            <span className="text-xl font-black" style={{ color: style.accent }}>
              {no}
            </span>
            <span>
              <strong className="block text-sm">{title}</strong>
              <small className={style.muted}>{desc}</small>
            </span>
          </div>
        ))}
      </div>
      <div className="mt-auto grid gap-3">
        <Link href={`${style.basePath}/quiz`} className={`flex h-14 items-center justify-center gap-2 text-sm font-bold ${style.primaryButton}`}>
          开始评测
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function QuizScreen({ style }: { style: DiagnosisDemoStyle }) {
  const question = quizQuestions[0];
  return (
    <ScreenScaffold style={style} eyebrow="01 / 13" title="请选择你的第一反应">
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-black/10">
        <div className="h-full w-[8%] rounded-full" style={{ backgroundColor: style.accent }} />
      </div>
      <p className={`mt-7 text-sm leading-6 ${style.muted}`}>{question.dimension}</p>
      <h3 className={`mt-2 text-[25px] font-black leading-tight ${style.strong}`}>{question.prompt}</h3>
      <div className="mt-8 grid gap-4">
        {question.options.map((option, index) => (
          <OptionPill key={option.value} style={style} selected={index === 1} label={`${option.value}. ${option.label}`} />
        ))}
      </div>
      <div className="mt-auto">
        <Link href={`${style.basePath}/result`} className={`flex h-14 items-center justify-center gap-2 text-sm font-bold ${style.primaryButton}`}>
          生成报告
          <Check className="h-4 w-4" />
        </Link>
      </div>
    </ScreenScaffold>
  );
}

function OptionPill({ style, selected, label }: { style: DiagnosisDemoStyle; selected: boolean; label: string }) {
  return (
    <div className={`flex min-h-[58px] items-center gap-3 px-4 text-sm font-bold transition ${selected ? style.ink : style.metric}`}>
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${selected ? "bg-white/90 text-[#2e2f2d]" : "bg-black/8 text-transparent"}`}>
        {selected ? <Check className="h-4 w-4" /> : null}
      </span>
      <span>{label}</span>
    </div>
  );
}

function ResultScreen({ style }: { style: DiagnosisDemoStyle }) {
  const scores = Object.values(demoResult.dimensionScores);
  return (
    <ScreenScaffold style={style} eyebrow="诊断结论" title={demoResult.operatorTypeName}>
      <p className={`mt-4 text-sm leading-7 ${style.muted}`}>{demoResult.operatorTypeDefinition}</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <MiniMetric style={style} label="AI 落地阶段" value={`${demoResult.aiAdoptionStage}`} />
        <MiniMetric style={style} label="优先切入场景" value={demoResult.justNeedLabel} />
      </div>
      <div className={`mt-5 p-4 ${style.surface}`}>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" style={{ color: style.accent }} />
          <strong className="text-sm">经营决策画像</strong>
        </div>
        <div className="mt-4 grid gap-3">
          {scores.map((score) => (
            <ScoreBar key={score.code} style={style} score={score} />
          ))}
        </div>
      </div>
      <div className={`mt-5 p-4 ${style.metric}`}>
        <strong className="block text-sm">本周动作</strong>
        <p className={`mt-2 text-sm leading-6 ${style.muted}`}>{demoResult.narrative?.actionPlan.week || "叙事尚未生成"}</p>
      </div>
      <div className="mt-auto">
        <Link href={`${style.basePath}/chat/demo-record-1`} className={`flex h-14 items-center justify-center gap-2 text-sm font-bold ${style.primaryButton}`}>
          深度诊断
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </ScreenScaffold>
  );
}

function ChatScreen({ style }: { style: DiagnosisDemoStyle }) {
  return (
    <div className="flex h-full flex-col px-5 pb-6 pt-16">
      <header className="flex items-center justify-between gap-3 px-2">
        <Link href={style.basePath} className={`grid h-9 w-9 place-items-center ${style.secondaryButton}`} aria-label="返回样品首页">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="text-center">
          <strong className={`block text-lg ${style.strong}`}>需求诊断 Agent</strong>
          <small className={style.muted}>{demoResult.operatorTypeName}</small>
        </div>
        <span className={`grid h-9 w-9 place-items-center ${style.secondaryButton}`}>
          <MessageSquareText className="h-4 w-4" />
        </span>
      </header>
      <section className="mt-6 min-h-0 flex-1 space-y-4 overflow-hidden">
        <Message style={style} role="assistant">我已经读到你的诊断结果：{demoResult.operatorTypeName}。先定位一个最值得改造的业务环节。</Message>
        <Message style={style} role="user">我想先从客户跟进和报价流程开始，但担心团队接受不了太复杂的系统。</Message>
        <div className={`p-4 ${style.surface}`}>
          <div className="flex items-center gap-2">
            <SearchCheck className="h-4 w-4" style={{ color: style.accent }} />
            <strong className="text-sm">结构化判断</strong>
          </div>
          <div className="mt-3 grid gap-2">
            <MiniMetric style={style} label="优先级" value="客户跟进" />
            <MiniMetric style={style} label="建议周期" value="14 天" />
          </div>
        </div>
        <Message style={style} role="assistant">先做一条轻量闭环：线索进入、客户分层、报价草稿、跟进提醒、成交复盘。</Message>
      </section>
      <footer className="mt-4 grid grid-cols-[minmax(0,1fr)_52px] gap-3">
        <div className={`flex h-12 items-center px-4 text-sm ${style.metric} ${style.muted}`}>描述你的业务环节...</div>
        <button className={`grid h-12 place-items-center ${style.primaryButton}`} aria-label="发送">
          <Send className="h-4 w-4" />
        </button>
      </footer>
    </div>
  );
}

function MiniMetric({ style, label, value }: { style: DiagnosisDemoStyle; label: string; value: string }) {
  return (
    <div className={style.metric}>
      <small className={style.muted}>{label}</small>
      <strong className={`mt-1 block text-sm ${style.strong}`}>{value}</strong>
    </div>
  );
}

function ScoreBar({ style, score }: { style: DiagnosisDemoStyle; score: DimensionScore }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span>{score.label}</span>
        <span className={style.muted}>{score.dominantLabel}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-black/10">
        <div className="h-full rounded-full" style={{ width: `${Math.max(score.left, score.right)}%`, backgroundColor: style.accent }} />
      </div>
    </div>
  );
}

function Message({ style, role, children }: { style: DiagnosisDemoStyle; role: "assistant" | "user"; children: React.ReactNode }) {
  const isUser = role === "user";
  return (
    <div className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser ? (
        <span className={`grid h-8 w-8 shrink-0 place-items-center ${style.secondaryButton}`}>
          <Bot className="h-4 w-4" />
        </span>
      ) : null}
      <div className={`max-w-[78%] px-4 py-3 text-sm leading-6 ${isUser ? style.ink : style.surface}`}>{children}</div>
      {isUser ? (
        <span className={`grid h-8 w-8 shrink-0 place-items-center ${style.secondaryButton}`}>
          <SquareUserRound className="h-4 w-4" />
        </span>
      ) : null}
    </div>
  );
}
