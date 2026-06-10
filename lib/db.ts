import { getEnv } from "./env";

export function db(): D1Database {
  return getEnv().DB;
}

export async function first<T>(statement: D1PreparedStatement): Promise<T | null> {
  return statement.first<T>();
}

export async function all<T>(statement: D1PreparedStatement): Promise<T[]> {
  const result = await statement.all<T>();
  return result.results ?? [];
}
