import { db } from "./db";
import { getApiConfig } from "./settings";
import { estimatePromptTokens, estimateTokens } from "./token";
import type { ChatMessage, PublicUser } from "./types";
import { assertEnabledModel } from "./models";
import { randomId } from "./crypto";

export type CompletionRequest = {
  model?: string;
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  conversationId?: string;
};

export async function proxyCompletion(input: CompletionRequest, user?: PublicUser): Promise<Response> {
  if (!Array.isArray(input.messages) || input.messages.length === 0) throw new Error("messages 不能为空");
  const model = await assertEnabledModel(input.model);
  const api = await getApiConfig(false);
  if (!api.apiBaseUrl || !api.apiKey) throw new Error("后台尚未配置 API 地址和 API Key");

  const stream = input.stream !== false;
  const body = {
    model,
    messages: input.messages,
    stream,
    temperature: input.temperature ?? 0.7,
    max_tokens: input.max_tokens
  };

  const upstream = await fetch(`${api.apiBaseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${api.apiKey}` },
    body: JSON.stringify(body)
  });

  if (stream) {
    if (!upstream.body) throw new Error("上游没有返回流");
    const [clientBody, statsBody] = upstream.body.tee();
    collectStreamUsage(statsBody, input, model, user).catch(() => {});
    return new Response(clientBody, {
      status: upstream.status,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive"
      }
    });
  }

  const data = await upstream.json() as { choices?: Array<{ message?: { content?: string } }>; content?: string; text?: string; usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }; error?: unknown };
  if (!upstream.ok) return Response.json(data, { status: upstream.status });
  const content = data.choices?.[0]?.message?.content || data.content || data.text || "";
  const usage = data.usage || {
    prompt_tokens: estimatePromptTokens(input.messages),
    completion_tokens: estimateTokens(content),
    total_tokens: estimatePromptTokens(input.messages) + estimateTokens(content)
  };
  await recordUsage({ user, conversationId: input.conversationId, model, stream: false, usage });
  return Response.json({ ...data, usage });
}

async function collectStreamUsage(body: ReadableStream<Uint8Array>, input: CompletionRequest, model: string, user?: PublicUser) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const data = JSON.parse(payload) as { choices?: Array<{ delta?: { content?: string }; message?: { content?: string } }> };
        full += data.choices?.[0]?.delta?.content || data.choices?.[0]?.message?.content || "";
      } catch {}
    }
  }
  const prompt = estimatePromptTokens(input.messages);
  const completion = estimateTokens(full);
  await recordUsage({ user, conversationId: input.conversationId, model, stream: true, usage: { prompt_tokens: prompt, completion_tokens: completion, total_tokens: prompt + completion } });
}

async function recordUsage(input: { user?: PublicUser; conversationId?: string; model: string; stream: boolean; usage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } }) {
  await db().prepare(
    "INSERT INTO usage_events (id, user_id, conversation_id, model, prompt_tokens, completion_tokens, total_tokens, stream) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(
    randomId("use"), input.user?.id || null, input.conversationId || null, input.model,
    input.usage.prompt_tokens || 0, input.usage.completion_tokens || 0,
    input.usage.total_tokens || ((input.usage.prompt_tokens || 0) + (input.usage.completion_tokens || 0)),
    input.stream ? 1 : 0
  ).run();
}
