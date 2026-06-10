import { requireUser } from "@/lib/auth";
import { db, all } from "@/lib/db";
import { json, routeError } from "@/lib/validation";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const history = await all<{
      id: string;
      message_id: string;
      content_before: string;
      content_after: string;
      edited_at: string;
    }>(
      db()
        .prepare(
          `SELECT me.* FROM message_edits me
        JOIN messages m ON me.message_id = m.id
        JOIN conversations c ON m.conversation_id = c.id
        WHERE me.message_id = ? AND c.user_id = ?
        ORDER BY me.edited_at DESC`
        )
        .bind(id, user.id)
    );

    return json({ history });
  } catch (error) {
    return routeError(error);
  }
}
