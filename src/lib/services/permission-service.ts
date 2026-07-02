import { getDb } from "../db/connection";
import { generateId } from "../utils";
import type { Permission } from "@/types";

export class PermissionService {
  getByAgentId(agentId: string): Permission[] {
    const db = getDb();
    return db.prepare("SELECT * FROM permissions WHERE agent_id = ? ORDER BY created_at DESC").all(agentId) as Permission[];
  }

  getAll(): Permission[] {
    const db = getDb();
    return db.prepare("SELECT p.*, a.name as agent_name FROM permissions p JOIN agents a ON a.id = p.agent_id ORDER BY p.created_at DESC").all() as Permission[];
  }

  create(data: { agent_id: string; action: string; resource: string; effect: "ALLOW" | "DENY" | "REQUIRE_HUMAN_APPROVAL"; conditions?: string }): Permission {
    const db = getDb();
    const id = generateId();
    db.prepare(
      "INSERT INTO permissions (id, agent_id, action, resource, effect, conditions) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(id, data.agent_id, data.action, data.resource, data.effect, data.conditions || null);
    return db.prepare("SELECT * FROM permissions WHERE id = ?").get(id) as Permission;
  }

  update(id: string, effect: "ALLOW" | "DENY" | "REQUIRE_HUMAN_APPROVAL"): Permission | undefined {
    const db = getDb();
    db.prepare("UPDATE permissions SET effect = ? WHERE id = ?").run(effect, id);
    return db.prepare("SELECT * FROM permissions WHERE id = ?").get(id) as Permission | undefined;
  }

  delete(id: string): boolean {
    const db = getDb();
    return db.prepare("DELETE FROM permissions WHERE id = ?").run(id).changes > 0;
  }

  checkPermission(agentId: string, action: string, resource: string): Permission | undefined {
    const db = getDb();
    return db.prepare(
      "SELECT * FROM permissions WHERE agent_id = ? AND action = ? AND resource = ? LIMIT 1"
    ).get(agentId, action, resource) as Permission | undefined;
  }
}

export const permissionService = new PermissionService();
