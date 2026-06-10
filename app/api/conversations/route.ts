import { requireUser } from "@/lib/auth";
import { all, db } from "@/lib/db";
import { routeError, json } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const q = new URL(request.url).searchParams.get("q") || "";
    const rows = await all(db().prepare("SELECT * FROM conversations WHERE user_id = ? AND archived_at IS NULL AND title LIKE ? ORDER BY updated_at DESC LIMIT 100").bind(user.id, `%${q}%`));
    return json({ conversations: rows });
  } catch (error) {
    return routeError(error);
  }
}
