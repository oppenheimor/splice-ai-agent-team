"use client";

import Link from "next/link";
import { Coins, PanelLeftClose, PanelLeftOpen, Plus, Settings, Trash2 } from "lucide-react";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import type { AgentConversation } from "@/lib/agent-team/agents/types";
import type { UseCreditBalanceResult } from "@/lib/credits/useCreditBalance";
import { useCreditsHref } from "@/components/credits/CreditStatus";
import { cn } from "@/lib/utils";
import { DeepDiagnosisLogo } from "./DeepDiagnosisBrand";
import {
  deepDiagnosisFocusRing,
  deepDiagnosisMicroInteraction,
  deepDiagnosisMono,
} from "./styles";

type ConversationSidebarProps = {
  conversations: AgentConversation[];
  activeConversationId?: string;
  collapsed: boolean;
  loading?: boolean;
  onToggleCollapsed: () => void;
  onCreate: () => void;
  onOpen: (conversation: AgentConversation) => void;
  onDelete: (conversationId: string) => void;
  onRename: (conversationId: string, title: string) => void;
  credit?: UseCreditBalanceResult;
};

const MOBILE_DRAWER_SLIDE_DURATION_MS = 220;

export function ConversationSidebar({
  conversations,
  activeConversationId,
  collapsed,
  loading,
  onToggleCollapsed,
  onCreate,
  onOpen,
  onDelete,
  onRename,
  credit,
}: ConversationSidebarProps) {
  return (
    <aside
      className={cn(
        "relative hidden h-full shrink-0 overflow-hidden border-r border-[#eaeaea] bg-[#f7f7f7]/92 text-[#4d4d4d] shadow-[inset_-1px_0_0_rgba(255,255,255,0.75)] lg:flex lg:flex-col",
        "motion-safe:transition-[width,min-width,padding] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        collapsed ? "w-[64px] min-w-[64px] px-2 py-5" : "w-[288px] min-w-[288px] px-3 py-5",
      )}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-5 flex flex-col items-center",
          "motion-safe:transition-[opacity,transform] motion-safe:duration-200 motion-safe:ease-out motion-reduce:transition-none",
          collapsed
            ? "translate-x-0 opacity-100 delay-150"
            : "pointer-events-none -translate-x-2 opacity-0 delay-0",
        )}
        aria-hidden={!collapsed}
      >
        <IconButton
          ariaLabel="展开对话历史"
          onClick={onToggleCollapsed}
          title="展开"
        >
          <PanelLeftOpen className="h-4 w-4 cursor-pointer" aria-hidden="true" />
        </IconButton>
      </div>

      <div
        className={cn(
          "grid h-full w-[264px] min-w-[264px] grid-rows-[auto_auto_minmax(0,1fr)_auto]",
          "motion-safe:transition-[opacity,transform] motion-safe:duration-200 motion-safe:ease-out motion-reduce:transition-none",
          collapsed
            ? "pointer-events-none -translate-x-3 opacity-0 delay-0"
            : "translate-x-0 opacity-100 delay-100",
        )}
        aria-hidden={collapsed}
      >
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex min-w-0 items-center gap-2">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#e6e6e6] bg-white text-[#171717]">
              <DeepDiagnosisLogo className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className={`truncate text-[16px] font-semibold text-[#171717] ${deepDiagnosisMono}`}>
                深度诊断智能体
              </p>
            </div>
          </div>
          <IconButton
            ariaLabel="收起对话历史"
            onClick={onToggleCollapsed}
            title="收起"
          >
            <PanelLeftClose className="h-4 w-4 cursor-pointer" aria-hidden="true" />
          </IconButton>
        </div>

        <NewConversationButton onClick={onCreate} />

        <div className="mt-4 grid min-h-0 grid-rows-[minmax(0,1fr)] overflow-hidden">
          <SidebarConversationList
            conversations={conversations}
            activeConversationId={activeConversationId}
            loading={loading}
            onOpen={onOpen}
            onDelete={onDelete}
            onRename={onRename}
          />
        </div>
        <SidebarAccountActions credit={credit} />
      </div>
    </aside>
  );
}

