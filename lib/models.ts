import { all, db, first } from "./db";
import type { ModelConfig } from "./types";

export const DEFAULT_MODELS = [
  { id: "gemini-3.5-flash", name: "gemini-3.5-flash", description: "快速通用" },
  { id: "gemini-3.5-flash-thinking", name: "gemini-3.5-flash-thinking", description: "深度思考，输出最长（约2万字）" },
  { id: "gemini-3.5-flash-thinking-lite", name: "gemini-3.5-flash-thinking-lite", description: "自适应思考深度" },
  { id: "gemini-auto", name: "gemini-auto", description: "自动选模型" },
  { id: "gemini-flash-lite", name: "gemini-flash-lite", description: "轻量快速" }
];

export async function listModels(includeDisabled = false): Promise<ModelConfig[]> {
  const where = includeDisabled ? "" : "WHERE enabled = 1";
  return all<ModelConfig>(db().prepare(`SELECT * FROM models ${where} ORDER BY sort_order ASC, name ASC`));
}

export async function getDefaultModel(): Promise<string> {
  const model = await first<{ id: string }>(db().prepare("SELECT id FROM models WHERE is_default = 1 AND enabled = 1 LIMIT 1"));
  if (model) return model.id;
  const config = await first<{ default_model: string }>(db().prepare("SELECT default_model FROM api_config WHERE id = 1"));
  return config?.default_model || "gemini-3.5-flash";
}

export async function assertEnabledModel(modelId?: string): Promise<string> {
  const resolved = modelId || await getDefaultModel();
  const model = await first<ModelConfig>(db().prepare("SELECT * FROM models WHERE id = ? AND enabled = 1").bind(resolved));
  if (!model) throw new Error(`模型不可用：${resolved}`);
  return resolved;
}
