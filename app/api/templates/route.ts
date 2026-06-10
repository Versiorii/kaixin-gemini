import { requireUser } from "@/lib/auth";
import { randomId } from "@/lib/crypto";
import { db, all, first } from "@/lib/db";
import { json, routeError, requireString } from "@/lib/validation";
import type { PromptTemplate } from "@/lib/api/endpoints/templates";

export async function GET() {
  try {
    const user = await requireUser();

    const templates = await all<PromptTemplate>(
      db()
        .prepare(
          `SELECT * FROM prompt_templates
        WHERE user_id = ? OR user_id = 'system'
        ORDER BY category, name`
        )
        .bind(user.id)
    );

    return json({ templates });
  } catch (error) {
    return routeError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json() as Partial<PromptTemplate>;

    const name = requireString(body.name, "name");
    const content = requireString(body.content, "content");
    const category = requireString(body.category || "general", "category");
    const description = body.description || "";

    const id = randomId("tmpl");

    await db()
      .prepare(
        `INSERT INTO prompt_templates (id, user_id, name, description, content, category, usage_count)
      VALUES (?, ?, ?, ?, ?, ?, 0)`
      )
      .bind(id, user.id, name, description, content, category)
      .run();

    const template = await first<PromptTemplate>(
      db().prepare("SELECT * FROM prompt_templates WHERE id = ?").bind(id)
    );

    return json({ template });
  } catch (error) {
    return routeError(error);
  }
}
