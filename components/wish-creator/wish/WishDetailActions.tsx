"use client";

import Image from "next/image";
import { MessageCircleMore, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CONSULTATION_QR_CODE_SRC } from "@/components/requirements-diagnosis/constants/consultation";
import { wishCreatorFocus } from "@/components/wish-creator/styles";
import { cn } from "@/lib/utils";
import { APP_BASE_PATH } from "@/utils/routing";

export function WishDetailActions({ wishId, wishTitle }: { wishId: string; wishTitle: string }) {
  const router = useRouter();
  const [contactOpen, setContactOpen] = useState(false);
  const [removing, setRemoving] = useState(false);

  async function openContact() {
    setContactOpen(true);
    await fetch(`${APP_BASE_PATH}/api/wish-creator/wishes/${wishId}/contact`, { method: "POST" });
  }

  async function removeWish() {
    const confirmed = window.confirm("移除后，这条愿望将不再出现在“我的愿望”中，且无法恢复。确定移除吗？");
    if (!confirmed) return;
    setRemoving(true);
    const response = await fetch(`${APP_BASE_PATH}/api/wish-creator/wishes/${wishId}`, { method: "DELETE" });
    if (response.ok) {
      router.push("/wish-creator/wishes");
      router.refresh();
      return;
    }
    setRemoving(false);
  }

  return (
    <>
      <div className="mt-9 flex flex-col gap-3 border-t border-[#2e3933] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button className={cn(wishCreatorFocus, "flex h-11 items-center justify-center gap-2 rounded-lg bg-[#b8ff22] px-5 text-sm font-bold text-[#071007] hover:bg-[#c8ff4e]")} onClick={() => void openContact()} type="button">
          <MessageCircleMore className="h-4 w-4" />聊聊怎么实现
        </button>
        <button className={cn(wishCreatorFocus, "flex h-10 items-center justify-center gap-2 px-2 text-sm text-[#7f8b84] hover:text-red-300 disabled:opacity-50")} disabled={removing} onClick={() => void removeWish()} type="button">
          <Trash2 className="h-4 w-4" />{removing ? "正在移除…" : "从我的愿望中移除"}
        </button>
      </div>
      <WishContactDialog onClose={() => setContactOpen(false)} open={contactOpen} wishTitle={wishTitle} />
    </>
  );
}
function WishContactDialog({ onClose, open, wishTitle }: { onClose: () => void; open: boolean; wishTitle: string }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 px-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section aria-modal="true" className="relative w-full max-w-sm rounded-2xl border border-[#3d4943] bg-[#0d1411] p-6 text-white shadow-2xl" role="dialog">
        <button ref={closeButtonRef} aria-label="关闭" className="absolute right-4 top-4 text-[#869189] hover:text-white" onClick={onClose} type="button"><X className="h-5 w-5" /></button>
        <h2 className="text-xl font-black">聊聊怎么实现</h2>
        <p className="mt-2 pr-6 text-sm leading-6 text-[#909b94]">扫码添加企业微信，我们可以围绕你的愿望做一次面对面分析。</p>
        <div className="mt-5 rounded-xl bg-white p-3">
          <Image alt="添加顾问企业微信二维码" className="h-auto w-full" height={1164} src={CONSULTATION_QR_CODE_SRC} width={1034} />
        </div>
        <p className="mt-4 rounded-lg bg-[#151d19] px-3 py-2 text-center text-sm text-[#c8d0cb]">备注：愿望：{wishTitle}</p>
      </section>
    </div>
  );
}
