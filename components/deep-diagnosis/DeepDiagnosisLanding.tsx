"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AgentConversation, AgentManifest } from "@/lib/agent-team/agents/types";
import { createId } from "@/lib/agent-team/id";
import { setPendingPrompt } from "@/lib/agent-team/storage/pending-prompts";
import { useCreditBalance } from "@/lib/credits/useCreditBalance";
import {
  DEEP_DIAGNOSIS_EMPTY_CONVERSATION_PROMPTS,
  DEEP_DIAGNOSIS_PORTABLE_REPORT_CREDIT_COST,
  DEEP_DIAGNOSIS_PORTABLE_REPORT_REQUEST,
} from "@/constants/deep-diagnosis";
import {
  deleteAgentConversation,
  fetchAgentConversationSummaries,
  renameAgentConversation,
} from "@/lib/agent-team/conversations/client-conversation-api";
import { Composer, EmptyConversation } from "./DeepDiagnosisChatParts";
import { DeepDiagnosisReportConfirmDialog } from "./DeepDiagnosisReportConfirmDialog";
import {
  deepDiagnosisChatShell,
  deepDiagnosisChatWorkbench,
} from "./styles";
import { ConversationSidebar, MobileConversationDrawer } from "./DeepDiagnosisNavigation";
import { MobileConversationHistoryButton } from "./DeepDiagnosisMobileNavbar";

interface DeepDiagnosisLandingProps {
  agent: AgentManifest;
}

export function DeepDiagnosisLanding({ agent }: DeepDiagnosisLandingProps) {
  const router = useRouter();
  const credit = useCreditBalance();
  const composerRef = useRef<HTMLElement | null>(null);
  const [input, setInput] = useState("");
  const [conversations, setConversations] = useState<AgentConversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [reportConfirmOpen, setReportConfirmOpen] = useState(false);

  const refreshConversations = useCallback(async () => {
    setLoadingConversations(true);
    setConversations(await fetchAgentConversationSummaries(agent.id));
    setLoadingConversations(false);
  }, [agent.id]);

  useEffect(() => {
    queueMicrotask(() => {
      void refreshConversations();
    });
  }, [refreshConversations]);

  function startConversation(prompt?: string) {
    const conversationId = createId("deep-diagnosis");
    const content = prompt?.trim();

    if (content) {
      setPendingPrompt(conversationId, content);
    }

    router.push(`/deep-diagnosis/chat/${conversationId}`);
  }

  function startPortableReportFlow() {
    setReportConfirmOpen(false);
    startConversation(DEEP_DIAGNOSIS_PORTABLE_REPORT_REQUEST);
  }

  function openConversation(conversation: AgentConversation) {
    setMobileSidebarOpen(false);
    router.push(`/deep-diagnosis/chat/${conversation.id}`);
  }

  async function handleDeleteConversation(conversationId: string) {
    await deleteAgentConversation(agent.id, conversationId);
    await refreshConversations();
  }

  async function handleRenameConversation(conversationId: string, title: string) {
    const updated = await renameAgentConversation(agent.id, conversationId, title);
    if (!updated) return;
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, title: updated.title, updatedAt: updated.updatedAt }
          : conversation,
      ),
    );
  }

  return (
    <main className={deepDiagnosisChatShell}>
      <div className={deepDiagnosisChatWorkbench}>
        <ConversationSidebar
          conversations={conversations}
          collapsed={sidebarCollapsed}
          loading={loadingConversations}
          onToggleCollapsed={() => setSidebarCollapsed((collapsed) => !collapsed)}
          onCreate={() => startConversation()}
          onOpen={openConversation}
          onDelete={(conversationId) => void handleDeleteConversation(conversationId)}
          onRename={(conversationId, title) => void handleRenameConversation(conversationId, title)}
          credit={credit}
        />
        <MobileConversationHistoryButton
          className="lg:hidden"
          onOpen={() => setMobileSidebarOpen(true)}
        />
        <MobileConversationDrawer
          open={mobileSidebarOpen}
          conversations={conversations}
          loading={loadingConversations}
          onClose={() => setMobileSidebarOpen(false)}
          onOpen={openConversation}
          onDelete={(conversationId) => void handleDeleteConversation(conversationId)}
          onRename={(conversationId, title) => void handleRenameConversation(conversationId, title)}
          credit={credit}
        />
        <section className="min-w-0 flex-1 overflow-y-auto px-4 sm:px-5 lg:px-6">
          <EmptyConversation>
            <div className="mt-6">
              <Composer
                composerRef={composerRef}
                input={input}
                isBusy={false}
                lifted
                placement="inline"
                prompts={DEEP_DIAGNOSIS_EMPTY_CONVERSATION_PROMPTS}
                onInputChange={setInput}
                onPromptSelect={startConversation}
                onSend={() => startConversation(input)}
                onStop={() => undefined}
                reportAction={{
                  label: "生成方案链接",
                  onClick: () => setReportConfirmOpen(true),
                }}
              />
            </div>
          </EmptyConversation>
        </section>
      </div>
      <DeepDiagnosisReportConfirmDialog
        creditCost={DEEP_DIAGNOSIS_PORTABLE_REPORT_CREDIT_COST}
        open={reportConfirmOpen}
        stageLabel="准备开始"
        onClose={() => setReportConfirmOpen(false)}
        onConfirm={startPortableReportFlow}
      />
    </main>
  );
}
