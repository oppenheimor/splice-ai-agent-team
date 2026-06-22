"use client";

import { AlertTriangle, ExternalLink, Search, ShieldCheck, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

type WebSearchResult = {
  title?: string;
  url?: string;
  content?: string;
  score?: number;
};

type WebSearchOutput = {
  answer?: string | null;
  results?: WebSearchResult[];
  warning?: string;
  compiledEvidence?: {
    coverage?: {
      searchedQuestions?: string[];
      coveredSourceTypes?: string[];
      uncoveredSourceTypes?: string[];
    };
  };
};

type NormalizedWebSearchOutput = Required<Pick<WebSearchOutput, "results">> & WebSearchOutput;

type MergedWebSearchOutput = NormalizedWebSearchOutput & {
  answers: string[];
  searchCount: number;
};

export function WebSearchTool({ data }: { data: unknown }) {
  const output = mergeWebSearchOutputs(normalizeWebSearchOutputs(data));
  const coverage = output.compiledEvidence?.coverage;
  const visibleResults = output.results.slice(0, 3);
  const remainingResults = output.results.slice(3);
  const uncoveredTypes = coverage?.uncoveredSourceTypes?.slice(0, 3) || [];
  const sourceSummary = output.results.length ? `已参考 ${output.results.length} 个公开来源` : "外部资料检索";

  return (
    <Card className="overflow-hidden border-[#eaeaea] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.02),0_8px_16px_-8px_rgba(0,0,0,0.06)]">
      <div className="border-b border-[#eaeaea] bg-white px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-[#eaeaea] bg-[#fafafa] text-[#171717]">
              <Search className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <strong className="block text-sm font-medium text-[#171717]">外部资料</strong>
              <p className="mt-0.5 truncate text-xs text-[#666666]">{sourceSummary}</p>
            </div>
          </div>
          <span className={output.warning ? "rounded-full border border-[#ffd7d6] bg-[#ffeeef] px-2.5 py-1 text-xs font-medium text-[#d8001b]" : "rounded-full border border-[#b9f5bc] bg-[#ecfdec] px-2.5 py-1 text-xs font-medium text-[#107d32]"}>
            {output.warning ? "需复核" : "已完成"}
          </span>
        </div>
      </div>

      <div className="grid gap-4 p-4">
        {output.warning ? (
          <div className="flex gap-3 rounded-lg border border-[#ffd7d6] bg-[#ffeeef] p-3 text-sm leading-6 text-[#47000c]">
            <AlertTriangle className="mt-1 h-4 w-4 shrink-0" />
            <span>{output.warning}</span>
          </div>
        ) : null}

        {output.answers.length ? (
          <div className="rounded-lg border border-[#eaeaea] bg-[#fafafa] p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-[#666666]">
              <Sparkles className="h-3.5 w-3.5 text-[#0059ec]" />
              摘要判断
            </div>
            {output.answers.length === 1 ? (
              <p className="mt-2 text-sm leading-6 text-[#171717]">{output.answers[0]}</p>
            ) : (
              <ul className="mt-2 space-y-1.5 text-sm leading-6 text-[#171717]">
                {output.answers.slice(0, 3).map((answer, index) => (
                  <li key={`${answer}-${index}`} className="grid grid-cols-[18px_minmax(0,1fr)] gap-1">
                    <span className="text-xs font-semibold tabular-nums text-[#8f8f8f]">{index + 1}.</span>
                    <span>{answer}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        {uncoveredTypes.length ? (
          <div className="flex gap-2 rounded-lg border border-[#eaeaea] bg-white p-3 text-xs leading-5 text-[#666666]">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8f8f8f]" />
            <span>
              <span className="font-medium text-[#171717]">证据缺口：</span>
              {uncoveredTypes.join("、")}
            </span>
          </div>
        ) : null}

        {visibleResults.length ? (
          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-[#666666]">主要来源</span>
              {remainingResults.length ? (
                <span className="text-xs text-[#8f8f8f]">其余 {remainingResults.length} 个已折叠</span>
              ) : null}
            </div>
            {visibleResults.map((result, index) => (
              <SourceLink key={`${result.title}-${result.url}-${index}`} result={result} index={index} />
            ))}
            {remainingResults.length ? (
              <details className="group rounded-lg border border-[#eaeaea] bg-[#fafafa] px-3 py-2">
                <summary className="cursor-pointer list-none text-xs font-medium text-[#666666] transition hover:text-[#171717]">
                  查看其余 {remainingResults.length} 个来源
                </summary>
                <div className="mt-2 grid gap-2 border-t border-[#eaeaea] pt-2">
                  {remainingResults.map((result, index) => (
                    <SourceLink
                      key={`${result.title}-${result.url}-${index + visibleResults.length}`}
                      result={result}
                      index={index + visibleResults.length}
                      compact
                    />
                  ))}
                </div>
              </details>
            ) : null}
          </div>
        ) : null}
      </div>
    </Card>
  );
}

function mergeWebSearchOutputs(outputs: NormalizedWebSearchOutput[]): MergedWebSearchOutput {
  if (!outputs.length) {
    return { results: [], answers: [], searchCount: 0 };
  }

  const answers = uniqueStrings(outputs.map((output) => output.answer).filter(isNonEmptyString));
  const searchedQuestions = uniqueStrings(
    outputs.flatMap((output) => output.compiledEvidence?.coverage?.searchedQuestions || []),
  );
  const coveredSourceTypes = uniqueStrings(
    outputs.flatMap((output) => output.compiledEvidence?.coverage?.coveredSourceTypes || []),
  );
  const uncoveredSourceTypes = uniqueStrings(
    outputs.flatMap((output) => output.compiledEvidence?.coverage?.uncoveredSourceTypes || []),
  );
  const warnings = uniqueStrings(outputs.map((output) => output.warning).filter(isNonEmptyString));

  return {
    answer: answers[0] || null,
    answers,
    results: dedupeResults(outputs.flatMap((output) => output.results)),
    warning: warnings.join("；") || undefined,
    searchCount: outputs.length,
    compiledEvidence: {
      coverage: {
        searchedQuestions,
        coveredSourceTypes,
        uncoveredSourceTypes,
      },
    },
  };
}

function SourceLink({
  result,
  index,
  compact = false,
}: {
  result: WebSearchResult;
  index: number;
  compact?: boolean;
}) {
  return (
    <a
      href={result.url || "#"}
      target="_blank"
      rel="noreferrer"
      className="group grid grid-cols-[24px_minmax(0,1fr)_auto] gap-3 rounded-lg border border-[#eaeaea] bg-white p-3 transition-[border-color,background-color] duration-150 hover:border-[#c9c9c9] hover:bg-[#fafafa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006bff] focus-visible:ring-offset-2"
    >
      <span className="grid h-6 w-6 place-items-center rounded-md border border-[#eaeaea] bg-[#fafafa] text-xs font-medium tabular-nums text-[#666666]">
        {index + 1}
      </span>
      <div className="min-w-0">
        <strong className="line-clamp-1 text-sm font-medium leading-5 text-[#171717]">
          {result.title || "未命名来源"}
        </strong>
        {result.url ? <p className="mt-0.5 truncate text-xs text-[#8f8f8f]">{formatHost(result.url)}</p> : null}
        {!compact && result.content ? (
          <p className="mt-1 line-clamp-1 text-xs leading-5 text-[#666666]">{result.content}</p>
        ) : null}
      </div>
      <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-[#8f8f8f] transition group-hover:text-[#171717]" />
    </a>
  );
}

function normalizeWebSearchOutputs(data: unknown): NormalizedWebSearchOutput[] {
  if (Array.isArray(data)) return data.map(normalizeWebSearchOutput);
  return [normalizeWebSearchOutput(data)];
}

function normalizeWebSearchOutput(data: unknown): NormalizedWebSearchOutput {
  if (!data || typeof data !== "object") return { results: [] };
  const record = data as WebSearchOutput;
  return {
    ...record,
    results: Array.isArray(record.results) ? record.results : [],
  };
}

function dedupeResults(results: WebSearchResult[]): WebSearchResult[] {
  const seen = new Set<string>();
  const deduped: WebSearchResult[] = [];

  for (const result of results) {
    const key = result.url || result.title;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(result);
  }

  return deduped;
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function formatHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
