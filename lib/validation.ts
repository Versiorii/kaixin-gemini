export async function readJson<T>(request: Request): Promise<T> {
  try {
    return await request.json() as T;
  } catch {
    throw new Error("请求体必须是 JSON");
  }
}

export function requireString(value: unknown, name: string, min = 1): string {
  if (typeof value !== "string" || value.trim().length < min) throw new Error(`${name} 不合法`);
  return value.trim();
}

export function json(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

export function routeError(error: unknown): Response {
  if (error instanceof Response) return error;
  const message = error instanceof Error ? error.message : "服务器错误";
  const status = message.includes("not configured") || message.includes("尚未配置") ? 503 : 400;
  return json({ error: message }, status);
}
