"use client";

import { useEveAgent } from "eve/react";
import { AlertCircle, ArrowUp, Eye, LoaderCircle, MessageSquareText, PanelLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  WISH_CREATOR_AGENT_ID,
  WISH_CREATOR_CONVERSATION_HEADER,
  WISH_CREATOR_SIDEBAR_STORAGE_KEY,
  WISH_CREATOR_SPLIT_STORAGE_KEY,
} from "@/constants/wish-creator";
import type { AgentConversation } from "@/lib/agent-team/agents/types";
import {
  deleteAgentConversation,
  fetchAgentConversationSummaries,
  renameAgentConversation,
} from "@/lib/agent-team/conversations/client-conversation-api";
import { recoverWishCreatorInitialState } from "@/lib/wish-creator/client";
import { shouldRecoverWishCreatorSession } from "@/lib/wish-creator/session-recovery";
import { saveWishCreatorSnapshot } from "@/lib/wish-creator/snapshot-client";
import { compactWishCreatorSnapshot } from "@/lib/wish-creator/snapshot-compaction";
import {
  extractHtmlArtifacts,
  extractLatestPublishedUrl,
} from "@/lib/wish-creator/html-preview";
import {
  clearPendingWishCreatorPrompt,
  getPendingWishCreatorPrompt,
  setPendingWishCreatorPrompt,
} from "@/lib/wish-creator/pending-prompt";
import {
  canRenderHtmlArtifact,
  createRequirementPathClientContext,
  filterBlockedHtmlArtifacts,
  isRequirementImplementationRelease,
  shouldBlockHtmlArtifact,
  shouldGateInitialRequirement,
} from "@/lib/wish-creator/requirement-gate";
import {
  getBlockedArtifactRevisions,
  getRequirementGateStatus,
  setBlockedArtifactRevisions,
  setRequirementGateStatus,
} from "@/lib/wish-creator/requirement-gate-storage";
import { cn } from "@/lib/utils";
import type {
  WishCreatorInitialState,
  WishCreatorRequirementGateRuntimeStatus,
  WishCreatorRequirementPath,
  WishCreatorSnapshot,
} from "@/types/wish-creator";
import { APP_BASE_PATH } from "@/utils/routing";
import { WishCreatorMessages, type WishCreatorInputResponse } from "./WishCreatorMessages";
import {
  WishCreatorMobileMenuButton,
  WishCreatorNavigation,
} from "./WishCreatorNavigation";
import { WishCreatorPreview } from "./WishCreatorPreview";
import { WishCreatorRequirementGate } from "./WishCreatorRequirementGate";
import { wishCreatorFocus, wishCreatorGrid } from "./styles";

type MobileView = "chat" | "preview";

export function WishCreatorSessionShell({
  conversationId,
  initialState,
}: {
  readonly conversationId: string;
  readonly initialState: WishCreatorInitialState;
}) {
  const [recoveredState, setRecoveredState] = useState<WishCreatorInitialState>();
  const [recoveryWarning, setRecoveryWarning] = useState<string>();
  const needsRecovery = shouldRecoverWishCreatorSession(initialState);

  useEffect(() => {
    if (!needsRecovery) return;
    const controller = new AbortController();

    void recoverWishCreatorInitialState(conversationId, initialState, controller.signal)
      .then(setRecoveredState)
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setRecoveryWarning(error instanceof Error ? error.message : "会话恢复失败。");
        setRecoveredState(initialState);
      });

    return () => controller.abort();
  }, [conversationId, initialState, needsRecovery]);

  if (needsRecovery && !recoveredState) {
    return <WishCreatorRecoveryScreen />;
  }

  return (
    <WishCreatorWorkspace
      conversationId={conversationId}
      initialState={recoveredState ?? initialState}
      recoveryWarning={recoveryWarning}
    />
  );
}

