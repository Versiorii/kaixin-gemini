import { requireUser } from "@/lib/auth";
import { randomId } from "@/lib/crypto";
import { db, first } from "@/lib/db";
import { json, routeError } from "@/lib/validation";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await request.json() as { input?: Record<string, unknown> };

    const workflow = await first<any>(
      db()
        .prepare("SELECT * FROM workflow_templates WHERE id = ? AND user_id = ?")
        .bind(id, user.id)
    );

    if (!workflow) {
      return json({ error: "工作流不存在" }, 404);
    }

    // 创建执行记录
    const executionId = randomId("exec");
    await db()
      .prepare(
        `INSERT INTO workflow_executions (id, workflow_id, user_id, status, started_at)
      VALUES (?, ?, ?, 'running', datetime('now'))`
      )
      .bind(executionId, id, user.id)
      .run();

    // 返回服务器发送事件流用于实时执行日志
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const steps = JSON.parse(workflow.steps || "[]");

          // 模拟工作流执行（实际应实现复杂执行逻辑）
          const results: Record<string, unknown> = { ...body.input };

          for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  stepIndex: i,
                  stepName: step.id,
                  status: "executing",
                })}\n\n`
              )
            );

            // 模拟步骤执行
            await new Promise((resolve) => setTimeout(resolve, 500));

            results[step.id] = `Result from ${step.id}`;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  stepIndex: i,
                  stepName: step.id,
                  status: "completed",
                  result: results[step.id],
                })}\n\n`
              )
            );
          }

          // 更新执行记录
          await db()
            .prepare(
              `UPDATE workflow_executions SET status = 'completed', results = ?, completed_at = datetime('now')
            WHERE id = ?`
            )
            .bind(JSON.stringify(results), executionId)
            .run();

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                status: "completed",
                executionId,
                results,
              })}\n\n`
            )
          );

          controller.close();
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          await db()
            .prepare(
              `UPDATE workflow_executions SET status = 'failed', error = ?, completed_at = datetime('now')
            WHERE id = ?`
            )
            .bind(message, executionId)
            .run();

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                status: "failed",
                executionId,
                error: message,
              })}\n\n`
            )
          );

          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return routeError(error);
  }
}
