import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { json, readJson, routeError } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await readJson<{ name?: string; description?: string; enabled?: boolean; sort_order?: number; is_default?: boolean }>(request);
    if (body.is_default) await db().prepare("UPDATE models SET is_default = 0").run();
    await db().prepare("UPDATE models SET name = COALESCE(?, name), description = COALESCE(?, description), enabled = COALESCE(?, enabled), sort_order = COALESCE(?, sort_order), is_default = COALESCE(?, is_default), updated_at = datetime('now') WHERE id = ?")
      .bind(body.name ?? null, body.description ?? null, body.enabled === undefined ? null : body.enabled ? 1 : 0, body.sort_order ?? null, body.is_default === undefined ? null : body.is_default ? 1 : 0, id).run();
    return json({ ok: true });
  } catch (error) {
    return routeError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await db().prepare("DELETE FROM models WHERE id = ?").bind(id).run();
    return json({ ok: true });
  } catch (error) {
    return routeError(error);
  }
}
