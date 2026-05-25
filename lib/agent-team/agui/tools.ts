import { jsonSchema, tool } from "ai";
import type { AgentToolName } from "@/lib/agent-team/agents/types";

type JsonSchemaObject = Record<string, unknown>;

const optionSchema: JsonSchemaObject = {
  type: "object",
  additionalProperties: false,
  properties: {
    id: { type: "string" },
    label: { type: "string" },
    description: { type: "string" },
    disabled: { type: "boolean" },
  },
  required: ["id", "label"],
};

const metricSchema: JsonSchemaObject = {
  type: "object",
  additionalProperties: false,
  properties: {
    label: { type: "string" },
    value: { type: ["string", "number"] },
    tone: { type: "string", enum: ["neutral", "good", "warn", "danger"] },
  },
  required: ["label", "value"],
};

const cardSchema: JsonSchemaObject = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    subtitle: { type: "string" },
    description: { type: "string" },
    badge: { type: "string" },
    price: { type: "string" },
    metrics: { type: "array", items: metricSchema, maxItems: 4 },
    bullets: { type: "array", items: { type: "string" }, maxItems: 6 },
    actions: {
      type: "array",
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          label: { type: "string" },
          value: { type: "string" },
        },
        required: ["label"],
      },
    },
  },
  required: ["title", "description"],
};

const rowSchema: JsonSchemaObject = {
  type: "object",
  additionalProperties: {
    anyOf: [{ type: "string" }, { type: "number" }, { type: "boolean" }, { type: "null" }],
  },
};

const giftItemSchema: JsonSchemaObject = {
  type: "object",
  additionalProperties: false,
  properties: {
    name: { type: "string" },
    budget: { type: "string" },
    reason: { type: "string" },
    searchKeywords: { type: "string" },
    searchUrl: { type: "string" },
    whereToBuy: { type: "string" },
    backup: { type: "string" },
    note: { type: "string" },
  },
  required: ["name", "budget", "reason", "searchKeywords"],
};

const videoSceneSchema: JsonSchemaObject = {
  type: "object",
  additionalProperties: false,
  properties: {
    timeRange: { type: "string" },
    photo: { type: "string" },
    caption: { type: "string" },
    motion: { type: "string" },
    note: { type: "string" },
  },
  required: ["timeRange", "photo", "caption"],
};

