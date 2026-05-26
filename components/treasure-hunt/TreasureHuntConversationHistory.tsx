"use client";

import { Menu, Trash2, X } from "lucide-react";
import type { AgentConversation } from "@/lib/agent-team/agents/types";
import { cn } from "@/lib/utils";
import {
  treasureHistoryRoundButton,
  treasureScrollbarHidden,
} from "./styles";

type TreasureHuntConversationListProps = {
  conversations: AgentConversation[];
  activeConversationId?: string;
  onOpen: (conversation: AgentConversation) => void;
  onDelete: (conversationId: string) => void;
};

type TreasureHuntHistoryDrawerProps = TreasureHuntConversationListProps & {
  open: boolean;
  onClose: () => void;
};

type TreasureHuntHistoryButtonProps = {
  className?: string;
  ariaLabel?: string;
  onClick: () => void;
};

export function TreasureHuntHistoryButton({
  className,
  ariaLabel = "查看会话历史",
  onClick,
}: TreasureHuntHistoryButtonProps) {
  return (
    <button
      type="button"
      className={className}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}

export function TreasureHuntConversationList({
  conversations,
  activeConversationId,
  onOpen,
  onDelete,
}: TreasureHuntConversationListProps) {
  return (
    <div className="grid min-w-0 gap-3">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className={cn(
            "grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-[24px] border-2 border-[#d8c8a2] bg-[#fffdf2] px-3 py-3 shadow-[0_3px_0_#d8c8a2] transition hover:-translate-y-0.5",
            conversation.id === activeConversationId &&
              "border-[#19c8b9] bg-[#e6f9f6] shadow-[0_3px_0_#50b9ab]",
          )}
        >
          <button
            type="button"
            className="min-w-0 text-left"
            onClick={() => onOpen(conversation)}
          >
            <span className="block min-w-0 truncate text-sm font-black">
              {conversation.title}
            </span>
            <span className="mt-1 block text-xs text-[#9f927d]">
              {conversation.messages.length} 条线索
            </span>
          </button>
          <button
            type="button"
            className={cn(treasureHistoryRoundButton, "h-9 w-9")}
            aria-label="删除会话"
            onClick={() => onDelete(conversation.id)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function TreasureHuntHistoryDrawer({
  open,
  conversations,
  activeConversationId,
  onOpen,
  onDelete,
  onClose,
}: TreasureHuntHistoryDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] animate-in fade-in duration-200">
      <button
        type="button"
        className="absolute inset-0 animate-in fade-in bg-[#3d3428]/35 duration-200"
        aria-label="关闭会话历史"
        onClick={onClose}
      />
      <aside className="absolute inset-y-0 left-0 flex w-[min(82vw,320px)] min-w-0 animate-in flex-col gap-4 bg-[#f7f3df]/96 p-4 shadow-[16px_0_36px_rgba(93,75,45,0.2)] slide-in-from-left duration-300 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <strong className="text-lg font-black">会话历史</strong>
          <button
            type="button"
            className={cn(treasureHistoryRoundButton, "h-[42px] w-[42px]")}
            aria-label="关闭"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className={cn(treasureScrollbarHidden, "min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden pr-1")}>
          <TreasureHuntConversationList
            conversations={conversations}
            activeConversationId={activeConversationId}
            onOpen={onOpen}
            onDelete={onDelete}
          />
        </div>
      </aside>
    </div>
  );
}
