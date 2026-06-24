import {
  asArray,
  asRecord,
  asStringArray,
  BadgeText,
  FieldLine,
  getToolMeta,
  getToolName,
  isNonEmptyString,
  MarkdownMessage,
  type MessagePart,
  normalizeParts,
  ObjectFields,
  PartShell,
  RawJsonDetails,
  StructuredValue,
  ValueInline,
} from "./AgentEvalMessagePartsPrimitives";

export function AgentEvalMessageParts({ text, parts }: { text: string | null; parts: unknown }) {
  const normalizedParts = normalizeParts(parts);

  if (!normalizedParts.length) {
    return <MarkdownMessage content={text || "[非文本消息]"} />;
  }

  return (
    <div className="mt-3 grid gap-3">
      {normalizedParts.map((part, index) => (
        <MessagePartBlock key={`${String(part.type || "part")}-${index}`} part={part} fallbackText={index === 0 ? text : null} />
      ))}
    </div>
  );
}

function MessagePartBlock({ part, fallbackText }: { part: MessagePart; fallbackText: string | null }) {
  const type = String(part.type || "unknown");

  if (type === "text") {
    return <MarkdownMessage content={String(part.text || fallbackText || "")} />;
  }

  if (type === "reasoning") {
    return (
      <details className="rounded-lg border border-[#e5e5e5] bg-white p-3">
        <summary className="cursor-pointer text-xs font-semibold text-[#666666]">reasoning</summary>
        <MarkdownMessage content={String(part.text || "")} />
      </details>
    );
  }

  if (type === "source-url") {
    return <SourceUrlPart part={part} />;
  }

  if (type === "source-document") {
    return <SourceDocumentPart part={part} />;
  }

  if (type === "file") {
    return <FilePart part={part} />;
  }

  if (type === "step-start") {
    return <PartShell label="step-start" tone="muted" />;
  }

  if (type.startsWith("data-")) {
    return (
      <PartShell label={type} tone="muted">
        <StructuredValue value={part.data} />
        <RawJsonDetails value={part} />
      </PartShell>
    );
  }

  if (type === "dynamic-tool" || type.startsWith("tool-")) {
    return <ToolPart part={part} />;
  }

  return (
    <PartShell label={type} tone="muted">
      <StructuredValue value={part} />
    </PartShell>
  );
}

function ToolPart({ part }: { part: MessagePart }) {
  const toolName = getToolName(part);
  const data = part.state === "output-available" && part.output !== undefined ? part.output : part.input;

  return (
    <PartShell label={toolName} tone={part.state === "output-error" ? "danger" : "tool"} meta={getToolMeta(part)}>
      {toolName === "askUserChoice" ? (
        <ChoiceAudit part={part} />
      ) : toolName === "webSearch" ? (
        <WebSearchAudit input={part.input} output={part.output} />
      ) : toolName === "showCards" ? (
        <CardsAudit data={data} />
      ) : toolName === "showComparison" ? (
        <ComparisonAudit data={data} />
      ) : toolName === "showChecklist" ? (
        <ChecklistAudit data={data} />
      ) : toolName === "showTimeline" ? (
        <TimelineAudit data={data} />
      ) : toolName === "showScorecard" ? (
        <ScorecardAudit data={data} />
      ) : toolName === "showDataTable" ? (
        <DataTableAudit data={data} />
      ) : toolName === "showFramework" ? (
        <FrameworkAudit data={data} />
      ) : toolName === "showChart" ? (
        <StructuredToolAudit title="图表数据" data={data} />
      ) : (
        <StructuredToolAudit title="工具数据" data={data} />
      )}
      {part.errorText ? <p className="rounded-md border border-[#f2c6bc] bg-[#fff4f1] px-3 py-2 text-sm text-[#8a1f11]">{String(part.errorText)}</p> : null}
      <RawJsonDetails value={part} />
    </PartShell>
  );
}

