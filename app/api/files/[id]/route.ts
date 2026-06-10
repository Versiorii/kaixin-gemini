import { requireUser } from "@/lib/auth";
import { db, first } from "@/lib/db";
import { json, routeError } from "@/lib/validation";
import type { FileInfo } from "@/lib/api/endpoints/files";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const file = await first<FileInfo>(
      db()
        .prepare("SELECT * FROM files WHERE id = ? AND user_id = ?")
        .bind(id, user.id)
    );

    if (!file) {
      return json({ error: "文件不存在" }, 404);
    }

    return json({ file });
  } catch (error) {
    return routeError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const file = await first<FileInfo>(
      db()
        .prepare("SELECT * FROM files WHERE id = ? AND user_id = ?")
        .bind(id, user.id)
    );

    if (!file) {
      return json({ error: "文件不存在" }, 404);
    }

    // 这里应该实现从 R2 删除文件的逻辑
    // await deleteFromR2(file.r2_key);

    await db().prepare("DELETE FROM files WHERE id = ?").bind(id).run();

    return json({ success: true });
  } catch (error) {
    return routeError(error);
  }
}