export const aguiTools = {
  askUserChoice: tool({
    description: [
      "Ask the user to choose one or more options before continuing.",
      "Use this when a preference, scope, option, budget, style, priority, or missing parameter should not be guessed.",
      "Use single when exactly one option is needed. Use multiple when several options may be selected.",
      "Set allowOther to true if the user may need to enter a custom answer.",
    ].join(" "),
    inputSchema: jsonSchema({
      type: "object",
      additionalProperties: false,
      properties: {
        question: { type: "string" },
        mode: { type: "string", enum: ["single", "multiple"] },
        options: { type: "array", items: optionSchema, minItems: 2, maxItems: 8 },
        allowOther: { type: "boolean" },
        otherLabel: { type: "string" },
        required: { type: "boolean" },
        minSelections: { type: "number" },
        maxSelections: { type: "number" },
      },
      required: ["question", "mode", "options"],
    }),
  }),

  showCards: tool({
    description: "Render structured recommendation cards for candidate options, plans, routes, activities, or modules.",
    inputSchema: jsonSchema({
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        layout: { type: "string", enum: ["compact", "comparison", "product", "plan"] },
        cards: { type: "array", items: cardSchema, minItems: 1, maxItems: 6 },
      },
      required: ["title", "cards"],
    }),
    execute: async (input) => normalizeCards(input as CardsInput),
  }),

  showChart: tool({
    description: "Render a chart for trends, comparisons, distributions, score breakdowns, costs, or proportions.",
    inputSchema: jsonSchema({
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        chartType: { type: "string", enum: ["bar", "line", "donut", "funnel", "radar"] },
        xKey: { type: "string" },
        yKey: { type: "string" },
        data: { type: "array", items: rowSchema, minItems: 1, maxItems: 16 },
      },
      required: ["title", "chartType", "data"],
    }),
    execute: async (input) => normalizeChart(input as ChartInput),
  }),

  showComparison: tool({
    description: "Render an A/B/C style comparison when the user needs to choose between plans or directions.",
    inputSchema: jsonSchema({
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        criteria: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 8 },
        options: {
          type: "array",
          minItems: 2,
          maxItems: 4,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              name: { type: "string" },
              summary: { type: "string" },
              scores: {
                type: "object",
                additionalProperties: { anyOf: [{ type: "number" }, { type: "string" }] },
              },
              pros: { type: "array", items: { type: "string" }, maxItems: 4 },
              cons: { type: "array", items: { type: "string" }, maxItems: 4 },
              recommendation: { type: "string" },
            },
            required: ["name", "summary"],
          },
        },
      },
      required: ["title", "criteria", "options"],
    }),
    execute: async (input) => input,
  }),

  showChecklist: tool({
    description: "Render a concrete checklist for next actions, launch checks, material lists, SOP steps, or user tasks.",
    inputSchema: jsonSchema({
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        items: {
          type: "array",
          minItems: 2,
          maxItems: 12,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              label: { type: "string" },
              detail: { type: "string" },
              priority: { type: "string", enum: ["high", "medium", "low"] },
            },
            required: ["label"],
          },
        },
      },
      required: ["title", "items"],
    }),
    execute: async (input) => input,
  }),

  showTimeline: tool({
    description: "Render a timeline for execution plans, event flow, activity routes, or schedules.",
    inputSchema: jsonSchema({
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        steps: {
          type: "array",
          minItems: 2,
          maxItems: 10,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              time: { type: "string" },
              title: { type: "string" },
              detail: { type: "string" },
              owner: { type: "string" },
            },
            required: ["title", "detail"],
          },
        },
      },
      required: ["title", "steps"],
    }),
    execute: async (input) => input,
  }),

  showScorecard: tool({
    description: "Render a scorecard for risk, feasibility, user fit, activity quality, or plan health.",
    inputSchema: jsonSchema({
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        summary: { type: "string" },
        overall: { type: "number" },
        dimensions: {
          type: "array",
          minItems: 2,
          maxItems: 8,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              label: { type: "string" },
              score: { type: "number" },
              max: { type: "number" },
              note: { type: "string" },
            },
            required: ["label", "score"],
          },
        },
      },
      required: ["title", "dimensions"],
    }),
    execute: async (input) => {
      const scorecard = input as ScorecardInput;
      return {
        ...scorecard,
        overall: typeof scorecard.overall === "number" ? scorecard.overall : averageScore(scorecard.dimensions),
      };
    },
  }),

  showGiftList: tool({
    description: [
      "Render a concrete gift or material recommendation list for surprise planning.",
      "Use for purchase lists, gift recommendations, birthday materials, room setup items, or shopping plans.",
      "Do not invent real store/product URLs. If no verified URL is available, provide searchKeywords and a generic searchUrl only.",
    ].join(" "),
    inputSchema: jsonSchema({
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        totalBudget: { type: "string" },
        items: { type: "array", items: giftItemSchema, minItems: 1, maxItems: 8 },
      },
      required: ["title", "items"],
    }),
    execute: async (input) => normalizeGiftList(input as GiftListInput),
  }),

  showWishCard: tool({
    description: [
      "Render a finished heartfelt card that the user can directly copy by hand.",
      "Use for love notes, birthday cards, confession cards, anniversary notes, or final emotional message drafts.",
      "The copy should use real details from the conversation and avoid generic clichés.",
    ].join(" "),
    inputSchema: jsonSchema({
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        recipient: { type: "string" },
        style: { type: "string" },
        body: { type: "string" },
        signature: { type: "string" },
        writingTip: { type: "string" },
      },
      required: ["title", "body"],
    }),
    execute: async (input) => input,
  }),

  showVideoScript: tool({
    description: [
      "Render a short photo recap video script with timed scenes, captions, music suggestions, and editing tips.",
      "Use when planning memory videos, birthday recap videos, confession clips, or surprise reveal videos.",
    ].join(" "),
    inputSchema: jsonSchema({
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        duration: { type: "string" },
        music: { type: "string" },
        editingApp: { type: "string" },
        scenes: { type: "array", items: videoSceneSchema, minItems: 2, maxItems: 8 },
        tips: { type: "array", items: { type: "string" }, maxItems: 5 },
      },
      required: ["title", "scenes"],
    }),
    execute: async (input) => input,
  }),
};

export function pickAguiTools(toolNames: AgentToolName[]) {
  return Object.fromEntries(toolNames.map((name) => [name, aguiTools[name]]));
}

