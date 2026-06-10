import { requireAdmin } from "@/lib/auth";
import { randomId } from "@/lib/crypto";
import { db } from "@/lib/db";
import { listModels } from "@/lib/models";
import { json, readJson, requireString, routeError } from "@/lib/validation";

export async function GET() {
  try {
    await requireAdmin();
    return json({ models: await listModels(true) });
  } catch (error) {
    return routeError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await readJson<{ id?: string; name: string; description?: string; enabled?: boolean; sort_order?: number; is_default?: boolean }>(request);
    const id = body.id?.trim() || randomId("mdl");
    if (body.is_default) await db().prepare("UPDATE models SET is_default = 0").run();
    await db().prepare("INSERT INTO models (id, name, description, enabled, sort_order, is_default) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(id, requireString(body.name, "模型名称"), body.description || "", body.enabled === false ? 0 : 1, body.sort_order || 100, body.is_default ? 1 : 0).run();
    return json({ ok: true, id });
  } catch (error) {
    return routeError(error);
  }
}
