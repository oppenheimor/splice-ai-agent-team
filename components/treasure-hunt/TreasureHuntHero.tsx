"use client";

import { Button as IslandButton, Card as IslandCard, Divider as IslandDivider, Icon as IslandIcon } from "animal-island-ui";
import { Send } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import type { AgentManifest } from "@/lib/agent-team/agents/types";
import { cn } from "@/lib/utils";
import {
  treasureComposer,
  treasureComposerInput,
  treasureHeroCard,
  treasureSendButton,
} from "./styles";

type TreasureHuntHeroProps = {
  agent: AgentManifest;
  onStart: (prompt: string) => void;
};

const starterIcons = ["icon-shopping", "icon-diy", "icon-camera", "icon-chat"] as const;

export function TreasureHuntHero({ agent, onStart }: TreasureHuntHeroProps) {
  const [customPrompt, setCustomPrompt] = useState("");

  function submitCustomPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const prompt = customPrompt.trim();
    if (!prompt) return;
    onStart(prompt);
  }

  return (
    <section className="grid gap-4 py-2 sm:gap-7 sm:py-8">
      <div className="w-fit rounded-full border-2 border-white/70 bg-[#fff8df] px-4 py-2 text-sm font-black text-[#725d42] shadow-[0_4px_0_#d8c8a2]">
        有喜 · 寻宝活动策划
      </div>
      <IslandCard color="default" className={cn(treasureHeroCard, "w-full max-w-4xl")}>
        <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center">
          <div className="flex w-fit flex-none items-center max-sm:-mb-1.5 max-sm:origin-left max-sm:scale-[0.78]">
            <span className="relative block origin-center">
              <span className="treasure-map-ping absolute right-0 top-1.5 h-3 w-3 rounded-full bg-[#ff5a5f]" />
              <IslandIcon name="icon-map" size={68} bounce />
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="text-balance font-['Zen_Maru_Gothic','Noto_Sans_SC',ui-sans-serif,system-ui,sans-serif] text-2xl font-black leading-tight tracking-normal sm:text-5xl max-sm:tracking-[-0.03em]">
              把惊喜，做成寻宝。
            </h2>
            <p className="mt-2 max-w-2xl font-['Noto_Sans_SC',ui-sans-serif,system-ui,sans-serif] text-sm font-bold leading-6 text-[rgba(107,85,61,0.88)] sm:mt-4 sm:text-lg">
              先告诉我你想给谁惊喜。我会帮你拆成路线、线索和最后的惊喜。
            </p>
          </div>
        </div>
      </IslandCard>
      <IslandDivider />
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        {agent.starterPrompts.map((prompt, index) => (
          <IslandButton
            key={prompt}
            type="default"
            size="large"
            block
            icon={<IslandIcon name={starterIcons[index] || "icon-map"} size={30} bounce />}
            className={cn(
              "!h-auto !min-h-[74px] !justify-start !py-3.5 max-sm:!min-h-[62px] max-sm:!py-2.5",
              index === agent.starterPrompts.length - 1 && "max-sm:!hidden",
            )}
            onClick={() => onStart(prompt)}
          >
            <span className="whitespace-normal text-left leading-6">{prompt}</span>
          </IslandButton>
        ))}
      </div>
      <form className={treasureComposer} onSubmit={submitCustomPrompt}>
        <input
          className={treasureComposerInput}
          value={customPrompt}
          onChange={(event) => setCustomPrompt(event.target.value)}
          placeholder={`和「${agent.name}」说说你的想法...`}
        />
        <button
          type="submit"
          className={treasureSendButton}
          aria-label="发送想法"
          disabled={!customPrompt.trim()}
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
      <style jsx>{`
        .treasure-map-ping {
          box-shadow: 0 0 0 0 rgba(255, 90, 95, 0.45);
          animation: treasure-map-ping 1.8s ease-out infinite;
        }

        @keyframes treasure-map-ping {
          0% {
            transform: scale(0.85);
            box-shadow: 0 0 0 0 rgba(255, 90, 95, 0.45);
            opacity: 0.9;
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 10px rgba(255, 90, 95, 0);
            opacity: 1;
          }
          100% {
            transform: scale(0.85);
            box-shadow: 0 0 0 0 rgba(255, 90, 95, 0);
            opacity: 0.9;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .treasure-map-ping {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
