import { ensureDbInitialized } from "@/lib/db/init";

export function withDb() {
  ensureDbInitialized();
}