function SidebarAccountActions({ credit }: { credit?: UseCreditBalanceResult }) {
  const creditsHref = useCreditsHref();
  const balance = credit?.balance?.balance;
  const balanceText = credit?.isLoading
    ? "读取中"
    : typeof balance === "number"
      ? balance.toLocaleString("zh-CN")
      : "查看";

  return (
    <div className="mt-4 grid gap-2 border-t border-[#e6e6e6] pt-3">
      <Link
        href={creditsHref}
        className={cn(
          deepDiagnosisFocusRing,
          deepDiagnosisMicroInteraction,
          "grid min-h-10 grid-cols-[1.75rem_minmax(0,1fr)] items-center gap-2 rounded-lg border border-[#e6e6e6] bg-white px-3 py-2 text-sm font-medium text-[#171717] hover:border-[#d4d4d4] hover:bg-[#fbfbfb]",
        )}
      >
        <Coins className="h-4 w-4 text-[#666666]" aria-hidden="true" />
        <span className="min-w-0 truncate">
          <span className={typeof balance === "number" ? "text-[#4d4d4d]" : "text-[#666666]"}>
            {balanceText}
          </span>
          {" 积分"}
        </span>
      </Link>
      <Link
        href="/settings"
        className={cn(
          deepDiagnosisFocusRing,
          deepDiagnosisMicroInteraction,
          "grid min-h-10 grid-cols-[1.75rem_minmax(0,1fr)] items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-[#4d4d4d] hover:border-[#e4e4e4] hover:bg-white/75 hover:text-[#171717]",
        )}
      >
        <Settings className="h-4 w-4 text-[#666666]" aria-hidden="true" />
        <span>设置</span>
      </Link>
    </div>
  );
}

function SidebarGroup({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("grid min-w-0 grid-rows-[auto_minmax(0,1fr)] gap-2", className)}>
      <h3 className={`px-1 text-[11px] font-medium uppercase text-[#8f8f8f] ${deepDiagnosisMono}`}>
        {title}
      </h3>
      <div className="relative min-h-0 overflow-hidden">{children}</div>
    </section>
  );
}

export function SidebarConversationList({
  conversations,
  activeConversationId,
  loading,
  onOpen,
  onDelete,
  onRename,
  credit,
}: {
  conversations: AgentConversation[];
  activeConversationId?: string;
  loading?: boolean;
  onOpen: (conversation: AgentConversation) => void;
  onDelete: (conversationId: string) => void;
  onRename: (conversationId: string, title: string) => void;
  credit?: UseCreditBalanceResult;
}) {
  return (
    <SidebarGroup title="历史列表" className="h-full min-h-0">
      <div className="absolute inset-0 overflow-y-auto overflow-x-hidden pr-1 [scrollbar-color:#d4d4d4_transparent] scrollbar-thin">
        {loading ? (
          <div className="space-y-2">
            <SidebarSkeleton />
            <SidebarSkeleton />
            <SidebarSkeleton />
          </div>
        ) : conversations.length > 0 ? (
          <div className="space-y-2 pb-2">
            {conversations.map((conversation) => (
              <SidebarSession
                key={conversation.id}
                session={conversation}
                active={conversation.id === activeConversationId}
                onOpen={onOpen}
                onDelete={onDelete}
                onRename={onRename}
              />
            ))}
          </div>
        ) : (
          <SidebarPlaceholder text="暂无历史会话" />
        )}
      </div>
    </SidebarGroup>
  );
}

function NewConversationButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className={cn(
        deepDiagnosisFocusRing,
        deepDiagnosisMicroInteraction,
        "mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#dcdcdc] bg-[#171717] px-3 text-sm font-medium text-white shadow-[0_10px_18px_-16px_rgba(0,0,0,0.5)] hover:bg-black cursor-pointer",
      )}
      onClick={onClick}
    >
      <span className="inline-flex -translate-x-0.5 items-center gap-1.5">
        <Plus className="h-[17px] w-[17px] stroke-[2.35]" aria-hidden="true" />
        <span>新建会话</span>
      </span>
    </button>
  );
}