function ChoiceAudit({ part }: { part: MessagePart }) {
  const input = asRecord(part.input);
  const output = asRecord(part.output);
  const options = asArray(input.options).map(asRecord);
  const labels = asStringArray(output.selectedLabels);
  const selected = asStringArray(output.selected);
  const otherText = isNonEmptyString(output.otherText) ? String(output.otherText) : "";

  return (
    <div className="grid gap-3">
      {isNonEmptyString(input.question) ? <FieldLine label="问题" value={String(input.question)} /> : null}
      <div className="flex flex-wrap gap-2">
        <BadgeText>{String(input.mode || "single")}</BadgeText>
        {part.state ? <BadgeText>{String(part.state)}</BadgeText> : null}
      </div>
      {labels.length || selected.length || otherText ? (
        <section className="rounded-lg border border-[#b9f5bc] bg-[#fbfffb] p-3">
          <p className="text-xs font-semibold text-[#107d32]">用户提交</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[...labels, otherText].filter(Boolean).map((label) => (
              <span key={label} className="rounded-md border border-[#b9f5bc] bg-white px-2.5 py-1.5 text-sm font-medium text-[#107d32]">
                {label}
              </span>
            ))}
            {!labels.length && selected.map((id) => <BadgeText key={id}>{id}</BadgeText>)}
          </div>
        </section>
      ) : null}
      {options.length ? (
        <section className="rounded-lg border border-[#e5e5e5] bg-white">
          <p className="border-b border-[#eeeeee] px-3 py-2 text-xs font-semibold text-[#666666]">候选选项</p>
          <div className="divide-y divide-[#eeeeee]">
            {options.map((option, index) => (
              <div key={`${String(option.id || option.label)}-${index}`} className="px-3 py-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-[#8f8f8f]">{String(option.id || index + 1)}</span>
                  <strong className="text-sm text-[#171717]">{String(option.label || "未命名选项")}</strong>
                </div>
                {isNonEmptyString(option.description) ? <p className="mt-1 text-xs leading-5 text-[#666666]">{String(option.description)}</p> : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function WebSearchAudit({ input, output }: { input: unknown; output: unknown }) {
  const inputRecord = asRecord(input);
  const outputRecord = asRecord(output);
  const results = asArray(outputRecord.results).map(asRecord);

  return (
    <div className="grid gap-3">
      {isNonEmptyString(inputRecord.query) ? <FieldLine label="搜索词" value={String(inputRecord.query)} /> : null}
      {isNonEmptyString(outputRecord.warning) ? (
        <p className="rounded-md border border-[#f2c6bc] bg-[#fff4f1] px-3 py-2 text-sm text-[#8a1f11]">{String(outputRecord.warning)}</p>
      ) : null}
      {isNonEmptyString(outputRecord.answer) ? <FieldLine label="摘要" value={String(outputRecord.answer)} /> : null}
      {results.length ? (
        <section className="rounded-lg border border-[#e5e5e5] bg-white">
          <p className="border-b border-[#eeeeee] px-3 py-2 text-xs font-semibold text-[#666666]">搜索结果 {results.length} 条</p>
          <div className="divide-y divide-[#eeeeee]">
            {results.map((result, index) => (
              <article key={`${String(result.url || result.title)}-${index}`} className="px-3 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-[#8f8f8f]">{index + 1}</span>
                  {isNonEmptyString(result.url) ? (
                    <a className="break-all text-sm font-semibold text-[#171717] underline" href={String(result.url)} target="_blank" rel="noreferrer">
                      {String(result.title || result.url)}
                    </a>
                  ) : (
                    <strong className="text-sm text-[#171717]">{String(result.title || "未命名来源")}</strong>
                  )}
                  {typeof result.score === "number" ? <BadgeText>score {result.score.toFixed(3)}</BadgeText> : null}
                </div>
                {isNonEmptyString(result.content) ? <p className="mt-2 text-sm leading-6 text-[#4d4d4d]">{String(result.content)}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}
      {outputRecord.compiledEvidence ? (
        <details className="rounded-lg border border-[#e5e5e5] bg-white p-3">
          <summary className="cursor-pointer text-xs font-semibold text-[#666666]">compiledEvidence</summary>
          <StructuredValue value={outputRecord.compiledEvidence} />
        </details>
      ) : null}
    </div>
  );
}

function CardsAudit({ data }: { data: unknown }) {
  const record = asRecord(data);
  const cards = asArray(record.cards).map(asRecord);

  return (
    <div className="grid gap-3">
      <ToolTitle record={record} fallback="卡片组" />
      <div className="grid gap-2">
        {cards.map((card, index) => (
          <section key={`${String(card.title)}-${index}`} className="rounded-lg border border-[#e5e5e5] bg-white p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-[#8f8f8f]">{index + 1}</span>
              <strong className="text-sm text-[#171717]">{String(card.title || "未命名卡片")}</strong>
              {isNonEmptyString(card.badge) ? <BadgeText>{String(card.badge)}</BadgeText> : null}
            </div>
            <ObjectFields value={card} skip={["title", "badge"]} />
          </section>
        ))}
      </div>
    </div>
  );
}

function ComparisonAudit({ data }: { data: unknown }) {
  const record = asRecord(data);
  const criteria = asStringArray(record.criteria);
  const options = asArray(record.options).map(asRecord);

  return (
    <div className="grid gap-3">
      <ToolTitle record={record} fallback="方案对比" />
      {criteria.length ? <FieldLine label="判断维度" value={criteria.join("、")} /> : null}
      <div className="grid gap-2">
        {options.map((option, index) => (
          <section key={`${String(option.name)}-${index}`} className="rounded-lg border border-[#e5e5e5] bg-white p-3">
            <strong className="text-sm text-[#171717]">{String(option.name || `方案 ${index + 1}`)}</strong>
            <ObjectFields value={option} skip={["name"]} />
          </section>
        ))}
      </div>
    </div>
  );
}

function ChecklistAudit({ data }: { data: unknown }) {
  const record = asRecord(data);
  const items = asArray(record.items).map(asRecord);

  return (
    <div className="grid gap-3">
      <ToolTitle record={record} fallback="行动清单" />
      <NumberedRecords records={items} titleKey="label" />
    </div>
  );
}

function TimelineAudit({ data }: { data: unknown }) {
  const record = asRecord(data);
  const steps = asArray(record.steps).map(asRecord);

  return (
    <div className="grid gap-3">
      <ToolTitle record={record} fallback="时间线" />
      <NumberedRecords records={steps} titleKey="title" />
    </div>
  );
}

function ScorecardAudit({ data }: { data: unknown }) {
  const record = asRecord(data);
  const dimensions = asArray(record.dimensions).map(asRecord);

  return (
    <div className="grid gap-3">
      <ToolTitle record={record} fallback="评分卡" />
      {record.overall !== undefined ? <FieldLine label="总分" value={String(record.overall)} /> : null}
      <NumberedRecords records={dimensions} titleKey="label" />
    </div>
  );
}

function DataTableAudit({ data }: { data: unknown }) {
  const record = asRecord(data);
  const rows = asArray(record.rows).map(asRecord);
  const columns = asArray(record.columns).map(asRecord);
  const keys = columns.map((column) => String(column.key || "")).filter(Boolean);

  return (
    <div className="grid gap-3">
      <ToolTitle record={record} fallback="数据表" />
      {rows.length ? (
        <div className="overflow-x-auto rounded-lg border border-[#e5e5e5] bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-[#fafafa] text-xs text-[#666666]">
              <tr>
                {(keys.length ? keys : Object.keys(rows[0] || {})).map((key) => (
                  <th key={key} className="border-b border-[#eeeeee] px-3 py-2 font-medium">
                    {columns.find((column) => column.key === key)?.label ? String(columns.find((column) => column.key === key)?.label) : key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="border-b border-[#f5f5f5] last:border-0">
                  {(keys.length ? keys : Object.keys(row)).map((key) => (
                    <td key={key} className="px-3 py-2 align-top text-[#333]">
                      <ValueInline value={row[key]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function FrameworkAudit({ data }: { data: unknown }) {
  const record = asRecord(data);
  const nodes = asArray(record.nodes).map(asRecord);

  return (
    <div className="grid gap-3">
      <ToolTitle record={record} fallback="诊断框架" />
      <NumberedRecords records={nodes} titleKey="title" />
    </div>
  );
}

function StructuredToolAudit({ title, data }: { title: string; data: unknown }) {
  return (
    <div className="grid gap-2">
      <p className="text-xs font-semibold text-[#666666]">{title}</p>
      <StructuredValue value={data} />
    </div>
  );
}

function ToolTitle({ record, fallback }: { record: Record<string, unknown>; fallback: string }) {
  return (
    <div>
      <strong className="text-sm text-[#171717]">{String(record.title || fallback)}</strong>
      {isNonEmptyString(record.description) ? <p className="mt-1 text-sm leading-6 text-[#666666]">{String(record.description)}</p> : null}
      {isNonEmptyString(record.summary) ? <p className="mt-1 text-sm leading-6 text-[#666666]">{String(record.summary)}</p> : null}
    </div>
  );
}

function NumberedRecords({ records, titleKey }: { records: Record<string, unknown>[]; titleKey: string }) {
  return (
    <div className="grid gap-2">
      {records.map((record, index) => (
        <section key={`${String(record[titleKey])}-${index}`} className="rounded-lg border border-[#e5e5e5] bg-white p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-[#8f8f8f]">{index + 1}</span>
            <strong className="text-sm text-[#171717]">{String(record[titleKey] || `项目 ${index + 1}`)}</strong>
          </div>
          <ObjectFields value={record} skip={[titleKey]} />
        </section>
      ))}
    </div>
  );
}

function SourceUrlPart({ part }: { part: MessagePart }) {
  return (
    <PartShell label="source-url" tone="muted">
      <a className="break-all text-sm font-semibold text-[#171717] underline" href={String(part.url || "#")} target="_blank" rel="noreferrer">
        {String(part.title || part.url || part.sourceId || "source")}
      </a>
    </PartShell>
  );
}

function SourceDocumentPart({ part }: { part: MessagePart }) {
  return (
    <PartShell label="source-document" tone="muted">
      <StructuredValue value={part} />
    </PartShell>
  );
}

function FilePart({ part }: { part: MessagePart }) {
  return (
    <PartShell label="file" tone="muted">
      {isNonEmptyString(part.url) ? (
        <a className="break-all text-sm font-semibold text-[#171717] underline" href={String(part.url)} target="_blank" rel="noreferrer">
          {String(part.filename || part.url)}
        </a>
      ) : (
        <StructuredValue value={part} />
      )}
    </PartShell>
  );
}
