"use client";

import { PanelLeftClose, PanelLeftOpen, Plus } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DeepDiagnosisLogo } from "./DeepDiagnosisBrand";
import {
  deepDiagnosisFocusRing,
  deepDiagnosisMicroInteraction,
} from "./styles";

export function MobileConversationNavbar({
  sidebarOpen,
  onToggleSidebar,
  onCreate,
}: {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onCreate: () => void;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-end border-b border-[#e7e7e7] bg-[#fafafa]/92 px-4 shadow-[0_1px_0_rgba(255,255,255,0.86)_inset,0_8px_18px_-18px_rgba(0,0,0,0.32)] backdrop-blur-xl lg:hidden">
      <Link
        href="/deep-diagnosis"
        className={cn(
          deepDiagnosisFocusRing,
          deepDiagnosisMicroInteraction,
          "absolute left-1/2 flex -translate-x-1/2 items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-[#f0f0f0]",
        )}
        aria-label="返回深度诊断首页"
        title="返回深度诊断首页"
      >
        <DeepDiagnosisLogo className="h-8 w-8 shrink-0" />
        <strong className="text-lg font-semibold leading-none text-[#171717]">深度诊断</strong>
      </Link>
      <div className="flex justify-end gap-1.5">
        <NavbarIconButton
          ariaLabel={sidebarOpen ? "收起对话历史" : "展开对话历史"}
          title={sidebarOpen ? "收起历史" : "展开历史"}
          onClick={onToggleSidebar}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-[18px] w-[18px]" aria-hidden="true" />
          ) : (
            <PanelLeftOpen className="h-[18px] w-[18px]" aria-hidden="true" />
          )}
        </NavbarIconButton>
        <NavbarIconButton
          ariaLabel="新建会话"
          title="新建会话"
          onClick={onCreate}
        >
          <Plus className="h-[18px] w-[18px]" aria-hidden="true" />
        </NavbarIconButton>
      </div>
    </header>
  );
}

export function MobileConversationHistoryButton({
  className,
  onOpen,
}: {
  className?: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        deepDiagnosisFocusRing,
        deepDiagnosisMicroInteraction,
        "fixed right-4 top-4 z-40 grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-[#e6e6e6] bg-white text-[#171717] shadow-[0_1px_1px_rgba(0,0,0,0.02),0_10px_24px_-18px_rgba(0,0,0,0.42)] hover:border-[#d4d4d4] hover:bg-[#f7f7f7]",
        className,
      )}
      aria-label="查看历史会话"
      title="历史会话"
      onClick={onOpen}
    >
      <PanelLeftOpen className="h-[18px] w-[18px]" aria-hidden="true" />
    </button>
  );
}

function NavbarIconButton({
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
        "grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-[#e6e6e6] bg-white text-[#171717] shadow-[0_1px_1px_rgba(0,0,0,0.02)] hover:border-[#d4d4d4] hover:bg-[#f7f7f7]",
      )}
      aria-label={ariaLabel}
      title={title}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