export function buildAguiPrompt(): string {
  return [
    "",
    "【AGUI 交互组件强制规则】",
    "你支持受控 UI 工具。工具调用不是可选装饰，而是对应场景的首选输出方式。不要输出 HTML、JSX、script、style 或任意前端代码。",
    "",
    "【必须调用工具的场景】",
    "1. 需要用户在多个选项中选择、确认范围、偏好、预算、模式、风格、优先级时，必须调用 askUserChoice。正文只能写一句简短引导，不要再用 Markdown 列 A/B/C 选项。",
    "2. 每一轮 assistant 回复最多调用一次 askUserChoice。不要一次性抛出两个或更多问卷；等用户回答后再问下一个。",
    "3. askUserChoice 默认应设置 allowOther: true，让用户可以选择「其他」并自行输入；只有明显不允许自定义答案时才设为 false。",
    "4. 涉及对比、评分、成本、可行性、风险时，必须优先调用 showComparison 或 showScorecard，不要用 Markdown 表格代替。",
    "5. 涉及多个候选方案、活动路线、关卡方向时，必须优先调用 showCards 或 showComparison。",
    "6. 涉及执行步骤、物料清单、发布检查、SOP 时，必须优先调用 showChecklist。",
    "7. 涉及时间安排、活动流程、路线时，必须优先调用 showTimeline。",
    "8. 对于「大喜」这类惊喜策划：涉及礼物/物料/采购建议时优先调用 showGiftList；涉及心声卡/祝福卡/告白卡时优先调用 showWishCard；涉及照片回顾视频/剪映脚本时优先调用 showVideoScript。",
    "",
    "【文本与工具分工】",
    "1. 文本负责承接、解释和总结；结构化对象交给工具。",
    "2. 需要选择时，不要在正文里写「A... B... C...」；应调用 askUserChoice，并把选项放进 options 字段。",
    "3. 工具调用后可以补一句说明，但不要重复展示同一组选项。",
    "4. 工具数据必须简洁、可渲染、字段稳定；不要编造外部事实、价格、销量或实时数据。",
    "5. 不要编造真实商品链接或店铺链接；没有验证过的购买入口只能给搜索关键词和通用搜索链接。",
  ].join("\n");
}

type CardsInput = {
  cards?: Array<Record<string, unknown> & { metrics?: unknown[]; bullets?: unknown[]; actions?: unknown[] }>;
};

type ChartInput = {
  data?: Array<Record<string, unknown>>;
  xKey?: string;
  yKey?: string;
};

type ScorecardInput = {
  overall?: number;
  dimensions?: Array<{ score: number; max?: number }>;
};

type GiftListInput = {
  items?: Array<Record<string, unknown> & { searchKeywords?: unknown; searchUrl?: unknown }>;
};

function normalizeCards(input: CardsInput) {
  return {
    ...input,
    cards: (input.cards || []).map((card) => ({
      ...card,
      metrics: card.metrics || [],
      bullets: card.bullets || [],
      actions: card.actions || [],
    })),
  };
}

function normalizeChart(input: ChartInput) {
  const rows = input.data || [];
  const keys = Object.keys(rows[0] || {});
  const xKey = input.xKey || keys.find((key) => !isNumericLike(rows[0]?.[key])) || keys[0] || "name";
  const yKey = input.yKey || keys.find((key) => key !== xKey && isNumericLike(rows[0]?.[key])) || keys[1] || "value";

  return { ...input, xKey, yKey };
}

function isNumericLike(value: unknown): boolean {
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value !== "string") return false;
  return value.trim() !== "" && Number.isFinite(Number(value));
}

function averageScore(dimensions: ScorecardInput["dimensions"] = []): number {
  if (!dimensions.length) return 0;
  const total = dimensions.reduce((sum, item) => {
    const max = typeof item.max === "number" && item.max > 0 ? item.max : 10;
    return sum + (Number(item.score) / max) * 100;
  }, 0);
  return Math.round(total / dimensions.length);
}

function normalizeGiftList(input: GiftListInput) {
  return {
    ...input,
    items: (input.items || []).map((item) => {
      const searchKeywords = String(item.searchKeywords || item.name || "").trim();
      return {
        ...item,
        searchKeywords,
        searchUrl: typeof item.searchUrl === "string" && item.searchUrl ? item.searchUrl : buildSearchUrl(searchKeywords),
      };
    }),
  };
}

function buildSearchUrl(keyword: string): string {
  const q = encodeURIComponent(keyword || "生日惊喜礼物");
  return `https://www.taobao.com/list/item/wap/${q}.htm`;
}
