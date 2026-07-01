"use client";

import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { calculateDiagnosis } from "@/lib/requirements-diagnosis/scoring";
import { REQUIREMENTS_DIAGNOSIS_RESULT_KEY, REQUIREMENTS_DIAGNOSIS_STORAGE_KEY } from "@/lib/requirements-diagnosis/quiz";
import type { QuizAnswerValue, QuizAnswers, QuizOptionValue, QuizQuestion, QuestionId } from "@/lib/requirements-diagnosis/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import {
  diagnosisAppSurface,
  diagnosisBadge,
  diagnosisBottomActions,
  diagnosisPanel,
  diagnosisPrimaryButton,
  diagnosisSecondaryButton,
  diagnosisSerif,
  diagnosisShell,
  diagnosisStage,
} from "@/components/requirements-diagnosis/styles";

type RequirementsQuizClientProps = {
  questions: QuizQuestion[];
};

const quizOptionBaseClass =
  `${diagnosisPanel} flex min-h-[58px] cursor-pointer items-center gap-3 px-4 py-3 text-sm font-bold shadow-none`;
const quizOptionSelectedClass =
  "border-0 !bg-[#2e2f2d] !text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.2),0_12px_30px_rgba(0,0,0,0.2)]";
const quizOptionIndicatorClass =
  "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black/8 text-transparent";
const quizOptionIndicatorSelectedClass =
  "!bg-white/90 !text-[#2e2f2d]";
const quizQuestionSectionTagClass =
  "inline-flex w-fit rounded-full px-3 py-1 text-xs font-black";
const quizQuestionSectionToneClass: Record<string, string> = {
  "经营画像": "bg-[#e8f3ed] text-[#277652]",
  "AI 落地画像": "bg-[#eef0ff] text-[#4b56a5]",
};

export function RequirementsQuizClient({ questions }: RequirementsQuizClientProps) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const question = questions[index];
  const progress = Math.round(((index + 1) / questions.length) * 100);

  useEffect(() => {
    queueMicrotask(() => {
      const saved = window.localStorage.getItem(REQUIREMENTS_DIAGNOSIS_STORAGE_KEY);
      if (!saved) return;
      try {
        const parsed = JSON.parse(saved) as { index?: number; answers?: QuizAnswers };
        setAnswers(parsed.answers || {});
        setIndex(Math.min(Math.max(parsed.index || 0, 0), questions.length - 1));
      } catch {
        window.localStorage.removeItem(REQUIREMENTS_DIAGNOSIS_STORAGE_KEY);
      }
    });
  }, [questions.length]);

  useEffect(() => {
    window.localStorage.setItem(REQUIREMENTS_DIAGNOSIS_STORAGE_KEY, JSON.stringify({ index, answers }));
  }, [answers, index]);

  const currentAnswer = answers[question.id];
  const canContinue = useMemo(() => {
    if (question.type === "multiple") return Array.isArray(currentAnswer) && currentAnswer.length > 0;
    return typeof currentAnswer === "string";
  }, [currentAnswer, question.type]);

  function updateAnswer(questionId: QuestionId, value: QuizAnswerValue) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  function toggleMultiple(value: QuizOptionValue) {
    const selected = new Set(Array.isArray(currentAnswer) ? currentAnswer : []);
    if (selected.has(value)) {
      selected.delete(value);
    } else {
      // Q14 的“还没有任何 AI 工具进入日常工作”和其他工具互斥，避免 AI 落地阶段被脏组合误判。
      if (question.id === "q14" && value === "E") selected.clear();
      if (question.id === "q14" && value !== "E") selected.delete("E");
      selected.add(value);
    }
    updateAnswer(question.id, [...selected] as QuizOptionValue[]);
  }

  function goNext() {
    if (index < questions.length - 1) {
      setIndex(index + 1);
      return;
    }
    const result = calculateDiagnosis(answers);
    window.localStorage.setItem(REQUIREMENTS_DIAGNOSIS_RESULT_KEY, JSON.stringify({ result, savedAt: new Date().toISOString() }));
    window.localStorage.removeItem(REQUIREMENTS_DIAGNOSIS_STORAGE_KEY);
    router.push("/requirements-diagnosis/result");
  }

  function goBack() {
    setIndex((current) => Math.max(0, current - 1));
  }

  return (
    <QuizShell>
      <div className={`flex flex-1 flex-col mt-4`}>
        <header className="mt-8 flex items-center gap-2">
          <span className={diagnosisBadge}>
            {String(index + 1).padStart(2, "0")} / {questions.length}
          </span>
          <span className={cn(quizQuestionSectionTagClass, quizQuestionSectionToneClass[question.section] || "bg-[#f0f0ed] text-[#6b6c68]")}>
            {question.section}
          </span>
        </header>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-black/10">
          <div className="h-full rounded-full bg-[#2e2f2d] transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-6">
          <h2 className={`flex flex-wrap items-baseline gap-2 text-[25px] font-black leading-tight tracking-tight ${diagnosisSerif}`}>
            <span>{question.prompt}</span>
            {question.type === "multiple" ? (
              <span className="rounded-full bg-[#2e2f2d]/10 px-2.5 py-1 text-xs font-black text-[#2e2f2d]">
                多选
              </span>
            ) : null}
          </h2>
        </div>
        <div className="mt-8">
          {question.type === "single" ? (
            <RadioGroup value={typeof currentAnswer === "string" ? currentAnswer : ""} onValueChange={(value) => updateAnswer(question.id, value as QuizOptionValue)} className="grid gap-4">
              {question.options.map((option) => {
                const selected = currentAnswer === option.value;
                return (
                  <label key={option.value} className={cn(quizOptionBaseClass, selected && quizOptionSelectedClass)}>
                    <RadioGroupItem value={option.value} className="sr-only" />
                    <span className={cn(quizOptionIndicatorClass, selected && quizOptionIndicatorSelectedClass)}>
                      {selected ? <Check className="h-4 w-4" /> : null}
                    </span>
                    <span>
                      <strong>{option.value}.</strong> {option.label}
                    </span>
                  </label>
                );
              })}
            </RadioGroup>
          ) : (
            <div className="grid gap-4">
              {question.options.map((option) => {
                const selected = Array.isArray(currentAnswer) && currentAnswer.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className={cn(
                      quizOptionBaseClass,
                      "text-left",
                      selected && quizOptionSelectedClass,
                    )}
                  >
                    <Checkbox checked={selected} onCheckedChange={() => toggleMultiple(option.value)} className="sr-only" />
                    <span className={cn(quizOptionIndicatorClass, selected && quizOptionIndicatorSelectedClass)}>
                      {selected ? <Check className="h-4 w-4" /> : null}
                    </span>
                    <span>
                      <strong>{option.value}.</strong> {option.label}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
        <div className={`${diagnosisBottomActions} grid-cols-2`}>
          <Button type="button" onClick={goBack} disabled={index === 0} className={`h-14 !text-sm !font-bold ${diagnosisSecondaryButton}`}>
            <ArrowLeft className="h-4 w-4" />
            上一题
          </Button>
          <Button type="button" onClick={goNext} disabled={!canContinue} className={`h-14 !text-sm !font-bold ${diagnosisPrimaryButton}`}>
            {index === questions.length - 1 ? (
              <>
                生成报告
                <Check className="h-4 w-4" />
              </>
            ) : (
              <>
                下一题
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </QuizShell>
  );
}

function QuizShell({ children }: { children: React.ReactNode }) {
  return (
    <main className={diagnosisShell}>
      <div className={diagnosisStage}>
        <div className={diagnosisAppSurface}>
          {children}
        </div>
      </div>
    </main>
  );
}