function WishCreatorWorkspace({
  conversationId,
  initialState,
  recoveryWarning,
}: {
  readonly conversationId: string;
  readonly initialState: WishCreatorInitialState;
  readonly recoveryWarning?: string;
}) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const latestSnapshotRef = useRef<WishCreatorSnapshot | undefined>(undefined);
  const saveQueueRef = useRef(Promise.resolve());
  const [input, setInput] = useState("");
  const [initialRequirement, setInitialRequirement] = useState<string>();
  const [requirementGateStatus, setRequirementGateStatusState] = useState<WishCreatorRequirementGateRuntimeStatus>("hydrating");
  const [blockedArtifactRevisions, setBlockedArtifactRevisionsState] = useState<readonly string[]>([]);
  const [submittingRequirementPath, setSubmittingRequirementPath] = useState<WishCreatorRequirementPath>();
  const [mobileView, setMobileView] = useState<MobileView>("chat");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<AgentConversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [saveWarning, setSaveWarning] = useState<string | undefined>(recoveryWarning);
  const [splitPercent, setSplitPercent] = useState(42);
  const [collapsed, setCollapsed] = useState(false);

  const persistSnapshot = useCallback((snapshot: WishCreatorSnapshot) => {
    // Artifact 的 messageSoFar 会随每个 token 累积；快照只保留每一步最新增量，避免请求体二次方膨胀。
    const compactedSnapshot = compactWishCreatorSnapshot(snapshot);
    const save = saveQueueRef.current
      .catch(() => undefined)
      .then(() => saveWishCreatorSnapshot(conversationId, compactedSnapshot))
      .then(() => setSaveWarning(undefined))
      .catch(() => {
        setSaveWarning("当前对话仍可继续，但刚才的会话快照没有保存成功。");
      });
    saveQueueRef.current = save;
    return save;
  }, [conversationId]);

  const navigateAfterSnapshotSaved = useCallback(async (path: string) => {
    const snapshot = latestSnapshotRef.current;
    // 应用内跳转仍有充足时间完成普通请求，必须进入同一队列，避免旧快照后写覆盖新快照。
    if (snapshot) await persistSnapshot(snapshot);
    else await saveQueueRef.current;
    router.push(path);
  }, [persistSnapshot, router]);

  const agent = useEveAgent({
    host: APP_BASE_PATH,
    headers: { [WISH_CREATOR_CONVERSATION_HEADER]: conversationId },
    initialEvents: initialState.events,
    initialSession: initialState.session,
    onFinish(snapshot) {
      void persistSnapshot({
        events: snapshot.events,
        messages: snapshot.data.messages,
        session: snapshot.session,
      });
    },
  });
  const busy = agent.status === "submitted" || agent.status === "streaming";
  const artifacts = useMemo(() => extractHtmlArtifacts(agent.data.messages), [agent.data.messages]);
  const blockedArtifactRevisionSet = useMemo(
    () => new Set(blockedArtifactRevisions),
    [blockedArtifactRevisions],
  );
  const allowHtmlArtifact = canRenderHtmlArtifact(requirementGateStatus);
  const blockHtmlArtifact = shouldBlockHtmlArtifact(requirementGateStatus);
  const visibleArtifacts = allowHtmlArtifact
    ? filterBlockedHtmlArtifacts(artifacts, blockedArtifactRevisionSet)
    : [];
  const publishedUrl = useMemo(
    () => extractLatestPublishedUrl(agent.data.messages) ?? initialState.latestPublishedUrl,
    [agent.data.messages, initialState.latestPublishedUrl],
  );
  const awaitingInput = useMemo(
    () => agent.data.messages.at(-1)?.parts.some((part) => part.type === "dynamic-tool" && part.toolMetadata?.eve?.inputRequest && !part.toolMetadata.eve.inputResponse) ?? false,
    [agent.data.messages],
  );
  const awaitingRequirementPath = shouldGateInitialRequirement(
    agent.data.messages.length,
    Boolean(initialRequirement),
  );

  const refreshConversations = useCallback(async () => {
    setLoadingConversations(true);
    setConversations(await fetchAgentConversationSummaries(WISH_CREATOR_AGENT_ID));
    setLoadingConversations(false);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      const savedSplit = Number(window.localStorage.getItem(WISH_CREATOR_SPLIT_STORAGE_KEY));
      if (savedSplit >= 32 && savedSplit <= 60) setSplitPercent(savedSplit);
      setCollapsed(window.localStorage.getItem(WISH_CREATOR_SIDEBAR_STORAGE_KEY) === "true");
      void refreshConversations();
    });
  }, [refreshConversations]);

  useEffect(() => {
    const prompt = getPendingWishCreatorPrompt(conversationId);
    const savedStatus = getRequirementGateStatus(conversationId);
    const savedBlockedRevisions = getBlockedArtifactRevisions(conversationId);
    const shouldGate = shouldGateInitialRequirement(agent.data.messages.length, Boolean(prompt));

    queueMicrotask(() => {
      setBlockedArtifactRevisionsState(savedBlockedRevisions);
      setRequirementGateStatusState(savedStatus ?? (shouldGate ? "awaiting-choice" : "released"));
      if (shouldGate && prompt) {
        setInitialRequirement(prompt);
        if (!savedStatus) {
          setRequirementGateStatus(conversationId, "awaiting-choice");
        }
      }
    });

    if (agent.data.messages.length > 0) clearPendingWishCreatorPrompt(conversationId);
  }, [agent.data.messages.length, conversationId]);

  useEffect(() => {
    if (!blockHtmlArtifact || artifacts.length === 0) return;
    if (busy) agent.stop();
    // 越权 artifact 已进入消息历史；必须永久隔离其 revision，否则门禁释放后残缺预览会重新出现。
    const newBlockedRevisions = artifacts
      .map(({ revision }) => revision)
      .filter((revision) => !blockedArtifactRevisionSet.has(revision));
    if (newBlockedRevisions.length === 0) return;
    const nextBlockedRevisions = [
      ...blockedArtifactRevisions,
      ...newBlockedRevisions,
    ];
    queueMicrotask(() => {
      setBlockedArtifactRevisions(conversationId, nextBlockedRevisions);
      setBlockedArtifactRevisionsState(nextBlockedRevisions);
      setSaveWarning("需求拆解尚未确认完成，已阻止提前生成页面。请选择“开始实现”后再继续。");
    });
  }, [agent, artifacts, blockedArtifactRevisions, blockedArtifactRevisionSet, blockHtmlArtifact, busy, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: busy ? "auto" : "smooth" });
  }, [agent.data.messages, busy]);

  useEffect(() => {
    if (agent.events.length === 0) return;
    const snapshot = {
      events: agent.events,
      messages: agent.data.messages,
      session: agent.session,
    } satisfies WishCreatorSnapshot;
    latestSnapshotRef.current = snapshot;

    // 长工具参数生成期间可能几十秒没有事件；在每次事件停顿后保存，避免用户离开页面丢失进度。
    const timer = window.setTimeout(() => void persistSnapshot(snapshot), 500);
    return () => window.clearTimeout(timer);
  }, [agent.data.messages, agent.events, agent.session, persistSnapshot]);

  async function sendText(text: string) {
    const content = text.trim();
    if (!content || busy || awaitingInput || awaitingRequirementPath) return;
    setInput("");

    try {
      await agent.send({ message: content });
    } catch {
      // 请求错误已经投影到 agent.error，避免事件处理器继续抛出未处理 Promise。
    }
  }

  async function chooseRequirementPath(path: WishCreatorRequirementPath) {
    if (!initialRequirement || submittingRequirementPath) return;
    setSubmittingRequirementPath(path);
    const nextStatus = path === "clarify" ? "grilling" : "released";
    setRequirementGateStatus(conversationId, nextStatus);
    setRequirementGateStatusState(nextStatus);
    clearPendingWishCreatorPrompt(conversationId);

    try {
      await agent.send({
        clientContext: createRequirementPathClientContext(path),
        message: initialRequirement,
      });
      setInitialRequirement(undefined);
    } catch {
      // 首次发送失败时恢复待选择愿望，避免用户刷新后丢失原始输入。
      setPendingWishCreatorPrompt(conversationId, initialRequirement);
      setRequirementGateStatus(conversationId, "awaiting-choice");
      setRequirementGateStatusState("awaiting-choice");
    } finally {
      setSubmittingRequirementPath(undefined);
    }
  }

  function respondToInput(responses: readonly WishCreatorInputResponse[]) {
    if (isRequirementImplementationRelease(responses)) {
      setRequirementGateStatus(conversationId, "released");
      setRequirementGateStatusState("released");
    }
    void agent.send({ inputResponses: responses }).catch(() => undefined);
  }

  const showFirstStreamingPreview = useCallback(() => {
    if (!allowHtmlArtifact || awaitingInput || !window.matchMedia("(max-width: 1023px)").matches) return;
    setMobileView("preview");
  }, [allowHtmlArtifact, awaitingInput]);

  function beginResize(event: React.PointerEvent<HTMLButtonElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    const workbench = event.currentTarget.parentElement;
    if (!workbench) return;
    const bounds = workbench.getBoundingClientRect();
    const move = (pointerEvent: PointerEvent) => {
      const next = Math.min(60, Math.max(32, ((pointerEvent.clientX - bounds.left) / bounds.width) * 100));
      setSplitPercent(next);
    };
    const finish = () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", finish);
      setSplitPercent((value) => {
        window.localStorage.setItem(WISH_CREATOR_SPLIT_STORAGE_KEY, String(value));
        return value;
      });
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", finish);
  }

  async function deleteConversation(id: string) {
    await deleteAgentConversation(WISH_CREATOR_AGENT_ID, id);
    if (id === conversationId) router.push("/wish-creator");
    else await refreshConversations();
  }

  async function renameConversation(id: string, title: string) {
    await renameAgentConversation(WISH_CREATOR_AGENT_ID, id, title);
    await refreshConversations();
  }

  return (
    <main className={cn(wishCreatorGrid, "h-dvh overflow-hidden text-white")}>
      <div className="flex h-full">
        <WishCreatorNavigation
          activeConversationId={conversationId}
          collapsed={collapsed}
          conversations={conversations}
          loading={loadingConversations}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onCreate={() => void navigateAfterSnapshotSaved("/wish-creator")}
          onDelete={(id) => void deleteConversation(id)}
          onNavigate={(path) => void navigateAfterSnapshotSaved(path)}
          onOpen={(conversation) => void navigateAfterSnapshotSaved(`/wish-creator/session/${conversation.id}`)}
          onRename={(id, title) => void renameConversation(id, title)}
          onToggle={() => setCollapsed((value) => {
            window.localStorage.setItem(WISH_CREATOR_SIDEBAR_STORAGE_KEY, String(!value));
            return !value;
          })}
        />
        <WishCreatorMobileMenuButton onClick={() => setMobileSidebarOpen(true)} />

        <div className="flex min-w-0 flex-1 flex-col">
          <nav className="grid h-12 shrink-0 grid-cols-2 border-b border-[#25302a] bg-[#080d0b] lg:hidden" aria-label="工作区">
            <MobileTab active={mobileView === "chat"} icon={<MessageSquareText />} label="对话" onClick={() => setMobileView("chat")} />
            <MobileTab active={mobileView === "preview"} icon={<Eye />} label="预览" onClick={() => setMobileView("preview")} />
          </nav>

          <div className="relative flex min-h-0 flex-1">
            <section
              className={cn("min-h-0 w-full flex-col border-r border-[#25302a] bg-[#090e0c]/93 lg:w-[var(--wish-chat-width)]", mobileView === "chat" ? "flex" : "hidden", "lg:flex")}
              style={{ "--wish-chat-width": `${splitPercent}%` } as CSSProperties}
            >
              <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[#25302a] px-5 pl-16 lg:pl-5">
                <span className="truncate text-sm font-semibold text-[#dce2de]">{initialState.title}</span>
                <span className="ml-auto flex items-center gap-1.5 text-[11px] text-[#728078]"><i className={cn("h-1.5 w-1.5 rounded-full", busy ? "animate-pulse bg-[#b8ff22]" : "bg-emerald-400")} />{busy ? "创作中" : "已保存"}</span>
              </header>
              {agent.error || saveWarning ? (
                <div className="mx-4 mt-3 flex gap-2 rounded-lg border border-red-500/25 bg-red-500/5 p-3 text-xs text-red-200"><AlertCircle className="h-4 w-4 shrink-0" /><span>{agent.error?.message ?? saveWarning}</span></div>
              ) : null}
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 [scrollbar-color:#344039_transparent]">
                {agent.data.messages.length > 0 ? (
                  <WishCreatorMessages
                    allowHtmlArtifact={allowHtmlArtifact}
                    blockedArtifactRevisions={blockedArtifactRevisionSet}
                    busy={busy}
                    messages={agent.data.messages}
                    onInputResponses={respondToInput}
                  />
                ) : awaitingRequirementPath && initialRequirement ? (
                  <WishCreatorRequirementGate
                    disabled={Boolean(submittingRequirementPath)}
                    onChoose={(path) => void chooseRequirementPath(path)}
                    requirement={initialRequirement}
                  />
                ) : (
                  <div className="grid h-full place-items-center text-center">
                    <div><p className="text-lg font-semibold text-[#dce2de]">把愿望交给 Agent</p><p className="mt-2 text-sm text-[#77837c]">它会规划、写代码并把页面放到右侧。</p></div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <form className="shrink-0 p-4" onSubmit={(event) => { event.preventDefault(); void sendText(input); }}>
                <div className="rounded-xl border border-[#344039] bg-[#0d1411] p-3 focus-within:border-[#9bd925]">
                  <textarea
                    className="h-20 w-full resize-none bg-transparent text-sm leading-6 outline-none placeholder:text-[#657069]"
                    disabled={awaitingInput || awaitingRequirementPath}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      // 中文输入法确认候选词时也会触发 Enter，组合输入结束前不能发送。
                      if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                        event.preventDefault();
                        void sendText(input);
                      }
                    }}
                    placeholder={awaitingInput || awaitingRequirementPath ? "请先处理上方确认…" : "继续告诉我你想怎么改…"}
                    value={input}
                  />
                  <div className="flex items-center justify-between"><span className="text-[11px] text-[#68736c]">页面创作不支持图片上传</span><button aria-label={busy ? "停止" : "发送"} className={cn(wishCreatorFocus, "grid h-9 w-9 place-items-center rounded-full bg-[#b8ff22] text-[#071007] disabled:opacity-40")} disabled={!busy && (!input.trim() || awaitingInput || awaitingRequirementPath)} onClick={busy ? (event) => { event.preventDefault(); agent.stop(); } : undefined} type="submit"><ArrowUp className="h-5 w-5" /></button></div>
                </div>
              </form>
            </section>

            <button aria-label="调整对话与预览宽度" className="group z-10 hidden w-1 shrink-0 cursor-col-resize items-center justify-center bg-[#17201b] hover:bg-[#b8ff22] lg:flex" onPointerDown={beginResize} type="button"><span className="absolute grid h-8 w-8 place-items-center rounded-full border border-[#313d36] bg-[#0c1210] text-[#6e7a72] group-hover:text-[#b8ff22]"><PanelLeft className="h-3.5 w-3.5" /></span></button>

            <div className={cn("min-h-0 flex-1", mobileView === "preview" ? "block" : "hidden", "lg:block")}>
              <WishCreatorPreview
                artifacts={visibleArtifacts}
                busy={busy}
                disabled={busy || awaitingInput || awaitingRequirementPath || !allowHtmlArtifact}
                latestPublishedUrl={publishedUrl}
                onPublish={(request) => {
                  setMobileView("chat");
                  void sendText(request);
                }}
                onStreamingPreviewReady={showFirstStreamingPreview}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function WishCreatorRecoveryScreen() {
  return (
    <main className={cn(wishCreatorGrid, "grid h-dvh place-items-center text-white")}>
      <div className="max-w-sm text-center">
        <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-[#b8ff22]" />
        <h1 className="mt-5 text-lg font-semibold">正在恢复 Agent 运行现场</h1>
        <p className="mt-2 text-sm leading-6 text-[#7c8981]">页面生成仍在服务端继续，完成后会自动补回对话和预览。</p>
      </div>
    </main>
  );
}

function MobileTab({ active, icon, label, onClick }: { active: boolean; icon: React.ReactElement<{ className?: string }>; label: string; onClick: () => void }) {
  return <button aria-pressed={active} className={cn("flex items-center justify-center gap-2 text-sm text-[#7b8780]", active && "border-b-2 border-[#b8ff22] text-[#b8ff22]")} onClick={onClick} type="button">{icon}{label}</button>;
}
