import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

export type MessagePart = Record<string, unknown>;

export function PartShell({
  label,
  meta,
  tone,
  children,
}: {
  label: string;
  meta?: string;
  tone: "tool" | "muted" | "danger";
  children?: ReactNode;
}) {
  const className = tone === "danger"
    ? "border-[#f2c6bc] bg-[#fff4f1]"
    : tone === "tool"
      ? "border-[#d6e7ff] bg-[#f8fbff]"
      : "border-[#e5e5e5] bg-white";

  return (
    <section className={`rounded-lg border ${className} p-3`}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-[#e5e5e5] bg-white px-2 py-0.5 font-mono text-xs text-[#666666]">{label}</span>
        {meta ? <span className="font-mono text-xs text-[#8f8f8f]">{meta}</span> : null}
      </div>
      {children}
    </section>
  );
}

export function StructuredValue({ value, compact = false }: { value: unknown; compact?: boolean }) {
  if (value === null || value === undefined) return <span className="text-[#8f8f8f]">null</span>;
  if (typeof value === "string") return <span className="whitespace-pre-wrap break-words">{value}</span>;
  if (typeof value === "number" || typeof value === "boolean") return <span className="font-mono">{String(value)}</span>;

  if (Array.isArray(value)) {
    if (!value.length) return <span className="text-[#8f8f8f]">[]</span>;
    return (
      <div className={compact ? "grid gap-1" : "mt-2 grid gap-2"}>
        {value.map((item, index) => (
          <div key={index} className="grid grid-cols-[28px_minmax(0,1fr)] gap-2">
            <span className="font-mono text-xs text-[#8f8f8f]">{index + 1}</span>
            <div className="min-w-0">
              <StructuredValue value={item} compact />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    return <ObjectFields value={asRecord(value)} />;
  }

  return <span>{String(value)}</span>;
}

export function ValueInline({ value }: { value: unknown }) {
  if (typeof value === "object" && value !== null) {
    return (
      <code className="break-words rounded bg-[#fafafa] px-1.5 py-0.5 font-mono text-xs">
        {JSON.stringify(value)}
      </code>
    );
  }

  return <span className="whitespace-pre-wrap break-words">{String(value ?? "")}</span>;
}

export function RawJsonDetails({ value }: { value: unknown }) {
  return (
    <details className="mt-3 rounded-lg border border-[#e5e5e5] bg-white p-3">
      <summary className="cursor-pointer text-xs font-semibold text-[#666666]">原始 JSON</summary>
      <pre className="mt-2 max-h-[360px] overflow-auto whitespace-pre-wrap break-words rounded-md bg-[#fafafa] p-3 font-mono text-xs leading-5 text-[#333]">
        {JSON.stringify(value, null, 2)}
      </pre>
    </details>
  );
}

export function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className={markdownClassName}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

export function BadgeText({ children }: { children: ReactNode }) {
  return <span className="rounded-md border border-[#e5e5e5] bg-white px-2 py-1 font-mono text-xs text-[#666666]">{children}</span>;
}

export function ObjectFields({ value, skip = [] }: { value: Record<string, unknown>; skip?: string[] }) {
  const entries = Object.entries(value).filter(([key, fieldValue]) => !skip.includes(key) && fieldValue !== undefined && fieldValue !== null && fieldValue !== "");
  if (!entries.length) return null;

  return (
    <dl className="mt-2 grid gap-2">
      {entries.map(([key, fieldValue]) => (
        <div key={key} className="grid gap-1 text-sm sm:grid-cols-[112px_minmax(0,1fr)]">
          <dt className="font-mono text-xs text-[#8f8f8f]">{key}</dt>
          <dd className="min-w-0 text-[#333]">
            <StructuredValue value={fieldValue} compact />
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function FieldLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#e5e5e5] bg-white px-3 py-2">
      <span className="block text-xs font-semibold text-[#666666]">{label}</span>
      <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-[#333]">{value}</p>
    </div>
  );
}

export function normalizeParts(parts: unknown): MessagePart[] {
  if (!Array.isArray(parts)) return [];
  return parts.filter((part): part is MessagePart => Boolean(part) && typeof part === "object" && !Array.isArray(part));
}

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter(isNonEmptyString).map(String) : [];
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function getToolName(part: MessagePart): string {
  if (part.type === "dynamic-tool" && isNonEmptyString(part.toolName)) return String(part.toolName);
  return String(part.type || "tool").replace(/^tool-/, "");
}

export function getToolMeta(part: MessagePart): string {
  return [part.state, part.toolCallId].filter(isNonEmptyString).map(String).join(" · ");
}

const markdownClassName =
  "max-w-none overflow-x-auto break-words text-sm leading-7 text-[#333] [&_a]:font-medium [&_a]:text-[#171717] [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-[#d4d4d4] [&_blockquote]:pl-3 [&_blockquote]:text-[#666666] [&_code]:rounded [&_code]:bg-white [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.92em] [&_h1]:mt-5 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:mt-5 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-semibold [&_li]:my-1 [&_ol]:ml-5 [&_ol]:list-decimal [&_p]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-[#eaeaea] [&_pre]:bg-white [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_td]:border [&_td]:border-[#e5e5e5] [&_td]:px-2 [&_td]:py-1.5 [&_th]:border [&_th]:border-[#e5e5e5] [&_th]:bg-white [&_th]:px-2 [&_th]:py-1.5 [&_ul]:ml-5 [&_ul]:list-disc";