function SidebarSession({
  session,
  active,
  onOpen,
  onDelete,
  onRename,
  credit,
}: {
  session: AgentConversation;
  active?: boolean;
  onOpen: (conversation: AgentConversation) => void;
  onDelete: (conversationId: string) => void;
  onRename: (conversationId: string, title: string) => void;
  credit?: UseCreditBalanceResult;
}) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(session.title);
  const messageCount = Number(session.metadata?.messageCount || session.messages.length || 0);

  function handleDelete(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    onDelete(session.id);
  }

  function submitRename() {
    const nextTitle = draftTitle.trim();
    setEditing(false);
    if (nextTitle && nextTitle !== session.title) {
      onRename(session.id, nextTitle);
    } else {
      setDraftTitle(session.title);
    }
  }

  function handleOpen(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    onOpen(session);
  }

  return (
    <Link
      href={`/deep-diagnosis/chat/${session.id}`}
      onClick={handleOpen}
      className={cn(
        deepDiagnosisFocusRing,
        deepDiagnosisMicroInteraction,
        "group grid min-w-0 grid-cols-[minmax(0,1fr)_2rem] items-center gap-2 rounded-lg px-3 py-3 text-left",
        active
          ? "border border-[#dcdcdc] bg-white text-[#171717] shadow-[0_1px_1px_rgba(0,0,0,0.02),0_12px_20px_-18px_rgba(0,0,0,0.24)]"
          : "border border-transparent text-[#4d4d4d] hover:border-[#e4e4e4] hover:bg-white/75 hover:text-[#171717]",
      )}
    >
      <span className="min-w-0">
        {editing ? (
          <input
            className={cn(
              deepDiagnosisFocusRing,
              "block h-6 w-full rounded border border-[#d4d4d4] bg-white px-1.5 text-sm font-medium text-[#171717]",
            )}
            value={draftTitle}
            autoFocus
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onChange={(event) => setDraftTitle(event.target.value)}
            onBlur={submitRename}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submitRename();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                setDraftTitle(session.title);
                setEditing(false);
              }
            }}
          />
        ) : (
          <span
            className="block truncate text-sm font-medium"
            title="双击重命名"
            onDoubleClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setDraftTitle(session.title);
              setEditing(true);
            }}
          >
            {session.title}
          </span>
        )}
        <span className="mt-1 block truncate text-xs text-[#8f8f8f]">
          {messageCount > 0 ? `${messageCount} 条消息` : "等待第一条消息"}
        </span>
      </span>
      <button
        type="button"
        className={cn(
          deepDiagnosisFocusRing,
          "grid h-8 w-8 place-items-center rounded-md text-[#8f8f8f] opacity-70 hover:bg-[#f2f2f2] hover:text-[#b42318] group-hover:opacity-100 cursor-pointer",
        )}
        aria-label={`删除 ${session.title}`}
        title="删除"
        onClick={handleDelete}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </Link>
  );
}

