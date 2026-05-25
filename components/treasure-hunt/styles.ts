export const treasureShell =
  "[--animal-bg-color-secondary:#f0e8d8] [--animal-bg-color:#fff8df] [--animal-primary-color-hover:#3dd4c6] [--animal-primary-color:#19c8b9] [--animal-text-color:#725d42] h-screen overflow-hidden bg-[#9fe3d5] font-[var(--animal-font-family)] text-[#725d42]";

export const treasureSky =
  "pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(255,248,223,0.95)_0_78px,transparent_80px),radial-gradient(circle_at_88%_10%,rgba(255,255,255,0.62)_0_60px,transparent_62px),linear-gradient(180deg,#96e5da_0%,#c7f0d7_58%,#f6df8f_100%)] after:absolute after:inset-[auto_-8vw_-16vh] after:h-[30vh] after:rounded-t-[50%] after:bg-[#86d68b] after:content-[''] after:shadow-[16vw_-5vh_0_2vh_#75c97e,42vw_-3vh_0_1vh_#93dc91,68vw_-6vh_0_3vh_#7aca7f]";

export const treasureHeroCard =
  "!border-[1.5px] !border-[rgba(114,93,66,0.12)] !bg-[linear-gradient(180deg,rgba(255,253,242,0.98)_0%,rgba(255,247,225,0.96)_100%)] !text-[#6b553d] !shadow-[0_8px_0_rgba(114,93,66,0.16),0_18px_36px_rgba(93,75,45,0.12)] max-sm:!shadow-[0_6px_0_rgba(114,93,66,0.12),0_12px_26px_rgba(93,75,45,0.1)] [&_*]:!text-inherit [&>div]:max-sm:!p-4";

export const treasureMessageCard =
  "!border-0 !shadow-[0_8px_0_rgba(114,93,66,0.16),0_18px_36px_rgba(93,75,45,0.12)] max-w-full max-sm:!shadow-[0_5px_0_rgba(114,93,66,0.12),0_10px_22px_rgba(93,75,45,0.1)] [&>div]:w-full";

export const treasureUserMessageCard = "[&_*]:!text-white !text-white";

export const treasureIconButton =
  "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border-2 border-[#aaa69d] bg-[#fff8df] px-3.5 text-[0.95rem] font-black text-[#725d42] shadow-[0_4px_0_#d8c8a2] transition active:translate-y-0.5 active:shadow-[0_2px_0_#d8c8a2]";

export const treasureHistoryRoundButton =
  "inline-grid place-items-center rounded-full border-2 border-[#c4b89e] bg-[#fff8df] text-[#725d42] shadow-[0_3px_0_#d8c8a2] transition active:translate-y-0.5 active:shadow-[0_1px_0_#d8c8a2]";

export const treasureScrollbarHidden =
  "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

export const treasureComposer =
  "grid w-[min(100%,760px)] grid-cols-[minmax(0,1fr)_auto] items-center gap-2 justify-self-center rounded-full bg-[#fff8df]/96 py-[0.45rem] pl-[0.65rem] pr-2 shadow-[0_4px_0_#d8c8a2] focus-within:shadow-[0_4px_0_#c9b98f,0_0_0_2px_rgba(168,152,120,0.2)] max-sm:w-[min(100%,680px)] max-sm:py-[0.38rem] max-sm:pl-[0.55rem] max-sm:pr-[0.42rem]";

export const treasureComposerInput =
  "min-w-0 border-0 bg-transparent py-0 pl-4 pr-3 font-[var(--animal-font-family)] text-base font-bold leading-[2.85rem] text-[#725d42] outline-0 placeholder:text-[#c4b89e] max-sm:pl-[0.85rem] max-sm:text-[0.95rem] max-sm:leading-[2.7rem]";

export const treasureSendButton =
  "inline-grid h-12 w-12 flex-none place-items-center rounded-full border-2 border-[#c4b89e] bg-[#f8f8f0] text-[#725d42] shadow-[0_3px_0_#bdaea0] transition disabled:opacity-45 active:enabled:translate-y-0.5 active:enabled:shadow-[0_1px_0_#bdaea0] max-sm:h-11 max-sm:w-11";

