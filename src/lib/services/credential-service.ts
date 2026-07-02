import { getDb } from "../db/connection";
import { generateId } from "../utils";
import type { Credential } from "@/types";

export class CredentialService {
  getByAgentId(agentId: string): Credential[] {
    const db = getDb();
    return db.prepare("SELECT * FROM credentials WHERE agent_id = ? ORDER BY issued_at DESC").all(agentId) as Credential[];
  }

  getAll(): Credential[] {
    const db = getDb();
    return db.prepare(
      "SELECT c.*, a.name as agent_name FROM credentials c JOIN agents a ON a.id = c.agent_id ORDER BY c.issued_at DESC"
    ).all() as Credential[];
  }

  create(data: { agent_id: string; type: string; issuer: string; expires_at?: string }): Credential {
    const db = getDb();
    const id = generateId();
    db.prepare(
      "INSERT INTO credentials (id, agent_id, type, issuer, status, expires_at) VALUES (?, ?, ?, ?, 'pending', ?)"
    ).run(id, data.agent_id, data.type, data.issuer, data.expires_at || null);
    return db.prepare("SELECT * FROM credentials WHERE id = ?").get(id) as Credential;
  }

  verify(id: string): Credential | undefined {
    const db = getDb();
    const cred = db.prepare("SELECT * FROM credentials WHERE id = ?").get(id) as Credential | undefined;
    if (!cred) return undefined;

    db.prepare(
      "UPDATE credentials SET status = 'verified', verified_at = datetime('now') WHERE id = ?"
    ).run(id);

    return db.prepare("SELECT * FROM credentials WHERE id = ?").get(id) as Credential;
  }

  revoke(id: string): Credential | undefined {
    const db = getDb();
    db.prepare("UPDATE credentials SET status = 'revoked' WHERE id = ?").run(id);
    return db.prepare("SELECT * FROM credentials WHERE id = ?").get(id) as Credential | undefined;
  }
}

export const credentialService = new CredentialService();
