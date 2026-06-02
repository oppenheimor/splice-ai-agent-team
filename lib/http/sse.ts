export function createSseStream(events: unknown[]): Response {
  return new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        for (const event of events) {
          enqueueSseEvent(controller, event);
        }
        controller.close();
      },
    }),
    {
      headers: buildSseHeaders(),
    },
  );
}

export function buildSseHeaders(): HeadersInit {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  };
}

export function enqueueSseEvent(
  controller: ReadableStreamDefaultController<Uint8Array>,
  event: unknown,
) {
  const encoder = new TextEncoder();
  // SSE 事件统一封装成 data 帧，避免各 route 重复手写编码格式。
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
}
