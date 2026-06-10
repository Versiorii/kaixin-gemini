import { requireUser } from "@/lib/auth";
import { randomId } from "@/lib/crypto";
import { db, first } from "@/lib/db";
import { assertEnabledModel, getDefaultModel } from "@/lib/models";
import { proxyCompletion } from "@/lib/openai-compatible";
import { estimateTokens } from "@/lib/token";
import type { ChatMessage, Conversation } from "@/lib/types";
import { readJson, routeError } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await readJson<{ conversationId?: string; model?: string; messages: ChatMessage[]; stream?: boolean }>(request);
    if (!Array.isArray(body.messages) || body.messages.length === 0) throw new Error("消息不能为空");
    const model = await assertEnabledModel(body.model || await getDefaultModel());
    let conversationId = body.conversationId;
    const conversation = conversationId ? await first<Conversation>(db().prepare("SELECT * FROM conversations WHERE id = ? AND user_id = ? AND archived_at IS NULL").bind(conversationId, user.id)) : null;
    if (!conversation) {
      conversationId = randomId("con");
      const firstUserText = body.messages.find((m) => m.role === "user")?.content || "新对话";
      await db().prepare("INSERT INTO conversations (id, user_id, title, model) VALUES (?, ?, ?, ?)").bind(conversationId, user.id, firstUserText.slice(0, 32) || "新对话", model).run();
    }
    const last = body.messages[body.messages.length - 1];
    if (last.role === "user") {
      const tokens = estimateTokens(last.content);
      await db().prepare("INSERT INTO messages (id, conversation_id, role, content, model, prompt_tokens, total_tokens) VALUES (?, ?, 'user', ?, ?, ?, ?)")
        .bind(randomId("msg"), conversationId, last.content, model, tokens, tokens).run();
      await db().prepare("UPDATE conversations SET updated_at = datetime('now'), model = ? WHERE id = ?").bind(model, conversationId).run();
    }

    const response = await proxyCompletion({ ...body, model, conversationId }, user);
    const headers = new Headers(response.headers);
    headers.set("X-Conversation-Id", conversationId!);

    if (body.stream !== false && response.body) {
      const [clientStream, storageStream] = response.body.tee();
      collectAssistantMessage(storageStream, conversationId!, model).catch(() => {});
      return new Response(clientStream, { status: response.status, headers });
    }

    const data = await response.clone().json().catch(() => null) as { choices?: Array<{ message?: { content?: string } }>; content?: string; text?: string } | null;
    const assistantContent = data?.choices?.[0]?.message?.content || data?.content || data?.text || "";
    if (response.ok && assistantContent) await saveAssistantMessage(conversationId!, model, assistantContent);
    return new Response(response.body, { status: response.status, headers });
  } catch (error) {
    return routeError(error);
  }
}

async function collectAssistantMessage(body: ReadableStream<Uint8Array>, conversationId: string, model: string) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let content = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split("\n")) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const data = JSON.parse(payload) as { choices?: Array<{ delta?: { content?: string }; message?: { content?: string } }> };
        content += data.choices?.[0]?.delta?.content || data.choices?.[0]?.message?.content || "";
      } catch {}
    }
  }
  if (content) await saveAssistantMessage(conversationId, model, content);
}

async function saveAssistantMessage(conversationId: string, model: string, content: string) {
  const tokens = estimateTokens(content);
  await db().prepare("INSERT INTO messages (id, conversation_id, role, content, model, completion_tokens, total_tokens) VALUES (?, ?, 'assistant', ?, ?, ?, ?)")
    .bind(randomId("msg"), conversationId, content, model, tokens, tokens).run();
  await db().prepare("UPDATE conversations SET updated_at = datetime('now') WHERE id = ?").bind(conversationId).run();
}
