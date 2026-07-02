import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { reputationService } from "@/lib/services/reputation-service";
import { agentService } from "@/lib/services/agent-service";
import { initializeSchema } from "@/lib/db/schema";
import { closeDb } from "@/lib/db/connection";
import { randomUUID } from "crypto";

describe("ReputationService", () => {
  let agentId: string;

  beforeAll(() => {
    initializeSchema();
    const agent = agentService.create({
      name: `RepTest-${randomUUID().slice(0, 8)}`,
      description: "Reputation test agent",
      owner: "Test",
    });
    agentId = agent.id;
  });

  afterAll(() => {
    closeDb();
  });

  it("should add a reputation event", () => {
    const event = reputationService.addEvent({
      agent_id: agentId,
      event_type: "task_success",
      score_delta: 10,
      description: "Test task completed",
    });

    expect(event).toBeDefined();
    expect(event.event_type).toBe("task_success");
    expect(event.score_delta).toBe(10);
  });

  it("should get events by agent id", () => {
    const events = reputationService.getEventsByAgentId(agentId);
    expect(events.length).toBeGreaterThan(0);
  });

  it("should get trends", () => {
    const trends = reputationService.getTrends(agentId);
    expect(Array.isArray(trends)).toBe(true);
  });
});
