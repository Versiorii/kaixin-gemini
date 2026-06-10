import { cookies } from "next/headers";
import { db, first } from "./db";
import { getEnv, requireSecret } from "./env";
import { hashPassword, randomId, signJwt, verifyJwt, verifyPassword } from "./crypto";
import type { PublicUser, User } from "./types";

const COOKIE_NAME = "kaixin_session";
const SESSION_SECONDS = 60 * 60 * 24 * 7;

type JwtPayload = {
  sub: string;
  role: "admin" | "user";
  iss: string;
  iat: number;
  exp: number;
};

export function publicUser(user: User): PublicUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    status: user.status,
    created_at: user.created_at,
    last_login_at: user.last_login_at
  };
}

export async function createUser(input: { username: string; email: string; password: string; role?: "admin" | "user" }): Promise<PublicUser> {
  const email = input.email.toLowerCase().trim();
  const existing = await first<User>(db().prepare("SELECT * FROM users WHERE email = ?").bind(email));
  if (existing) throw new Error("邮箱已注册");
  const id = randomId("usr");
  await db().prepare("INSERT INTO users (id, username, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?, 'active')")
    .bind(id, input.username.trim(), email, await hashPassword(input.password), input.role || "user").run();
  const created = await first<User>(db().prepare("SELECT * FROM users WHERE id = ?").bind(id));
  if (!created) throw new Error("用户创建失败");
  return publicUser(created);
}

export async function ensureInitialAdmin() {
  const env = getEnv();
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) return;
  const count = await first<{ count: number }>(db().prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'"));
  if ((count?.count ?? 0) > 0) return;
  await createUser({ username: "Administrator", email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD, role: "admin" });
}

export async function authenticate(email: string, password: string): Promise<PublicUser> {
  await ensureInitialAdmin();
  const user = await first<User>(db().prepare("SELECT * FROM users WHERE email = ?").bind(email.toLowerCase().trim()));
  if (!user || user.status !== "active") throw new Error("邮箱或密码错误");
  if (!await verifyPassword(password, user.password_hash)) throw new Error("邮箱或密码错误");
  await db().prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").bind(user.id).run();
  return publicUser(user);
}

export async function issueSession(user: PublicUser): Promise<string> {
  const env = getEnv();
  const now = Math.floor(Date.now() / 1000);
  return signJwt({ sub: user.id, role: user.role, iss: env.JWT_ISSUER || "kaixin-gemini", iat: now, exp: now + SESSION_SECONDS }, requireSecret(env.JWT_SECRET, "JWT_SECRET"));
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_SECONDS });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

async function currentToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value;
}

export async function currentUser(): Promise<PublicUser | null> {
  const token = await currentToken();
  if (!token) return null;
  const env = getEnv();
  const payload = await verifyJwt<JwtPayload>(token, requireSecret(env.JWT_SECRET, "JWT_SECRET"));
  if (!payload || payload.iss !== (env.JWT_ISSUER || "kaixin-gemini")) return null;
  const user = await first<User>(db().prepare("SELECT * FROM users WHERE id = ?").bind(payload.sub));
  if (!user || user.status !== "active") return null;
  return publicUser(user);
}

export async function requireUser(): Promise<PublicUser> {
  const user = await currentUser();
  if (!user) throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  return user;
}

export async function requireAdmin(): Promise<PublicUser> {
  const user = await requireUser();
  if (user.role !== "admin") throw new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { "Content-Type": "application/json" } });
  return user;
}
