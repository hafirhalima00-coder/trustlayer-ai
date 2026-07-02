import { getDb } from "./connection";

export function initializeSchema(): void {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT DEFAULT '',
      owner TEXT DEFAULT '',
      version TEXT DEFAULT '1.0.0',
      status TEXT DEFAULT 'active' CHECK(status IN ('active','inactive','suspended','pending')),
      capabilities TEXT DEFAULT '[]',
      trust_score REAL DEFAULT 50.0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS permissions (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      action TEXT NOT NULL,
      resource TEXT NOT NULL,
      effect TEXT NOT NULL CHECK(effect IN ('ALLOW','DENY','REQUIRE_HUMAN_APPROVAL')),
      conditions TEXT DEFAULT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reputation_events (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      score_delta REAL NOT NULL,
      description TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS credentials (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      type TEXT NOT NULL,
      issuer TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('verified','pending','expired','revoked')),
      issued_at TEXT DEFAULT (datetime('now')),
      expires_at TEXT DEFAULT NULL,
      verified_at TEXT DEFAULT NULL,
      metadata TEXT DEFAULT NULL,
      FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS trust_decisions (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      action TEXT NOT NULL,
      resource TEXT NOT NULL,
      result TEXT NOT NULL CHECK(result IN ('ALLOW','DENY','REQUIRE_HUMAN_APPROVAL')),
      confidence REAL NOT NULL DEFAULT 0.0,
      explanation TEXT DEFAULT '',
      risk_level TEXT DEFAULT 'medium' CHECK(risk_level IN ('low','medium','high','critical')),
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      action TEXT NOT NULL,
      resource TEXT NOT NULL,
      outcome TEXT NOT NULL,
      confidence REAL NOT NULL DEFAULT 0.0,
      reason TEXT DEFAULT '',
      details TEXT DEFAULT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_permissions_agent ON permissions(agent_id);
    CREATE INDEX IF NOT EXISTS idx_reputation_agent ON reputation_events(agent_id);
    CREATE INDEX IF NOT EXISTS idx_credentials_agent ON credentials(agent_id);
    CREATE INDEX IF NOT EXISTS idx_decisions_agent ON trust_decisions(agent_id);
    CREATE INDEX IF NOT EXISTS idx_audit_agent ON audit_logs(agent_id);
    CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_decisions_created ON trust_decisions(created_at);
  `);
}
