import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { json, readJson, routeError } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await readJson<{ role?: "admin" | "user"; status?: "active" | "disabled" }>(request);
    if (body.role) await db().prepare("UPDATE users SET role = ?, updated_at = datetime('now') WHERE id = ?").bind(body.role, id).run();
    if (body.status) await db().prepare("UPDATE users SET status = ?, updated_at = datetime('now') WHERE id = ?").bind(body.status, id).run();
    return json({ ok: true });
  } catch (error) {
    return routeError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await db().prepare("DELETE FROM users WHERE id = ?").bind(id).run();
    return json({ ok: true });
  } catch (error) {
    return routeError(error);
  }
}
