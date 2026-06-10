import { requireAdmin } from "@/lib/auth";
import { db, first } from "@/lib/db";
import { json, routeError } from "@/lib/validation";

export async function GET() {
  try {
    await requireAdmin();
    const users = await first<{ count: number }>(db().prepare("SELECT COUNT(*) count FROM users"));
    const conversations = await first<{ count: number }>(db().prepare("SELECT COUNT(*) count FROM conversations WHERE archived_at IS NULL"));
    const usage = await first<{ total: number; requests: number }>(db().prepare("SELECT COALESCE(SUM(total_tokens),0) total, COUNT(*) requests FROM usage_events"));
    return json({ users: users?.count || 0, conversations: conversations?.count || 0, tokens: usage?.total || 0, requests: usage?.requests || 0 });
  } catch (error) {
    return routeError(error);
  }
}