export const treasureToolPanel =
  "mt-4 w-full border-t-2 border-dashed border-[#e4d6bb] pt-4 max-sm:mt-3.5";

export const treasureToolIcon =
  "grid h-10 w-10 flex-none place-items-center rounded-full bg-[#fff8df] shadow-[0_3px_0_#d8c8a2]";

const resultBase =
  "w-full rounded-[28px] border-2 p-5 shadow-[0_5px_0_var(--result-shadow)] max-sm:rounded-[22px] max-sm:p-4 [background:var(--result-bg)] [border-color:var(--result-border)] [color:var(--result-fg)]";

export const treasureResultCard = resultBase;

export const treasureResultBody = "[color:var(--result-muted)]";

export const treasureResultPill =
  "rounded-full px-3 py-1 font-black [background:var(--result-pill-bg)] [color:var(--result-pill-fg)]";

export const treasureResultTones = [
  "[--result-bg:#f7cd67] [--result-border:rgba(114,93,66,0.14)] [--result-fg:#725d42] [--result-muted:#806b4d] [--result-pill-bg:rgba(255,248,223,0.55)] [--result-pill-fg:var(--result-fg)] [--result-shadow:rgba(114,93,66,0.14)]",
  "[--result-bg:#82d5bb] [--result-border:rgba(36,91,81,0.2)] [--result-fg:#245b51] [--result-muted:#376f65] [--result-pill-bg:rgba(230,249,246,0.72)] [--result-pill-fg:#0b746b] [--result-shadow:rgba(36,91,81,0.16)]",
  "[--result-bg:#f8a6b2] [--result-border:rgba(116,56,72,0.18)] [--result-fg:#743848] [--result-muted:#884c5c] [--result-pill-bg:rgba(255,238,242,0.7)] [--result-pill-fg:#743848] [--result-shadow:rgba(116,56,72,0.14)]",
  "[--result-bg:#889df0] [--result-border:rgba(255,255,255,0.22)] [--result-fg:#fffdf2] [--result-muted:rgba(255,253,242,0.88)] [--result-pill-bg:rgba(255,255,255,0.22)] [--result-pill-fg:#fffdf2] [--result-shadow:rgba(49,63,128,0.22)]",
  "[--result-bg:#e59266] [--result-border:rgba(255,255,255,0.2)] [--result-fg:#fffdf2] [--result-muted:rgba(255,253,242,0.88)] [--result-pill-bg:rgba(255,255,255,0.24)] [--result-pill-fg:#fffdf2] [--result-shadow:rgba(114,61,38,0.2)]",
  "[--result-bg:#d1da49] [--result-border:rgba(61,90,26,0.18)] [--result-fg:#3d5a1a] [--result-muted:#566a2c] [--result-pill-bg:rgba(255,253,242,0.48)] [--result-pill-fg:#3d5a1a] [--result-shadow:rgba(61,90,26,0.14)]",
];

export const treasureGiftCard =
  "w-full rounded-3xl bg-[#fffdf2]/94 p-4 shadow-[inset_0_0_0_1px_rgba(216,200,162,0.7),0_3px_0_rgba(114,93,66,0.1)] max-sm:px-3.5 max-sm:py-[1.15rem]";

export const treasureLinkButton =
  "mt-3 inline-flex w-fit items-center justify-center rounded-full bg-[#19c8b9] px-3.5 py-2 text-sm font-black text-white shadow-[0_3px_0_#0aa99e]";

export const treasureWishCard =
  "relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,rgba(255,255,255,0.38),transparent_42%),#fff8df] p-5 shadow-[inset_0_0_0_2px_rgba(216,200,162,0.7),0_5px_0_rgba(114,93,66,0.12)] before:absolute before:right-[0.9rem] before:top-3 before:h-10 before:w-10 before:rounded-full before:bg-[#f8a6b2] before:opacity-35 before:content-[''] max-sm:rounded-[22px] max-sm:p-4";

