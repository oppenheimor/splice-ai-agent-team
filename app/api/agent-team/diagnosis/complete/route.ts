import { deepseek } from "@ai-sdk/deepseek";
import { streamText } from "ai";
import { getCurrentUser } from "@/lib/auth/session";
import { buildSseHeaders, createSseStream, enqueueSseEvent } from "@/lib/http/sse";
import {
  buildNarrativeSystemPrompt,
  applyNarrativePatch,
  createEmptyNarrative,
  createDiagnosis,
  isCompleteNarrative,
  parseNarrative,
  parseNarrativePatch,
  retryDiagnosisNarrative,
  saveEnhancedNarrative,
  toDiagnosisDto,
} from "@/lib/requirements-diagnosis/completion";
import type { QuizAnswers } from "@/lib/requirements-diagnosis/types";

export const runtime = "nodejs";
export const maxDuration = 60;

type CompleteRequest = {
  answers?: QuizAnswers;
  quizResultId?: string;
  retryNarrative?: boolean;
};

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "未登录。" }, { status: 401 });
  }

  let input: CompleteRequest;
  try {
    input = (await request.json()) as CompleteRequest;
  } catch {
    return Response.json({ error: "请求格式不正确。" }, { status: 400 });
  }

  try {
    const record = input.retryNarrative
      ? await retryDiagnosisNarrative(user.id, input.quizResultId)
      : await createDiagnosis(user.id, input.answers);

    const dto = toDiagnosisDto(record);
    if (!process.env.DEEPSEEK_API_KEY) {
      // 叙事由模型生成；缺少模型密钥时只返回结构化分数，并显式进入错误态。
      return createSseStream([
        { type: "saved", data: dto },
        { type: "error", message: "服务端缺少 DEEPSEEK_API_KEY，暂时无法生成叙事解读。" },
      ]);
    }

    const result = streamText({
      model: deepseek(process.env.DEEPSEEK_MODEL || "deepseek-chat"),
      system: buildNarrativeSystemPrompt(),
      prompt: JSON.stringify(dto.result),
      temperature: 0.68,
      abortSignal: request.signal,
    });

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        // 先把 DB 保存成功事件发给前端，确保用户能进入深度诊断，不被后续 LLM 叙事拖住。
        enqueueSseEvent(controller, { type: "saved", data: dto });
        let rawText = "";
        let lineBuffer = "";
        let narrative = createEmptyNarrative();

        try {
          for await (const delta of result.textStream) {
            rawText += delta;
            lineBuffer += delta;
            const lines = lineBuffer.split("\n");
            lineBuffer = lines.pop() || "";

            for (const line of lines) {
              const patch = parseNarrativePatch(line);
              if (!patch) continue;
              narrative = applyNarrativePatch(narrative, patch);
              enqueueSseEvent(controller, { type: "patch", patch });
            }
          }

          const trailingPatch = parseNarrativePatch(lineBuffer);
          if (trailingPatch) {
            narrative = applyNarrativePatch(narrative, trailingPatch);
            enqueueSseEvent(controller, { type: "patch", patch: trailingPatch });
          }

          const legacyJsonNarrative = parseNarrative(rawText);
          const completeNarrative = isCompleteNarrative(narrative) ? narrative : legacyJsonNarrative;
          if (completeNarrative) {
            await saveEnhancedNarrative({
              userId: user.id,
              recordId: record.id,
              narrative: completeNarrative,
            });
            enqueueSseEvent(controller, { type: "done", narrative: completeNarrative });
          } else {
            enqueueSseEvent(controller, { type: "error", message: "模型叙事格式不完整，请重试生成。" });
          }
        } catch (error) {
          enqueueSseEvent(controller, {
            type: "error",
            message: error instanceof Error ? error.message : "叙事生成失败，已保留结构化报告。",
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: buildSseHeaders(),
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "评测保存失败。" }, { status: 400 });
  }
}
