"use client";

import { AlertCircle, FileText, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  deepDiagnosisAccentButton,
  deepDiagnosisFocusRing,
  deepDiagnosisGhostButton,
  deepDiagnosisMicroInteraction,
} from "./styles";

interface DeepDiagnosisReportConfirmDialogProps {
  creditCost: number;
  open: boolean;
  stageLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeepDiagnosisReportConfirmDialog({
  creditCost,
  open,
  stageLabel,
  onClose,
  onConfirm,
}: DeepDiagnosisReportConfirmDialogProps) {
  const dialogRef = useRef<HTMLElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const previousActiveElement = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    cancelButtonRef.current?.focus();

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
      if (focusableElements.length === 0) return;

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
        aria-labelledby="deep-diagnosis-report-confirm-title"
        aria-describedby="deep-diagnosis-report-confirm-description"
        className="relative grid w-full max-w-[460px] gap-5 rounded-xl border border-[#e7e7e7] bg-white p-5 text-[#171717] shadow-[0_18px_48px_-24px_rgba(0,0,0,0.42)] motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-150 sm:p-6"
      >
        <button
          type="button"
          aria-label="关闭"
          onClick={onClose}
          className={`${deepDiagnosisFocusRing} absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-md text-[#8a8a8a] hover:bg-[#f5f5f5] hover:text-[#171717] ${deepDiagnosisMicroInteraction}`}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-3 pr-7">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#e7e7e7] bg-[#fafafa] text-[#2f2f2f]">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2
            id="deep-diagnosis-report-confirm-title"
            className="text-lg font-semibold leading-7 text-[#171717] text-balance"
          >
            生成方案链接前确认
          </h2>
        </div>

        <div
          id="deep-diagnosis-report-confirm-description"
          className="grid gap-3 text-sm leading-6 text-[#5f5f5f] text-pretty"
        >
          <p>
            当前诊断处于「{stageLabel}」阶段。生成方案链接将消耗{" "}
            <span className="font-semibold text-[#171717]">{creditCost} 积分</span>。
          </p>
          <div className="grid grid-cols-[18px_minmax(0,1fr)] gap-2 rounded-lg border border-[#eaeaea] bg-[#fafafa] px-3 py-2.5">
            <AlertCircle className="mt-1 h-4 w-4 text-[#6f6f6f]" aria-hidden="true" />
            <p className="font-semibold text-[#333333]">
              建议先按引导把问题分析透彻，再生成更完整、更可用的方案链接。
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            onClick={onConfirm}
            className={`h-10 rounded-full px-5 ${deepDiagnosisAccentButton} ${deepDiagnosisMicroInteraction}`}
          >
            继续生成
          </Button>
          <Button
            ref={cancelButtonRef}
            type="button"
            variant="outline"
            onClick={onClose}
            className={`h-10 px-5 ${deepDiagnosisGhostButton} rounded-full ${deepDiagnosisMicroInteraction}`}
          >
            再聊聊
          </Button>
        </div>
      </section>
    </div>
  );
}
