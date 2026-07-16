"use client";

import Link from "next/link";
import {
  ChevronsLeft,
  ChevronsRight,
  Menu,
  MessageSquareText,
  Pencil,
  Plus,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import type { AgentConversation } from "@/lib/agent-team/agents/types";
import { cn } from "@/lib/utils";
import { WishCreatorBrand } from "./WishCreatorBrand";
import { wishCreatorFocus } from "./styles";

type NavigationProps = {
  readonly activeConversationId?: string;
  readonly collapsed: boolean;
  readonly conversations: readonly AgentConversation[];
  readonly loading?: boolean;
  readonly mobileOpen?: boolean;
  readonly onCloseMobile?: () => void;
  readonly onCreate: () => void;
  readonly onDelete: (conversationId: string) => void;
  readonly onNavigate?: (path: string) => void;
  readonly onOpen: (conversation: AgentConversation) => void;
  readonly onRename: (conversationId: string, title: string) => void;
  readonly onToggle: () => void;
};

export function WishCreatorNavigation(props: NavigationProps) {
  return (
    <>
      <aside
        className={cn(
          "hidden h-full shrink-0 border-r border-[#202824] bg-[#080d0b]/98 transition-[width] duration-300 lg:flex lg:flex-col",
          props.collapsed ? "w-[72px]" : "w-[298px]",
        )}
      >
        <NavigationContent {...props} />
      </aside>
      {props.mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="关闭历史会话"
            className="absolute inset-0 bg-black/70"
            onClick={props.onCloseMobile}
            type="button"
          />
          <aside className="relative h-full w-[min(86vw,320px)] border-r border-[#29332e] bg-[#080d0b]">
            <NavigationContent {...props} collapsed={false} mobile />
          </aside>
        </div>
      ) : null}
    </>
  );
}

export function WishCreatorMobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      aria-label="打开历史会话"
      className={cn(
        wishCreatorFocus,
        "fixed left-3 top-3 z-30 grid h-10 w-10 place-items-center rounded-lg border border-[#29332e] bg-[#0d1411] text-[#b8ff22] lg:hidden",
      )}
      onClick={onClick}
      type="button"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}

function NavigationContent({ mobile = false, ...props }: NavigationProps & { mobile?: boolean }) {
  return (
    <div className="flex h-full min-h-0 flex-col px-4 py-5">
      <div className={cn("flex items-center", props.collapsed ? "justify-center" : "justify-between")}>
        <WishCreatorBrand compact={props.collapsed} />
        {mobile ? (
          <button aria-label="关闭" className="text-[#7c8881]" onClick={props.onCloseMobile} type="button">
            <X className="h-5 w-5" />
          </button>
        ) : (
          <button
            aria-label={props.collapsed ? "展开侧边栏" : "收起侧边栏"}
            className={cn(wishCreatorFocus, "grid h-9 w-9 place-items-center rounded-lg border border-[#29332e] text-[#7c8881] hover:text-[#b8ff22]")}
            onClick={props.onToggle}
            type="button"
          >
            {props.collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      <button
        className={cn(
          wishCreatorFocus,
          "mt-7 flex h-11 items-center justify-center gap-2 rounded-lg bg-[#b8ff22] font-semibold text-[#071007] hover:bg-[#c8ff50]",
          props.collapsed && "px-0",
        )}
        onClick={props.onCreate}
        type="button"
      >
        <Plus className="h-5 w-5" />
        {!props.collapsed ? <span>新建会话</span> : null}
      </button>

      {!props.collapsed ? (
        <div className="mt-9 min-h-0 flex-1 overflow-hidden">
          <p className="mb-4 text-xs font-medium tracking-wider text-[#748078]">历史会话</p>
          <div className="h-full space-y-1.5 overflow-y-auto pb-5 pr-1 [scrollbar-color:#344039_transparent]">
            {props.loading ? <p className="text-sm text-[#606c65]">正在读取…</p> : null}
            {!props.loading && props.conversations.length === 0 ? (
              <p className="text-sm text-[#606c65]">还没有会话，许个愿试试。</p>
            ) : null}
            {props.conversations.map((conversation) => (
              <ConversationRow
                active={conversation.id === props.activeConversationId}
                conversation={conversation}
                key={conversation.id}
                onDelete={props.onDelete}
                onOpen={props.onOpen}
                onRename={props.onRename}
              />
            ))}
          </div>
        </div>
      ) : <div className="flex-1" />}

      <Link
        className={cn(
          wishCreatorFocus,
          "flex h-11 items-center rounded-lg border-t border-[#202824] pt-3 text-sm text-[#9aa39e] hover:text-white",
          props.collapsed ? "justify-center" : "gap-3 px-1",
        )}
        href="/settings"
        onClick={props.onNavigate ? (event) => {
          event.preventDefault();
          props.onNavigate?.("/settings");
        } : undefined}
      >
        <Settings className="h-[18px] w-[18px]" />
        {!props.collapsed ? <span>设置</span> : null}
      </Link>
    </div>
  );
}

function ConversationRow({
  active,
  conversation,
  onDelete,
  onOpen,
  onRename,
}: {
  active: boolean;
  conversation: AgentConversation;
  onDelete: (conversationId: string) => void;
  onOpen: (conversation: AgentConversation) => void;
  onRename: (conversationId: string, title: string) => void;
}) {
  const count = Number(conversation.metadata?.messageCount ?? 0);
  return (
    <div className={cn("group rounded-lg border px-2 py-2", active ? "border-[#48552c] bg-[#111a13]" : "border-transparent hover:bg-[#0d1511]")}>
      <button className="flex w-full min-w-0 items-start gap-2 text-left" onClick={() => onOpen(conversation)} type="button">
        <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-[#77837c]" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm text-[#c8ceca]">{conversation.title}</span>
          <span className="mt-1 block text-[11px] text-[#667169]">{count > 0 ? `${count} 条消息` : "刚刚创建"}</span>
        </span>
      </button>
      <div className="mt-1 hidden justify-end gap-1 group-hover:flex group-focus-within:flex">
        <button
          aria-label="重命名会话"
          className="p-1 text-[#748078] hover:text-[#b8ff22]"
          onClick={() => {
            const title = window.prompt("新的会话名称", conversation.title)?.trim();
            if (title) onRename(conversation.id, title);
          }}
          type="button"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button aria-label="删除会话" className="p-1 text-[#748078] hover:text-red-400" onClick={() => onDelete(conversation.id)} type="button">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