function IconButton({
  children,
  ariaLabel,
  title,
  onClick,
}: {
  children: ReactNode;
  ariaLabel: string;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        deepDiagnosisFocusRing,
        deepDiagnosisMicroInteraction,
        "grid h-9 w-9 place-items-center rounded-md border border-[#e6e6e6] bg-white text-[#4d4d4d] hover:border-[#d4d4d4] hover:text-[#171717]",
      )}
      aria-label={ariaLabel}
      title={title}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function SidebarPlaceholder({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[#dddddd] bg-white/52 px-3 py-4 text-sm text-[#8f8f8f]">
      {text}
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="h-[66px] animate-pulse rounded-lg border border-[#ededed] bg-white/64" />
  );
}

export function MobileConversationDrawer({
  open,
  conversations,
  activeConversationId,
  loading,
  onClose,
  onOpen,
  onDelete,
  onRename,
  credit,
}: {
  open: boolean;
  conversations: AgentConversation[];
  activeConversationId?: string;
  loading?: boolean;
  onClose: () => void;
  onOpen: (conversation: AgentConversation) => void;
  onDelete: (conversationId: string) => void;
  onRename: (conversationId: string, title: string) => void;
  credit?: UseCreditBalanceResult;
}) {
  const [shouldRender, setShouldRender] = useState(open);
  const [drawerVisible, setDrawerVisible] = useState(open);

  useEffect(() => {
    let animationFrame: number | undefined;
    let entranceFrame: number | undefined;
    let closeTimer: number | undefined;
    if (open) {
      animationFrame = window.requestAnimationFrame(() => {
        setShouldRender(true);
        entranceFrame = window.requestAnimationFrame(() => {
          setDrawerVisible(true);
        });
      });
      return () => {
        if (animationFrame !== undefined) window.cancelAnimationFrame(animationFrame);
        if (entranceFrame !== undefined) window.cancelAnimationFrame(entranceFrame);
      };
    }
    animationFrame = window.requestAnimationFrame(() => setDrawerVisible(false));
    closeTimer = window.setTimeout(() => setShouldRender(false), MOBILE_DRAWER_SLIDE_DURATION_MS);

    return () => {
      if (animationFrame !== undefined) window.cancelAnimationFrame(animationFrame);
      if (closeTimer !== undefined) window.clearTimeout(closeTimer);
    };
  }, [open]);

  if (!shouldRender) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 lg:hidden",
        drawerVisible ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!drawerVisible}
    >
      <button
        type="button"
        className={cn(
          "absolute inset-0 bg-[#171717]/24 motion-safe:transition-opacity motion-safe:duration-200 motion-safe:ease-out motion-reduce:transition-none",
          drawerVisible ? "opacity-100" : "opacity-0",
        )}
        aria-label="关闭对话历史"
        onClick={onClose}
      />
      <div
        className={cn(
          "absolute inset-y-0 left-0 flex w-[min(86vw,320px)] flex-col border-r border-[#eaeaea] bg-[#f7f7f7] px-3 py-5 shadow-[16px_0_36px_rgba(0,0,0,0.14)] will-change-transform motion-safe:transition-transform motion-safe:duration-[220ms] motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          drawerVisible ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <ConversationSidebarPanel
          conversations={conversations}
          activeConversationId={activeConversationId}
          loading={loading}
          onOpen={onOpen}
          onDelete={onDelete}
          onRename={onRename}
          onClose={onClose}
          credit={credit}
        />
      </div>
    </div>
  );
}

function ConversationSidebarPanel({
  conversations,
  activeConversationId,
  loading,
  onOpen,
  onDelete,
  onRename,
  onClose,
  credit,
}: {
  conversations: AgentConversation[];
  activeConversationId?: string;
  loading?: boolean;
  onOpen: (conversation: AgentConversation) => void;
  onDelete: (conversationId: string) => void;
  onRename: (conversationId: string, title: string) => void;
  onClose: () => void;
  credit?: UseCreditBalanceResult;
}) {
  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-[#e6e6e6] bg-white text-[#171717]">
            <DeepDiagnosisLogo className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className={`truncate text-[13px] font-semibold text-[#171717] ${deepDiagnosisMono}`}>
              深度诊断智能体
            </p>
          </div>
        </div>
        <IconButton ariaLabel="关闭对话历史" title="关闭" onClick={onClose}>
          <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
        </IconButton>
      </div>
      <div className="mt-4 grid min-h-0 grid-rows-[minmax(0,1fr)] overflow-hidden">
        <SidebarConversationList
          conversations={conversations}
          activeConversationId={activeConversationId}
          loading={loading}
          onOpen={(conversation) => {
            onClose();
            onOpen(conversation);
          }}
          onDelete={onDelete}
          onRename={onRename}
        />
      </div>
      <SidebarAccountActions credit={credit} />
    </div>
  );
}
