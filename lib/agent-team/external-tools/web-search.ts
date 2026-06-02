import { jsonSchema, tool } from "ai";

type TavilyResult = {
  title?: string;
  url?: string;
  content?: string;
  score?: number;
};

type TavilyResponse = {
  answer?: string;
  results?: TavilyResult[];
};

export const webSearchTool = tool({
  description: "搜索互联网获取行业动态、竞品信息、技术趋势、企业案例等。涉及实时信息、行业数据、最新动态时使用。",
  inputSchema: jsonSchema({
    type: "object",
    additionalProperties: false,
    properties: {
      query: { type: "string", description: "搜索关键词，使用短词组，不要使用长句。" },
      maxResults: { type: "number", description: "最大结果数，默认 5，最多 8。" },
    },
    required: ["query"],
  }),
  execute: async (input) => {
    const { query, maxResults = 5 } = input as { query: string; maxResults?: number };
    const apiKey = process.env.TAVILY_API_KEY;

    if (!apiKey) {
      return {
        answer: null,
        results: [],
        warning: "服务端缺少 TAVILY_API_KEY，无法联网验证。请按 C 级推断处理。",
      };
    }

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query,
        max_results: Math.max(1, Math.min(Number(maxResults) || 5, 8)),
        search_depth: "advanced",
        include_answer: true,
      }),
    });

    if (!response.ok) {
      return {
        answer: null,
        results: [],
        warning: `搜索失败：${response.status} ${response.statusText}`,
      };
    }

    const data = (await response.json()) as TavilyResponse;

    return {
      answer: data.answer || null,
      results: (data.results || []).map((result) => ({
        title: result.title || "未命名来源",
        url: result.url || "",
        content: result.content || "",
        score: result.score,
      })),
    };
  },
});
