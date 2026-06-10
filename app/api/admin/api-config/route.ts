import { requireAdmin } from "@/lib/auth";
import { getApiConfig, saveApiConfig } from "@/lib/settings";
import { json, readJson, routeError } from "@/lib/validation";

export async function GET() {
  try {
    await requireAdmin();
    return json({ config: await getApiConfig(true) });
  } catch (error) {
    return routeError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    await saveApiConfig(await readJson(request));
    return json({ ok: true });
  } catch (error) {
    return routeError(error);
  }
}
