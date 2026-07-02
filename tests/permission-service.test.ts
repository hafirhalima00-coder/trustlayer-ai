import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { permissionService } from "@/lib/services/permission-service";
import { agentService } from "@/lib/services/agent-service";
import { initializeSchema } from "@/lib/db/schema";
import { closeDb } from "@/lib/db/connection";
import { randomUUID } from "crypto";

describe("PermissionService", () => {
  let agentId: string;

  beforeAll(() => {
    initializeSchema();
    const agent = agentService.create({
      name: `PermTest-${randomUUID().slice(0, 8)}`,
      description: "Permission test agent",
      owner: "Test",
    });
    agentId = agent.id;
  });

  afterAll(() => {
    closeDb();
  });

  it("should create a permission", () => {
    const perm = permissionService.create({
      agent_id: agentId,
      action: "read",
      resource: "test_resource",
      effect: "ALLOW",
    });

    expect(perm).toBeDefined();
    expect(perm.action).toBe("read");
    expect(perm.resource).toBe("test_resource");
    expect(perm.effect).toBe("ALLOW");
  });

  it("should get permissions by agent id", () => {
    const perms = permissionService.getByAgentId(agentId);
    expect(perms.length).toBeGreaterThan(0);
    expect(perms[0].agent_id).toBe(agentId);
  });

  it("should check permission", () => {
    const perm = permissionService.checkPermission(agentId, "read", "test_resource");
    expect(perm).toBeDefined();
    expect(perm!.effect).toBe("ALLOW");
  });

  it("should return undefined for non-existent permission check", () => {
    const perm = permissionService.checkPermission(agentId, "nonexistent", "nope");
    expect(perm).toBeUndefined();
  });
});
