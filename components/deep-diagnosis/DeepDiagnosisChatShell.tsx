"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { AgentManifest } from "@/lib/agent-team/agents/types";
import { useAgentChat } from "@/lib/agent-team/chat/useAgentChat";
import { popPendingPrompt } from "@/lib/agent-team/storage/pending-prompts";
import { useCreditBalance } from "@/lib/credits/useCreditBalance";
import {
  DEEP_DIAGNOSIS_EMPTY_CONVERSATION_PROMPTS,
  DEEP_DIAGNOSIS_PORTABLE_REPORT_CREDIT_COST,
  DEEP_DIAGNOSIS_PORTABLE_REPORT_REQUEST,
} from "@/constants/deep-diagnosis";
import { evaluateDeepDiagnosisDeliverableReadiness } from "@/lib/deep-diagnosis/deliverable-readiness";
import { evaluateDeepDiagnosisReportReadiness } from "@/lib/deep-diagnosis/report-readiness";
import {
  getDeepDiagnosisPortableReportAction,
  getDeepDiagnosisPortableReportStageLabel,
  hasPendingDeepDiagnosisUserChoice,
} from "@/utils/deep-diagnosis/report-action";
import { cn } from "@/lib/utils";
import { APP_BASE_PATH, buildBrowserPath } from "@/utils/routing";
import {
  ChatMessage,
  Composer,
  ConversationLoadingState,
  EmptyConversation,
  ThinkingState,
} from "./DeepDiagnosisChatParts";
import {
  ConversationSidebar,
  MobileConversationDrawer,
} from "./DeepDiagnosisNavigation";
import {
  MobileConversationHistoryButton,
  MobileConversationNavbar,
} from "./DeepDiagnosisMobileNavbar";
import { DeepDiagnosisReportConfirmDialog } from "./DeepDiagnosisReportConfirmDialog";
import {
  deepDiagnosisChatShell,
  deepDiagnosisChatWorkbench,
} from "./styles";
import { CreditErrorNotice } from "@/components/credits/CreditStatus";

interface DeepDiagnosisChatShellProps {
  agent: AgentManifest;
  conversationId: string;
}

const DEFAULT_COMPOSER_BOTTOM_INSET = 256;
const DESKTOP_COMPOSER_SCROLL_GAP = 32;
const MOBILE_COMPOSER_SCROLL_GAP = 24;
const SIDEBAR_COLLAPSED_STORAGE_KEY = "deep-diagnosis.sidebar-collapsed.v1";
const SIDEBAR_MANUALLY_TOGGLED_STORAGE_KEY = "deep-diagnosis.sidebar-manually-toggled.v1";
const SIDEBAR_AUTO_EXPANDED_AFTER_FIRST_MESSAGE_STORAGE_KEY =
  "deep-diagnosis.sidebar-auto-expanded-after-first-message.v1";
const MOBILE_MEDIA_QUERY = "(max-width: 639px)";
const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";

