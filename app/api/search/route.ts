import { requireUser } from "@/lib/auth";
import { all, db } from "@/lib/db";
import { json, routeError } from "@/lib/validation";
import type { StoredMessage } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const url = new URL(request.url);

    const query = url.searchParams.get("query") || "";
    const model = url.searchParams.get("model");
    const dateFrom = url.searchParams.get("dateFrom");
    const dateTo = url.searchParams.get("dateTo");
    const tag = url.searchParams.get("tag");
    const isUserMessage = url.searchParams.get("isUserMessage");

    let sql = `
      SELECT m.* FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE c.user_id = ?
    `;

    const params: unknown[] = [user.id];

    // 全文搜索
    if (query) {
      sql += ` AND m.content LIKE ?`;
      params.push(`%${query}%`);
    }

    if (model) {
      sql += ` AND m.model = ?`;
      params.push(model);
    }

    if (isUserMessage) {
      const role = isUserMessage === "true" ? "user" : "assistant";
      sql += ` AND m.role = ?`;
      params.push(role);
    }

    if (dateFrom) {
      sql += ` AND m.created_at >= ?`;
      params.push(dateFrom);
    }

    if (dateTo) {
      sql += ` AND m.created_at <= ?`;
      params.push(dateTo);
    }

    sql += ` ORDER BY m.created_at DESC LIMIT 100`;

    const results = await all<StoredMessage>(db().prepare(sql).bind(...params));

    // 处理标签过滤（如果提供）
    if (tag) {
      const tagged = new Set<string>();
      const tagResults = await all<{ conversation_id: string }>(
        db()
          .prepare(
            "SELECT DISTINCT conversation_id FROM conversation_tags WHERE tag = ? AND conversation_id IN (SELECT conversation_id FROM conversations WHERE user_id = ?)"
          )
          .bind(tag, user.id)
      );

      tagResults.forEach((r) => tagged.add(r.conversation_id));
      const filtered = results.filter((m) => tagged.has(m.conversation_id));

      return json({ results: filtered });
    }

    return json({ results });
  } catch (error) {
    return routeError(error);
  }
}
