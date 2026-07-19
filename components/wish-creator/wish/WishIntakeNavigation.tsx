"use client";

import Link from "next/link";
import { ArrowLeft, LockKeyhole, Menu, MessageSquareText, Settings, Sparkles, Star, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { WishCreatorBrand } from "@/components/wish-creator/WishCreatorBrand";
import { wishCreatorFocus } from "@/components/wish-creator/styles";

type WishIntakeFrameProps = {
  active: "new" | "list";
  children: ReactNode;
};

export function WishIntakeFrame({ active, children }: WishIntakeFrameProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <main className="h-dvh overflow-hidden bg-[#080d0b] text-white">
      <div className="flex h-full">
        <aside className="hidden h-full w-[286px] shrink-0 border-r border-[#34403a] bg-[#070c0a] lg:block">
          <NavigationContent active={active} />
        </aside>
        <button
          aria-label="打开愿望导航"
          className={cn(wishCreatorFocus, "fixed left-3 top-3 z-30 grid h-10 w-10 place-items-center rounded-lg border border-[#34403a] bg-[#0d1411] text-[#b8ff22] lg:hidden")}
          onClick={() => setMobileOpen(true)}
          type="button"
        >
          <Menu className="h-5 w-5" />
        </button>
        {mobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button aria-label="关闭愿望导航" className="absolute inset-0 bg-black/75" onClick={() => setMobileOpen(false)} type="button" />
            <aside className="relative h-full w-[min(86vw,320px)] border-r border-[#34403a] bg-[#070c0a]">
              <button aria-label="关闭" className="absolute right-4 top-5 text-[#829087]" onClick={() => setMobileOpen(false)} type="button">
                <X className="h-5 w-5" />
              </button>
              <NavigationContent active={active} />
            </aside>
          </div>
        ) : null}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </main>
  );
}
function NavigationContent({ active }: { active: WishIntakeFrameProps["active"] }) {
  return (
    <div className="flex h-full flex-col px-6 py-8">
      <WishCreatorBrand />
      <Link className={cn(wishCreatorFocus, "mt-8 flex h-11 items-center gap-3 rounded-lg border border-[#455149] px-4 text-sm text-[#cbd2ce] hover:border-[#b8ff22]/60 hover:text-white")} href="/wish-creator">
        <ArrowLeft className="h-4 w-4 text-[#b8ff22]" />
        返回页面创作
      </Link>
      <nav className="mt-6 space-y-2">
        <NavLink active={active === "new"} href="/wish-creator/wish" icon={<MessageSquareText className="h-5 w-5" />} label="说出一个愿望" />
        <NavLink active={active === "list"} href="/wish-creator/wishes" icon={<Star className="h-5 w-5" />} label="我的愿望" />
      </nav>
      <div className="flex-1" />
      <div className="mb-5 flex items-start gap-3 border-b border-[#29332e] px-2 pb-5 text-xs leading-6 text-[#77837c]">
        <LockKeyhole className="mt-1 h-4 w-4 shrink-0" />
        <span>你的愿望和对话内容仅你和许愿池团队可见，安全守护中</span>
      </div>
      <Link className={cn(wishCreatorFocus, "flex h-10 items-center gap-3 px-2 text-sm text-[#929d97] hover:text-white")} href="/settings">
        <Settings className="h-4 w-4" />
        设置
      </Link>
    </div>
  );
}

function NavLink({ active, href, icon, label }: { active: boolean; href: string; icon: ReactNode; label: string }) {
  return (
    <Link
      className={cn(
        wishCreatorFocus,
        "relative flex h-14 items-center gap-4 rounded-lg px-4 text-sm transition-colors",
        active ? "bg-[#151c19] text-white" : "text-[#a7b0ab] hover:bg-[#101714] hover:text-white",
      )}
      href={href}
    >
      {active ? <span className="absolute inset-y-0 left-0 w-0.5 rounded-full bg-[#b8ff22]" /> : null}
      <span className={active ? "text-[#b8ff22]" : "text-[#7e8983]"}>{icon}</span>
      {label}
      {active ? <Sparkles className="ml-auto h-3.5 w-3.5 text-[#b8ff22]/70" /> : null}
    </Link>
  );
}
