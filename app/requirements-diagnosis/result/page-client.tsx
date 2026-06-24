"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { REQUIREMENTS_DIAGNOSIS_RESULT_KEY } from "@/lib/requirements-diagnosis/quiz";
import { csrfFetch } from "@/lib/security/csrf-client";
import { mergeNarrative } from "@/lib/requirements-diagnosis/scoring";
import type { DiagnosisRecordDto } from "@/lib/requirements-diagnosis/persistence";
import type { DiagnosisNarrative, DiagnosisResult } from "@/lib/requirements-diagnosis/types";
import { DiagnosisResultReport } from "@/components/requirements-diagnosis/DiagnosisResultReport";
import { Button } from "@/components/ui/button";
import { diagnosisAppSurface, diagnosisMutedText, diagnosisPanel, diagnosisPrimaryButton, diagnosisShell, diagnosisStage } from "@/components/requirements-diagnosis/styles";

type StreamEvent =
  | { type: "saved"; data: DiagnosisRecordDto }
  | { type: "delta"; text: string }
  | { type: "done"; narrative: DiagnosisNarrative }
  | { type: "error"; message: string };

type RequirementsResultClientProps = {
  initialRecord: DiagnosisRecordDto | null;
};

export function RequirementsResultClient({ initialRecord }: RequirementsResultClientProps) {
  const [record, setRecord] = useState<DiagnosisRecordDto | null>(initialRecord);
  const [result, setResult] = useState<DiagnosisResult | null>(initialRecord?.result || null);
  const [status, setStatus] = useState<"idle" | "saving" | "streaming" | "done" | "error">(initialRecord ? "done" : "idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [narrativeDraft, setNarrativeDraft] = useState("");
  const completionStartedRef = useRef(false);
  const savedRecordIdRef = useRef(initialRecord?.id);

  const handleStreamEvent = useCallback((event: StreamEvent, current: DiagnosisResult) => {
    if (event.type === "saved") {
      savedRecordIdRef.current = event.data.id;
      setRecord(event.data);
      setResult(event.data.result);
      return;
    }
    if (event.type === "done") {
      setResult((existing) => mergeNarrative(existing || current, event.narrative));
      setNarrativeDraft("");
      return;
    }
    if (event.type === "delta") {
      setNarrativeDraft((draft) => `${draft}${event.text}`.slice(0, 12000));
      return;
    }
    if (event.type === "error") {
      setErrorMessage(event.message);
      setStatus("error");
    }
  }, []);

  const completeDiagnosis = useCallback(async (current: DiagnosisResult, retryRecordId?: string, options: { autoRetry?: boolean } = {}) => {
    let nextRetryRecordId = retryRecordId;
    const maxAttempts = options.autoRetry === false ? 1 : 2;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      setStatus(nextRetryRecordId ? "streaming" : "saving");
      setErrorMessage(null);
      setNarrativeDraft("");

      try {
        const response = await csrfFetch("/agent-team/api/agent-team/diagnosis/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nextRetryRecordId ? { quizResultId: nextRetryRecordId, retryNarrative: true } : { answers: current.answers }),
        });

        if (!response.ok || !response.body) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error || "评测保存失败。");
        }

        setStatus("streaming");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let hasStreamError = false;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            const event = parseStreamEventLine(line);
            if (!event) continue;
            if (event.type === "error") hasStreamError = true;
            handleStreamEvent(event, current);
          }
        }

        if (buffer.trim()) {
          const event = parseStreamEventLine(buffer);
          if (event) {
            if (event.type === "error") hasStreamError = true;
            handleStreamEvent(event, current);
          }
        }
        if (!hasStreamError) {
          setStatus("done");
        }
        window.localStorage.removeItem(REQUIREMENTS_DIAGNOSIS_RESULT_KEY);
        return;
      } catch (error) {
        if (attempt < maxAttempts) {
          nextRetryRecordId = savedRecordIdRef.current || nextRetryRecordId;
          continue;
        }
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "叙事生成失败，结构化报告仍可查看。");
      }
    }
  }, [handleStreamEvent]);

  useEffect(() => {
    queueMicrotask(() => {
      // React Strict Mode 会重复触发 effect；用 ref 保证同一份本地结果只提交一次。
      if (completionStartedRef.current) return;
      const saved = window.localStorage.getItem(REQUIREMENTS_DIAGNOSIS_RESULT_KEY);
      if (!saved) return;
      try {
        const parsed = JSON.parse(saved) as { result?: DiagnosisResult };
        if (!parsed.result) return;
        completionStartedRef.current = true;
        savedRecordIdRef.current = undefined;
        setRecord(null);
        setResult(parsed.result);
        void completeDiagnosis(parsed.result, undefined, { autoRetry: true });
      } catch {
        setErrorMessage("本地报告读取失败，请重新评测。");
        setStatus("error");
      }
    });
  }, [completeDiagnosis]);

  if (!result) {
    return (
      <main className={`${diagnosisShell} px-5 py-10`}>
        <div className={diagnosisStage}>
          <section className={`${diagnosisAppSurface} justify-center text-center`}>
            <h1 className="text-3xl font-black">还没有可展示的评测结果</h1>
            <p className={`mt-3 text-sm leading-7 ${diagnosisMutedText}`}>请先完成 13 道题，系统会生成你的需求诊断报告。</p>
            <Button asChild className={`mt-6 h-14 ${diagnosisPrimaryButton}`}>
              <Link href="/requirements-diagnosis/quiz">开始评测</Link>
            </Button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className={diagnosisShell}>
      <DiagnosisResultReport
        result={result}
        recordId={record?.id}
        narrativeStatus={status}
        narrativeDraft={narrativeDraft}
        errorMessage={errorMessage}
        onRetry={record ? () => completeDiagnosis(result, record.id, { autoRetry: false }) : () => completeDiagnosis(result, undefined, { autoRetry: false })}
      />
    </main>
  );
}

function parseStreamEventLine(line: string): StreamEvent | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith(":")) return null;
  // 当前后端输出 SSE data 帧；保留裸 JSON 兼容，方便读取旧开发服务或测试桩输出。
  const payload = trimmed.startsWith("data:") ? trimmed.slice(5).trim() : trimmed;
  if (!payload) return null;
  return JSON.parse(payload) as StreamEvent;
}
