import type { ChatMessage } from "./types";

export function estimateTokens(text: string): number {
  const latin = (text.match(/[A-Za-z0-9_]+/g) ?? []).length;
  const cjk = (text.match(/[㐀-鿿]/g) ?? []).length;
  const punctuation = Math.ceil(text.replace(/[A-Za-z0-9_㐀-鿿\s]/g, "").length / 2);
  return Math.max(1, latin + cjk + punctuation);
}

export function estimatePromptTokens(messages: ChatMessage[]): number {
  return messages.reduce((sum, message) => sum + estimateTokens(message.content) + 4, 0);
}
