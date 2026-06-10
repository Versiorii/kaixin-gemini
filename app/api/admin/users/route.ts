import { requireAdmin } from "@/lib/auth";
import { all, db } from "@/lib/db";
import { json, routeError } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const q = new URL(request.url).searchParams.get("q") || "";
    const users = await all(db().prepare("SELECT id, username, email, role, status, created_at, last_login_at FROM users WHERE username LIKE ? OR email LIKE ? ORDER BY created_at DESC LIMIT 100").bind(`%${q}%`, `%${q}%`));
    return json({ users });
  } catch (error) {
    return routeError(error);
  }
}
