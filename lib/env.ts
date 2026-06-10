import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Env } from "./types";

export function getEnv(): Env {
  return getCloudflareContext().env as Env;
}

export function requireSecret(value: string | undefined, name: string): string {
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}
