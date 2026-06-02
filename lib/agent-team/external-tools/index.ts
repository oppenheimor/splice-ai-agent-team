import type { ToolSet } from "ai";
import type { ExternalToolName } from "@/lib/agent-team/agents/types";
import { webSearchTool } from "./web-search";

const externalTools = {
  webSearch: webSearchTool,
};

export function pickExternalTools(toolNames: ExternalToolName[] = []): ToolSet {
  return Object.fromEntries(toolNames.map((name) => [name, externalTools[name]])) as ToolSet;
}
