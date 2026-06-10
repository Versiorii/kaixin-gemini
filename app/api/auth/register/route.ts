import { createUser, issueSession, setSessionCookie } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { json, readJson, requireString, routeError } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const settings = await getSettings();
    if (settings.allow_registration === "false") return json({ error: "注册已关闭" }, 403);
    const body = await readJson<{ username: string; email: string; password: string }>(request);
    const user = await createUser({
      username: requireString(body.username, "用户名", 2),
      email: requireString(body.email, "邮箱", 5),
      password: requireString(body.password, "密码", 8)
    });
    await setSessionCookie(await issueSession(user));
    return json({ user });
  } catch (error) {
    return routeError(error);
  }
}
