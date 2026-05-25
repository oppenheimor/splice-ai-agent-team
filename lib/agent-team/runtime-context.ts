const DEFAULT_TIME_ZONE = "Asia/Shanghai";

export type RuntimeContextInput = {
  now?: Date;
  timeZone?: string;
};

export function buildRuntimeContext({ now = new Date(), timeZone }: RuntimeContextInput = {}): string {
  const resolvedTimeZone = normalizeTimeZone(timeZone);
  const formatted = formatCurrentDateTime(now, resolvedTimeZone);

  return [
    "【运行时上下文】",
    `当前用户时区：${resolvedTimeZone}`,
    `当前用户本地时间：${formatted}`,
    `当前 UTC ISO 时间：${now.toISOString()}`,
    "",
    "处理用户提到的相对时间时，必须以上面的当前用户本地时间为基准，例如：今天、明天、后天、这周日、下周末、两天后、今晚、周末。",
    "如果相对时间存在歧义，先用一句话确认关键日期；不要在未确认时擅自编造具体日期。",
  ].join("\n");
}

export function normalizeTimeZone(timeZone: string | undefined): string {
  if (!timeZone) return DEFAULT_TIME_ZONE;

  try {
    new Intl.DateTimeFormat("zh-CN", { timeZone }).format(new Date());
    return timeZone;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

function formatCurrentDateTime(now: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
}
