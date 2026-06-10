import { requireUser } from "@/lib/auth";
import { json, routeError } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    await requireUser();
    const body = await request.json() as { conversationId: string; format: string; messageIndices?: number[] };

    // 根据格式调用不同的导出器
    const { conversationId, format } = body;

    // 这里应该实现实际的导出逻辑
    // 为简化演示，返回占位符
    const filename = `conversation_${conversationId}.${format === 'markdown' ? 'md' : format}`;

    return json({
      filename,
      downloadUrl: `/api/export/download/${conversationId}/${format}`,
    });
  } catch (error) {
    return routeError(error);
  }
}
