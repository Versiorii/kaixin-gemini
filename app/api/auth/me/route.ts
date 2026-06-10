import { currentUser } from "@/lib/auth";
import { json } from "@/lib/validation";

export async function GET() {
  return json({ user: await currentUser() });
}
