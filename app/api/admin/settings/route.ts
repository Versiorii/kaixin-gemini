import { requireAdmin } from "@/lib/auth";
import { getSettings, saveSettings } from "@/lib/settings";
import { json, readJson, routeError } from "@/lib/validation";

export async function GET() {
  try {
    await requireAdmin();
    return json({ settings: await getSettings() });
  } catch (error) {
    return routeError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    await saveSettings(await readJson<Record<string, string>>(request));
    return json({ ok: true });
  } catch (error) {
    return routeError(error);
  }
}
