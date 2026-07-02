import Database from "better-sqlite3";
import path from "path";

const IN_MEMORY = process.env.VERCEL === "1" || process.env.SQLITE_MEMORY === "1";
const DB_PATH = IN_MEMORY ? ":memory:" : path.join(process.cwd(), "data", "trustlayer.db");

let db: Database.Database | null = null;
let initialized = false;

export function getDb(): Database.Database {
  if (!db) {
    if (!IN_MEMORY) {
      const fs = require("fs");
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
  }
  return db;
}

export function isInitialized(): boolean {
  return initialized;
}

export function markInitialized(): void {
  initialized = true;
}

export function resetDb(): void {
  if (db) {
    db.close();
    db = null;
  }
  initialized = false;
}

export function closeDb(): void {
  resetDb();
}
