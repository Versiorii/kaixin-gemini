import { requireUser } from "@/lib/auth";
import { randomId } from "@/lib/crypto";
import { db, first } from "@/lib/db";
import { json, requireString, routeError } from "@/lib/validation";
import type { StoredMessage } from "@/lib/types";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const message = await first<StoredMessage>(
      db()
        .prepare(
          `SELECT m.* FROM messages m
        JOIN conversations c ON m.conversation_id = c.id
        WHERE m.id = ? AND c.user_id = ?`
        )
        .bind(id, user.id)
    );

    if (!message) {
      return json({ error: "消息不存在" }, 404);
    }

    return json({ message });
  } catch (error) {
    return routeError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await request.json() as { content?: string };

    const content = requireString(body.content, "content");

    const message = await first<StoredMessage>(
      db()
        .prepare(
          `SELECT m.* FROM messages m
        JOIN conversations c ON m.conversation_id = c.id
        WHERE m.id = ? AND c.user_id = ?`
        )
        .bind(id, user.id)
    );

    if (!message) {
      return json({ error: "消息不存在" }, 404);
    }

    // 保存编辑历史
    await db()
      .prepare(
        `INSERT INTO message_edits (id, message_id, user_id, content_before, content_after)
      VALUES (?, ?, ?, ?, ?)`
      )
      .bind(randomId("edit"), id, user.id, message.content, content)
      .run();

    // 更新消息
    await db()
      .prepare(`UPDATE messages SET content = ? WHERE id = ?`)
      .bind(content, id)
      .run();

    const updated = await first<StoredMessage>(db().prepare("SELECT * FROM messages WHERE id = ?").bind(id));

    return json({ message: updated });
  } catch (error) {
    return routeError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const message = await first<StoredMessage>(
      db()
        .prepare(
          `SELECT m.* FROM messages m
        JOIN conversations c ON m.conversation_id = c.id
        WHERE m.id = ? AND c.user_id = ?`
        )
        .bind(id, user.id)
    );

    if (!message) {
      return json({ error: "消息不存在" }, 404);
    }

    await db().prepare("DELETE FROM messages WHERE id = ?").bind(id).run();

    return json({ success: true });
  } catch (error) {
    return routeError(error);
  }
}