export const treasureVideoScene =
  "relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3.5 rounded-3xl bg-[#fffdf2]/95 px-4 py-[1.35rem] shadow-[inset_0_0_0_1px_rgba(216,200,162,0.75),0_4px_0_rgba(114,93,66,0.1)] before:absolute before:left-3 before:right-3 before:top-[0.7rem] before:h-[3px] before:bg-[repeating-linear-gradient(90deg,rgba(114,93,66,0.2)_0_8px,transparent_8px_14px)] before:content-[''] after:absolute after:bottom-[0.7rem] after:left-3 after:right-3 after:h-[3px] after:bg-[repeating-linear-gradient(90deg,rgba(114,93,66,0.2)_0_8px,transparent_8px_14px)] after:content-[''] max-sm:grid-cols-[2rem_minmax(0,1fr)] max-sm:gap-2.5 max-sm:rounded-[20px] max-sm:px-3.5 max-sm:py-[1.15rem]";

export const treasureVideoIndex =
  "relative z-[1] grid h-9 w-9 place-items-center rounded-full bg-[#725d42] font-black text-[#fff8df] shadow-[0_3px_0_rgba(114,93,66,0.18)] max-sm:h-8 max-sm:w-8 max-sm:text-sm";

export const treasureVideoCaption =
  "mt-3.5 rounded-2xl border-l-4 border-[#19c8b9] bg-[#e6f9f6] px-3.5 py-3 text-[0.95rem] font-bold leading-[1.7] text-[#725d42] max-sm:px-3 max-sm:py-2.5";

export const treasureVideoMeta =
  "grid grid-cols-[3.25rem_minmax(0,1fr)] items-start gap-2 text-xs leading-[1.6] text-[#8f806b] [&_b]:font-bold [&_span]:w-fit [&_span]:rounded-full [&_span]:bg-[#fff8df] [&_span]:px-2 [&_span]:py-0.5 [&_span]:font-black [&_span]:text-[#0aa99e]";

export const treasureTimeline =
  "relative grid gap-0 before:absolute before:bottom-5 before:left-5 before:top-5 before:w-1 before:rounded-full before:bg-[linear-gradient(180deg,#19c8b9,#f7cd67_58%,#82d5bb)] before:opacity-55 before:content-[''] max-sm:before:left-[0.9rem] max-sm:before:w-[3px]";

export const treasureTimelineItem =
  "relative grid grid-cols-[2.75rem_minmax(0,1fr)] gap-3.5 pb-4 last:pb-0 max-sm:grid-cols-[2rem_minmax(0,1fr)] max-sm:gap-2";

export const treasureTimelineNode =
  "relative z-[1] grid h-11 w-11 place-items-center rounded-full border-4 border-[#fff8df] bg-[#19c8b9] shadow-[0_3px_0_rgba(114,93,66,0.18)] max-sm:h-8 max-sm:w-8 max-sm:border-[3px] [&_span]:text-base [&_span]:font-black [&_span]:leading-none [&_span]:text-white max-sm:[&_span]:text-sm";

export const treasureTimelineContent =
  "min-w-0 rounded-3xl bg-[#fffdf2]/92 p-4 shadow-[inset_0_0_0_1px_rgba(216,200,162,0.65)] max-sm:rounded-[18px] max-sm:p-3";

export const treasureTimelineTime =
  "inline-flex max-w-full items-center rounded-full bg-[#e6f9f6] px-3 py-1.5 text-sm font-black leading-snug text-[#0aa99e] max-sm:px-2.5 max-sm:py-1 max-sm:text-[0.82rem]";

export const treasureMarkdown =
  "mt-3 space-y-3 text-[15px] font-medium leading-7 text-[#725d42] first:mt-0 [&_blockquote]:m-0 [&_code]:rounded-full [&_code]:bg-[#fff8df]/75 [&_code]:px-2 [&_code]:py-0.5 [&_code]:font-mono [&_ol]:m-0 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:m-0 [&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-[18px] [&_td]:border-2 [&_td]:border-[#e8e2d6] [&_td]:px-2.5 [&_td]:py-2 [&_th]:border-2 [&_th]:border-[#e8e2d6] [&_th]:bg-[#fff8df] [&_th]:px-2.5 [&_th]:py-2 [&_th]:font-black [&_ul]:m-0 [&_ul]:list-disc [&_ul]:pl-5";
