import { getDb } from "../db/connection";
import { generateId } from "../utils";
import type { Agent } from "@/types";

export class AgentService {
  getAll(): Agent[] {
    const db = getDb();
    return db.prepare("SELECT * FROM agents ORDER BY created_at DESC").all() as Agent[];
  }

  getById(id: string): Agent | undefined {
    const db = getDb();
    return db.prepare("SELECT * FROM agents WHERE id = ?").get(id) as Agent | undefined;
  }

  create(data: { name: string; description?: string; owner?: string; version?: string; capabilities?: string[] }): Agent {
    const db = getDb();
    const id = generateId();
    const capabilities = JSON.stringify(data.capabilities || []);
    db.prepare(
      "INSERT INTO agents (id, name, description, owner, version, capabilities) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(id, data.name, data.description || "", data.owner || "", data.version || "1.0.0", capabilities);
    return this.getById(id)!;
  }

  update(id: string, data: Partial<Agent>): Agent | undefined {
    const db = getDb();
    const existing = this.getById(id);
    if (!existing) return undefined;

    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) { fields.push("name = ?"); values.push(data.name); }
    if (data.description !== undefined) { fields.push("description = ?"); values.push(data.description); }
    if (data.owner !== undefined) { fields.push("owner = ?"); values.push(data.owner); }
    if (data.version !== undefined) { fields.push("version = ?"); values.push(data.version); }
    if (data.status !== undefined) { fields.push("status = ?"); values.push(data.status); }
    if (data.capabilities !== undefined) { fields.push("capabilities = ?"); values.push(JSON.stringify(data.capabilities)); }

    if (fields.length > 0) {
      fields.push("updated_at = datetime('now')");
      values.push(id);
      db.prepare(`UPDATE agents SET ${fields.join(", ")} WHERE id = ?`).run(...values);
    }

    return this.getById(id);
  }

  updateTrustScore(id: string, score: number): void {
    const db = getDb();
    db.prepare("UPDATE agents SET trust_score = ?, updated_at = datetime('now') WHERE id = ?").run(score, id);
  }

  delete(id: string): boolean {
    const db = getDb();
    const result = db.prepare("DELETE FROM agents WHERE id = ?").run(id);
    return result.changes > 0;
  }

  search(query: string): Agent[] {
    const db = getDb();
    return db.prepare(
      "SELECT * FROM agents WHERE name LIKE ? OR description LIKE ? OR owner LIKE ? ORDER BY created_at DESC"
    ).all(`%${query}%`, `%${query}%`, `%${query}%`) as Agent[];
  }
}

export const agentService = new AgentService();
