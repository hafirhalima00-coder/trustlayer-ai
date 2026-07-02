import { seedDatabase } from "@/lib/db/seed";

// Initialize DB on first import (for server-side)
let initialized = false;

export function ensureDbInitialized() {
  if (typeof window !== "undefined") return; // client-side
  if (!initialized) {
    try {
      seedDatabase();
      initialized = true;
    } catch (e) {
      console.error("DB initialization error:", e);
    }
  }
}
