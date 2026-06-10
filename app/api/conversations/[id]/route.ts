import { requireUser } from "@/lib/auth";
import { all, db, first } from "@/lib/db";
import { json, readJson, routeError } from "@/lib/validation";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const conversation = await first(db().prepare("SELECT * FROM conversations WHERE id = ? AND user_id = ?").bind(id, user.id));
    if (!conversation) return json({ error: "Not found" }, 404);
    const messages = await all(db().prepare("SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC").bind(id));
    return json({ conversation, messages });
  } catch (error) {
    return routeError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await readJson<{ title?: string }>(request);
    if (body.title) await db().prepare("UPDATE conversations SET title = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?").bind(body.title, id, user.id).run();
    return json({ ok: true });
  } catch (error) {
    return routeError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await db().prepare("UPDATE conversations SET archived_at = datetime('now') WHERE id = ? AND user_id = ?").bind(id, user.id).run();
    return json({ ok: true });
  } catch (error) {
    return routeError(error);
  }
}
