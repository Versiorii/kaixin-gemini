import { currentUser } from "@/lib/auth";
import { proxyCompletion } from "@/lib/openai-compatible";
import { readJson, routeError } from "@/lib/validation";


export async function POST(request: Request) {
  try {
    const body = await readJson<import("@/lib/openai-compatible").CompletionRequest>(request);
    return proxyCompletion(body, await currentUser() || undefined);
  } catch (error) {
    return routeError(error);
  }
}
