import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { AgentService, agentService } from "@/lib/services/agent-service";
import { getDb, closeDb } from "@/lib/db/connection";
import { initializeSchema } from "@/lib/db/schema";
import { randomUUID } from "crypto";

describe("AgentService", () => {
  beforeAll(() => {
    initializeSchema();
  });

  afterAll(() => {
    closeDb();
  });

  it("should create an agent", () => {
    const agent = agentService.create({
      name: `TestAgent-${randomUUID().slice(0, 8)}`,
      description: "Test agent",
      owner: "Test",
      version: "1.0.0",
      capabilities: ["test"],
    });

    expect(agent).toBeDefined();
    expect(agent.id).toBeTruthy();
    expect(agent.name).toContain("TestAgent");
    expect(agent.status).toBe("active");
    expect(agent.trust_score).toBe(50);
  });

  it("should get all agents", () => {
    const agents = agentService.getAll();
    expect(Array.isArray(agents)).toBe(true);
    expect(agents.length).toBeGreaterThan(0);
  });

  it("should get agent by id", () => {
    const agents = agentService.getAll();
    if (agents.length > 0) {
      const agent = agentService.getById(agents[0].id);
      expect(agent).toBeDefined();
      expect(agent!.id).toBe(agents[0].id);
    }
  });

  it("should return undefined for non-existent agent", () => {
    const agent = agentService.getById("non-existent");
    expect(agent).toBeUndefined();
  });

  it("should update agent", () => {
    const agents = agentService.getAll();
    if (agents.length > 0) {
      const updated = agentService.update(agents[0].id, { description: "Updated description" });
      expect(updated).toBeDefined();
      expect(updated!.description).toBe("Updated description");
    }
  });

  it("should search agents", () => {
    const results = agentService.search("Test");
    expect(Array.isArray(results)).toBe(true);
  });
});
