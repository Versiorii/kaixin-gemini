export type UserRole = "admin" | "user";
export type UserStatus = "active" | "disabled";
export type MessageRole = "system" | "user" | "assistant";

export type Env = {
  DB: D1Database;
  CHAT_KV?: KVNamespace;
  CHAT_UPLOADS?: R2Bucket;
  APP_URL?: string;
  JWT_ISSUER?: string;
  JWT_SECRET?: string;
  CONFIG_ENCRYPTION_KEY?: string;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
};

export type User = {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
};

export type PublicUser = Pick<User, "id" | "username" | "email" | "role" | "status" | "created_at" | "last_login_at">;
export type ModelConfig = { id: string; name: string; description: string; enabled: number; sort_order: number; is_default: number };
export type ChatMessage = { role: MessageRole; content: string };
export type Conversation = { id: string; user_id: string; title: string; model: string; created_at: string; updated_at: string; archived_at: string | null };
export type StoredMessage = { id: string; conversation_id: string; role: MessageRole; content: string; model: string | null; prompt_tokens: number; completion_tokens: number; total_tokens: number; created_at: string };
export type Message = { role: MessageRole; content: string };
