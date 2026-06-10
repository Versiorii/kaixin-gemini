import { authenticate, issueSession, setSessionCookie } from "@/lib/auth";
import { json, readJson, requireString, routeError } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await readJson<{ email: string; password: string }>(request);
    const user = await authenticate(requireString(body.email, "邮箱"), requireString(body.password, "密码"));
    await setSessionCookie(await issueSession(user));
    return json({ user });
  } catch (error) {
    return routeError(error);
  }
}
