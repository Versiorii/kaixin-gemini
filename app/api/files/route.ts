import { requireUser } from "@/lib/auth";
import { randomId } from "@/lib/crypto";
import { db } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { json, routeError } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const bucket = getEnv().CHAT_UPLOADS;
    if (!bucket) return json({ error: "R2 未配置，上传功能不可用" }, 501);
    const form = await request.formData();
    const file = form.get("file");
    const conversationId = form.get("conversationId");
    if (!(file instanceof File)) throw new Error("请选择文件");
    const id = randomId("file");
    const key = `${user.id}/${id}/${file.name}`;
    await bucket.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
    await db().prepare("INSERT INTO files (id, user_id, conversation_id, r2_key, filename, mime_type, size) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(id, user.id, typeof conversationId === "string" ? conversationId : null, key, file.name, file.type || "application/octet-stream", file.size).run();
    return json({ file: { id, filename: file.name, mimeType: file.type, size: file.size } });
  } catch (error) {
    return routeError(error);
  }
}
