import { seedDatabase } from "./seed";
import { getDb, isInitialized, markInitialized } from "./connection";

export function ensureDbInitialized() {
  if (typeof window !== "undefined") return;
  if (isInitialized()) return;

  try {
    // Trigger DB creation
    getDb();
    // Run schema and seed
    seedDatabase();
    markInitialized();
  } catch (e) {
    console.error("DB initialization error:", e);
  }
}
