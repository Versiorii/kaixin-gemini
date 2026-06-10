import { requireUser } from "@/lib/auth";
import { randomId } from "@/lib/crypto";
import { db, all, first } from "@/lib/db";
import { json, routeError, requireString } from "@/lib/validation";
import type { WorkflowTemplate, WorkflowStep } from "@/lib/api/endpoints/workflows";

export async function GET() {
  try {
    const user = await requireUser();

    const templates = await all<any>(
      db()
        .prepare(
          `SELECT * FROM workflow_templates
        WHERE user_id = ? OR user_id = 'system'
        ORDER BY created_at DESC`
        )
        .bind(user.id)
    );

    return json({
      workflows: templates.map((t) => ({
        ...t,
        steps: JSON.parse(t.steps || "[]"),
      })),
    });
  } catch (error) {
    return routeError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json() as any;

    const name = requireString(body.name, "name");
    const steps = body.steps || [];
    const description = body.description || "";

    const id = randomId("wf");

    await db()
      .prepare(
        `INSERT INTO workflow_templates (id, user_id, name, steps, description)
      VALUES (?, ?, ?, ?, ?)`
      )
      .bind(id, user.id, name, JSON.stringify(steps), description)
      .run();

    const template = await first<any>(
      db().prepare("SELECT * FROM workflow_templates WHERE id = ?").bind(id)
    );

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