export function DeepDiagnosisChatShell({
  agent,
  conversationId,
}: DeepDiagnosisChatShellProps) {
  const router = useRouter();
  const chat = useAgentChat(agent, {
    conversationId,
    persistence: "database",
  });
  const credit = useCreditBalance();
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLElement | null>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const shouldStickToBottomRef = useRef(true);
  const pendingPromptSentRef = useRef(false);
  const [composerBottomInset, setComposerBottomInset] = useState(
    DEFAULT_COMPOSER_BOTTOM_INSET,
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [reportConfirmOpen, setReportConfirmOpen] = useState(false);
  const activeConversationMessageCount = getKnownMessageCount(
    chat.activeConversation,
    chat.messages.length,
  );
  const shouldShowConversationLoading =
    chat.isLoadingActiveConversation &&
    (activeConversationMessageCount === undefined ||
      activeConversationMessageCount > 0);
  const isEmptyConversation =
    !shouldShowConversationLoading && chat.messages.length === 0;
  const showMobileNavbar = chat.messages.length > 0;
  const hasPendingChoice = hasPendingDeepDiagnosisUserChoice(chat.messages);
  const deliverableReadiness = evaluateDeepDiagnosisDeliverableReadiness(chat.messages);
  const reportReadiness = evaluateDeepDiagnosisReportReadiness(chat.messages);
  const hasPortableReportReady =
    reportReadiness.ready ||
    (
      deliverableReadiness.hasReportLikeDraft &&
      deliverableReadiness.level !== "none" &&
      deliverableReadiness.missingSignals.length === 0
    );
  const portableReportAction = getDeepDiagnosisPortableReportAction({
    hasPendingChoice,
    hasPortableReportReady,
    isBusy: chat.isBusy,
    isEmptyConversation,
    shouldShowConversationLoading,
  });
  const portableReportStageLabel = getDeepDiagnosisPortableReportStageLabel({
    hasPendingChoice,
    hasPortableReportReady,
    isBusy: chat.isBusy,
    isEmptyConversation,
    shouldShowConversationLoading,
  });

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const storedCollapsed = window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY);
      if (storedCollapsed !== null) {
        setSidebarCollapsed(storedCollapsed === "true");
      }
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (pendingPromptSentRef.current || !chat.activeConversation || chat.isBusy) return;
    const prompt = popPendingPrompt(chat.activeConversation.id);
    if (!prompt) return;
    pendingPromptSentRef.current = true;
    shouldStickToBottomRef.current = true;
    chat.sendText(prompt);
  }, [chat]);

  useEffect(() => {
    const composer = composerRef.current;
    if (!composer) return;

    const updateComposerInset = () => {
      // Composer 是悬浮层，滚动区必须按真实高度留出可见空间，避免正文从输入框下面穿过。
      const visualComposer = composer.querySelector<HTMLElement>(
        "[data-deep-diagnosis-composer-card]",
      );
      const composerRect = composer.getBoundingClientRect();
      const reservedHeight = visualComposer
        ? composerRect.bottom - visualComposer.getBoundingClientRect().top
        : composerRect.height;
      const nextInset = Math.ceil(
        reservedHeight + getComposerScrollGap(),
      );
      setComposerBottomInset((currentInset) =>
        Math.abs(currentInset - nextInset) > 1 ? nextInset : currentInset,
      );
    };

    updateComposerInset();
    const visualViewport = window.visualViewport;

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateComposerInset);
      visualViewport?.addEventListener("resize", updateComposerInset);
      visualViewport?.addEventListener("scroll", updateComposerInset);
      return () => {
        window.removeEventListener("resize", updateComposerInset);
        visualViewport?.removeEventListener("resize", updateComposerInset);
        visualViewport?.removeEventListener("scroll", updateComposerInset);
      };
    }

    const resizeObserver = new ResizeObserver(updateComposerInset);
    resizeObserver.observe(composer);
    window.addEventListener("resize", updateComposerInset);
    visualViewport?.addEventListener("resize", updateComposerInset);
    visualViewport?.addEventListener("scroll", updateComposerInset);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateComposerInset);
      visualViewport?.removeEventListener("resize", updateComposerInset);
      visualViewport?.removeEventListener("scroll", updateComposerInset);
    };
  }, [isEmptyConversation, shouldShowConversationLoading]);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;
    if (!shouldStickToBottomRef.current) return;
    if (scrollFrameRef.current)
      window.cancelAnimationFrame(scrollFrameRef.current);
    scrollFrameRef.current = window.requestAnimationFrame(() => {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    });
    return () => {
      if (scrollFrameRef.current)
        window.cancelAnimationFrame(scrollFrameRef.current);
    };
  }, [chat.messages, chat.isBusy, composerBottomInset]);

  useEffect(() => {
    function handleHistoryNavigation() {
      const match = window.location.pathname.match(
        new RegExp(`^(?:${APP_BASE_PATH})?/deep-diagnosis/chat/([^/]+)$`),
      );
      if (!match) return;

      void chat.openConversationById(decodeURIComponent(match[1]));
    }

    window.addEventListener("popstate", handleHistoryNavigation);
    return () => window.removeEventListener("popstate", handleHistoryNavigation);
  }, [chat]);

  function updateScrollStickiness() {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;
    shouldStickToBottomRef.current =
      scrollArea.scrollHeight - scrollArea.scrollTop - scrollArea.clientHeight <
      96;
  }

  async function handleDeleteConversation(conversationIdToDelete: string) {
    const deletingActive = chat.activeConversation?.id === conversationIdToDelete;
    const next = await chat.removeConversation(conversationIdToDelete);

    setMobileSidebarOpen(false);

    if (!deletingActive) return;

    if (next) {
      router.push(`/deep-diagnosis/chat/${next.id}`);
    } else {
      const replacement = chat.startNewConversation();
      router.push(`/deep-diagnosis/chat/${replacement.id}`);
    }
  }

  function handleCreateConversation() {
    const next = chat.startNewConversation();
    setMobileSidebarOpen(false);
    router.push(`/deep-diagnosis/chat/${next.id}`);
  }

  function handleToggleSidebarCollapsed() {
    setSidebarCollapsed((collapsed) => {
      const nextCollapsed = !collapsed;
      window.localStorage.setItem(SIDEBAR_MANUALLY_TOGGLED_STORAGE_KEY, "true");
      window.localStorage.setItem(
        SIDEBAR_COLLAPSED_STORAGE_KEY,
        String(nextCollapsed),
      );
      return nextCollapsed;
    });
  }

  function maybeAutoExpandSidebarAfterFirstMessage(wasEmptyConversation: boolean) {
    if (!wasEmptyConversation) return;
    if (!sidebarCollapsed) return;
    if (!isDesktopViewport()) return;
    if (window.localStorage.getItem(SIDEBAR_MANUALLY_TOGGLED_STORAGE_KEY) === "true") return;
    if (window.localStorage.getItem(SIDEBAR_AUTO_EXPANDED_AFTER_FIRST_MESSAGE_STORAGE_KEY) === "true") return;

    setSidebarCollapsed(false);
    window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, "false");
    window.localStorage.setItem(SIDEBAR_AUTO_EXPANDED_AFTER_FIRST_MESSAGE_STORAGE_KEY, "true");
  }

  function handleSendMessage(text?: string) {
    const content = (text ?? chat.input).trim();
    if (!content || chat.isBusy) return;

    const wasEmptyConversation = chat.messages.length === 0;
    chat.sendText(content);
    maybeAutoExpandSidebarAfterFirstMessage(wasEmptyConversation);
  }

  function handleRequestPortableReport() {
    if (portableReportAction.disabled) return;
    setReportConfirmOpen(false);
    shouldStickToBottomRef.current = true;
    handleSendMessage(DEEP_DIAGNOSIS_PORTABLE_REPORT_REQUEST);
  }

  function handleOpenPortableReportConfirm() {
    if (portableReportAction.disabled) return;
    setReportConfirmOpen(true);
  }

  function handleOpenConversation(conversation: ReturnType<typeof useAgentChat>["conversations"][number]) {
    setMobileSidebarOpen(false);
    void chat.switchConversation(conversation);
    window.history.pushState(null, "", buildBrowserPath(`/deep-diagnosis/chat/${conversation.id}`));
  }

  const scrollBottomInset =
    isEmptyConversation || shouldShowConversationLoading ? 24 : composerBottomInset;

  return (
    <main className={deepDiagnosisChatShell}>
      <div className={deepDiagnosisChatWorkbench}>
        <ConversationSidebar
          conversations={chat.conversations}
          activeConversationId={chat.activeConversation?.id || conversationId}
          collapsed={sidebarCollapsed}
          loading={chat.isLoadingConversations}
          onToggleCollapsed={handleToggleSidebarCollapsed}
          onCreate={handleCreateConversation}
          onOpen={handleOpenConversation}
          onDelete={(id) => void handleDeleteConversation(id)}
          onRename={(id, title) => void chat.renameConversation(id, title)}
          credit={credit}
        />
        {showMobileNavbar ? (
          <MobileConversationNavbar
            sidebarOpen={mobileSidebarOpen}
            onToggleSidebar={() => setMobileSidebarOpen((open) => !open)}
            onCreate={handleCreateConversation}
          />
        ) : null}
        {!showMobileNavbar && isEmptyConversation ? (
          <MobileConversationHistoryButton
            className="lg:hidden"
            onOpen={() => setMobileSidebarOpen(true)}
          />
        ) : null}
        <MobileConversationDrawer
          open={mobileSidebarOpen}
          conversations={chat.conversations}
          activeConversationId={chat.activeConversation?.id || conversationId}
          loading={chat.isLoadingConversations}
          onClose={() => setMobileSidebarOpen(false)}
          onOpen={handleOpenConversation}
          onDelete={(id) => void handleDeleteConversation(id)}
          onRename={(id, title) => void chat.renameConversation(id, title)}
          credit={credit}
        />
        <section className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <section className="relative min-h-0 flex-1 overflow-hidden">
            <div
              ref={scrollAreaRef}
              onScroll={updateScrollStickiness}
              className={cn(
                "h-full min-h-0 overflow-y-auto overscroll-contain px-4 [scrollbar-color:#d4d4d4_transparent] scrollbar-thin sm:px-5 lg:px-6 lg:pt-6",
                showMobileNavbar ? "pt-[4.5rem]" : "pt-0",
              )}
              style={{
                paddingBottom: scrollBottomInset,
                scrollPaddingBottom: scrollBottomInset,
              }}
            >
              {shouldShowConversationLoading ? (
                <ConversationLoadingState />
              ) : isEmptyConversation ? (
                <EmptyConversation>
                  <div className="mt-3">
                    <Composer
                      composerRef={composerRef}
                      input={chat.input}
                      isBusy={chat.isBusy}
                      lifted
                      placement="inline"
                      prompts={DEEP_DIAGNOSIS_EMPTY_CONVERSATION_PROMPTS}
                      onInputChange={chat.setInput}
                      onPromptSelect={(prompt) => {
                        shouldStickToBottomRef.current = true;
                        handleSendMessage(prompt);
                      }}
                      onSend={() => {
                        shouldStickToBottomRef.current = true;
                        handleSendMessage();
                      }}
                      onStop={chat.stop}
                      reportAction={{
                        disabled: portableReportAction.disabled,
                        disabledReason: portableReportAction.disabledReason,
                        label: portableReportAction.label,
                        onClick: handleOpenPortableReportConfirm,
                      }}
                    />
                  </div>
                </EmptyConversation>
              ) : chat.messages.length === 0 ? (
                <EmptyConversation />
              ) : (
                <div className="mx-auto max-w-200 space-y-6 sm:space-y-8">
                  {chat.messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      addToolOutput={chat.addToolOutput}
                    />
                  ))}
                  {chat.isBusy ? <ThinkingState /> : null}
                  <CreditErrorNotice error={chat.error} />
                </div>
              )}
            </div>
            {!isEmptyConversation && !shouldShowConversationLoading ? (
              <Composer
                composerRef={composerRef}
                input={chat.input}
                isBusy={chat.isBusy}
                reportAction={{
                  disabled: portableReportAction.disabled,
                  disabledReason: portableReportAction.disabledReason,
                  label: portableReportAction.label,
                  onClick: handleOpenPortableReportConfirm,
                }}
                onInputChange={chat.setInput}
                onSend={() => {
                  shouldStickToBottomRef.current = true;
                  handleSendMessage();
                }}
                onStop={chat.stop}
              />
            ) : null}
          </section>
        </section>
      </div>
      <DeepDiagnosisReportConfirmDialog
        creditCost={DEEP_DIAGNOSIS_PORTABLE_REPORT_CREDIT_COST}
        open={reportConfirmOpen}
        stageLabel={portableReportStageLabel}
        onClose={() => setReportConfirmOpen(false)}
        onConfirm={handleRequestPortableReport}
      />
    </main>
  );
}

function getKnownMessageCount(
  conversation: ReturnType<typeof useAgentChat>["activeConversation"],
  fallbackCount: number,
) {
  if (!conversation) return undefined;
  const metadataCount = conversation.metadata?.messageCount;
  if (typeof metadataCount === "number") return metadataCount;
  return conversation.messages?.length ?? fallbackCount;
}

function isDesktopViewport() {
  return window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
}

function getComposerScrollGap() {
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches
    ? MOBILE_COMPOSER_SCROLL_GAP
    : DESKTOP_COMPOSER_SCROLL_GAP;
}
