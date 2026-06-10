import { requireUser } from "@/lib/auth";
import { db, first } from "@/lib/db";
import { json, routeError } from "@/lib/validation";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const template = await first<any>(
      db()
        .prepare(
          `SELECT * FROM workflow_templates
        WHERE id = ? AND user_id = ?`
        )
        .bind(id, user.id)
    );

    if (!template) {
      return json({ error: "工作流不存在" }, 404);
    }

    return json({
      workflow: {
        ...template,
        steps: JSON.parse(template.steps || "[]"),
      },
    });
  } catch (error) {
    return routeError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await request.json() as any;

    const template = await first<any>(
      db()
        .prepare("SELECT * FROM workflow_templates WHERE id = ? AND user_id = ?")
        .bind(id, user.id)
    );

    if (!template) {
      return json({ error: "工作流不存在或无权限修改" }, 404);
    }

    const updates: Record<string, unknown> = {};
    if (body.name) updates.name = body.name;
    if (body.steps) updates.steps = JSON.stringify(body.steps);
    if (body.description !== undefined) updates.description = body.description;

    updates.updated_at = new Date().toISOString();

    const setClauses = Object.keys(updates)
      .map((k) => `${k} = ?`)
      .join(", ");
    const values = Object.values(updates);

    await db()
      .prepare(`UPDATE workflow_templates SET ${setClauses} WHERE id = ?`)
      .bind(...values, id)
      .run();

    const updated = await first<any>(
      db().prepare("SELECT * FROM workflow_templates WHERE id = ?").bind(id)
    );

    return json({
      workflow: {
        ...updated,
        steps: JSON.parse(updated.steps || "[]"),
      },
    });
  } catch (error) {
    return routeError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const template = await first<any>(
      db()
        .prepare("SELECT * FROM workflow_templates WHERE id = ? AND user_id = ?")
        .bind(id, user.id)
    );

    if (!template) {
      return json({ error: "工作流不存在或无权限删除" }, 404);
    }

    await db().prepare("DELETE FROM workflow_templates WHERE id = ?").bind(id).run();

    return json({ success: true });
  } catch (error) {
    return routeError(error);
  }
}
