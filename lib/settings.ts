import { all, db, first } from "./db";
import { decryptText, encryptText } from "./crypto";
import { getEnv, requireSecret } from "./env";

export type ApiConfig = {
  apiBaseUrl: string;
  apiKey: string;
  defaultModel: string;
};

export async function getApiConfig(mask = false): Promise<ApiConfig> {
  const row = await first<{ api_base_url: string; api_key_encrypted: string; default_model: string }>(
    db().prepare("SELECT api_base_url, api_key_encrypted, default_model FROM api_config WHERE id = 1")
  );
  const secret = requireSecret(getEnv().CONFIG_ENCRYPTION_KEY, "CONFIG_ENCRYPTION_KEY");
  const apiKey = row?.api_key_encrypted ? await decryptText(row.api_key_encrypted, secret) : "";
  return {
    apiBaseUrl: row?.api_base_url || "",
    apiKey: mask && apiKey ? `${apiKey.slice(0, 4)}••••${apiKey.slice(-4)}` : apiKey,
    defaultModel: row?.default_model || "gemini-3.5-flash"
  };
}

export async function saveApiConfig(input: { apiBaseUrl?: string; apiKey?: string; defaultModel?: string }) {
  const current = await getApiConfig(false);
  const secret = requireSecret(getEnv().CONFIG_ENCRYPTION_KEY, "CONFIG_ENCRYPTION_KEY");
  const apiKey = input.apiKey && !input.apiKey.includes("••••") ? input.apiKey : current.apiKey;
  const encrypted = await encryptText(apiKey, secret);
  await db().prepare(
    "UPDATE api_config SET api_base_url = ?, api_key_encrypted = ?, default_model = ?, updated_at = datetime('now') WHERE id = 1"
  ).bind(input.apiBaseUrl ?? current.apiBaseUrl, encrypted, input.defaultModel ?? current.defaultModel).run();
}

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await all<{ key: string; value: string }>(db().prepare("SELECT key, value FROM system_settings"));
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

export async function saveSettings(settings: Record<string, string>) {
  const statements = Object.entries(settings).map(([key, value]) =>
    db().prepare("INSERT INTO system_settings (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')").bind(key, String(value))
  );
  if (statements.length) await db().batch(statements);
}
