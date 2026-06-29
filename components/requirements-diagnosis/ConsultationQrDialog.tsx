"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { CONSULTATION_QR_CODE_SRC } from "@/components/requirements-diagnosis/constants/consultation";

type ConsultationQrDialogProps = {
  open: boolean;
  remark: string;
  onClose: () => void;
};

export function ConsultationQrDialog({ open, remark, onClose }: ConsultationQrDialogProps) {
  const dialogRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const previousActiveElement = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          "button, [href], input, textarea, select, [tabindex]:not([tabindex='-1'])",
        ),
      ).filter((element) => !element.hasAttribute("disabled"));
      if (!focusableElements.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }
      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousActiveElement?.focus();
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#171717]/48 px-4 py-6 backdrop-blur-[2px] motion-safe:animate-in motion-safe:fade-in motion-safe:duration-150"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="consultation-qr-title"
        aria-describedby="consultation-qr-description"
        className="relative grid w-full max-w-[390px] gap-4 rounded-[18px] border border-[#e7e7e1] bg-[#fffffc] p-5 text-[#222322] shadow-[0_18px_48px_-24px_rgba(0,0,0,0.42)] motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-150"
      >
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="关闭顾问二维码"
          onClick={onClose}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-[#8a8a86] transition hover:bg-[#f0f0ed] hover:text-[#222322] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2e2f2d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffffc]"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="pr-8">
          <h2 id="consultation-qr-title" className="mt-2 text-xl font-black leading-7 text-[#222322]">
            顾问解读
          </h2>
          <p id="consultation-qr-description" className="mt-2 text-sm leading-6 text-[#5f605c]">
            扫码添加顾问，帮你确认最适合先启动的行动。
          </p>
        </div>

        <div className="grid place-items-center rounded-[14px] border border-[#ecece8] bg-white p-3">
          <Image
            src={CONSULTATION_QR_CODE_SRC}
            alt="添加顾问微信二维码"
            width={1034}
            height={1164}
            sizes="260px"
            className="h-auto w-full max-w-[260px]"
            priority={false}
          />
        </div>

        <p className="rounded-[12px] bg-[#f7f7f3] px-3 py-2 text-center text-sm font-bold text-[#4f504c]">
          备注：{remark}
        </p>
      </section>
    </div>
  );
}
