import { requireUser } from "@/lib/auth";
import { db, first } from "@/lib/db";
import { json, routeError, requireString } from "@/lib/validation";
import type { PromptTemplate } from "@/lib/api/endpoints/templates";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requireUser();

    const template = await first<PromptTemplate>(
      db()
        .prepare(
          `SELECT * FROM prompt_templates
        WHERE id = ? AND (user_id = 'system' OR user_id = (SELECT id FROM users WHERE email = (SELECT email FROM users LIMIT 1)))`
        )
        .bind(id)
    );

    if (!template) {
      return json({ error: "模板不存在" }, 404);
    }

    return json({ template });
  } catch (error) {
    return routeError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await request.json() as Partial<PromptTemplate>;

    const template = await first<PromptTemplate>(
      db().prepare("SELECT * FROM prompt_templates WHERE id = ? AND user_id = ?").bind(id, user.id)
    );

    if (!template) {
      return json({ error: "模板不存在或无权限修改" }, 404);
    }

    const updates: Record<string, unknown> = {};
    if (body.name) updates.name = requireString(body.name, "name");
    if (body.description !== undefined) updates.description = body.description;
    if (body.content) updates.content = requireString(body.content, "content");
    if (body.category) updates.category = requireString(body.category, "category");

    updates.updated_at = new Date().toISOString();

    const setClauses = Object.keys(updates)
      .map((k) => `${k} = ?`)
      .join(", ");
    const values = Object.values(updates);

    await db()
      .prepare(`UPDATE prompt_templates SET ${setClauses} WHERE id = ?`)
      .bind(...values, id)
      .run();

    const updated = await first<PromptTemplate>(
      db().prepare("SELECT * FROM prompt_templates WHERE id = ?").bind(id)
    );

    return json({ template: updated });
  } catch (error) {
    return routeError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const template = await first<PromptTemplate>(
      db().prepare("SELECT * FROM prompt_templates WHERE id = ? AND user_id = ?").bind(id, user.id)
    );

    if (!template) {
      return json({ error: "模板不存在或无权限删除" }, 404);
    }

    await db().prepare("DELETE FROM prompt_templates WHERE id = ?").bind(id).run();

    return json({ success: true });
  } catch (error) {
    return routeError(error);
  }
}
