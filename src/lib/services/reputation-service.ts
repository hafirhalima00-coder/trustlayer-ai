import { getDb } from "../db/connection";
import { generateId } from "../utils";
import type { ReputationEvent } from "@/types";
import { agentService } from "./agent-service";

export class ReputationService {
  getEventsByAgentId(agentId: string): ReputationEvent[] {
    const db = getDb();
    return db.prepare(
      "SELECT * FROM reputation_events WHERE agent_id = ? ORDER BY created_at DESC LIMIT 100"
    ).all(agentId) as ReputationEvent[];
  }

  getTrends(agentId: string): { date: string; score: number }[] {
    const agent = agentService.getById(agentId);
    if (!agent) return [];

    const events = this.getEventsByAgentId(agentId).reverse();
    let score = 50;
    const trends: { date: string; score: number }[] = [];

    for (const event of events) {
      score = Math.max(0, Math.min(100, score + event.score_delta));
      trends.push({ date: event.created_at, score });
    }

    return trends;
  }

  addEvent(data: { agent_id: string; event_type: string; score_delta: number; description: string }): ReputationEvent {
    const db = getDb();
    const id = generateId();
    db.prepare(
      "INSERT INTO reputation_events (id, agent_id, event_type, score_delta, description) VALUES (?, ?, ?, ?, ?)"
    ).run(id, data.agent_id, data.event_type, data.score_delta, data.description);

    const agent = agentService.getById(data.agent_id);
    if (agent) {
      const newScore = Math.max(0, Math.min(100, agent.trust_score + data.score_delta));
      agentService.updateTrustScore(data.agent_id, newScore);
    }

    return db.prepare("SELECT * FROM reputation_events WHERE id = ?").get(id) as ReputationEvent;
  }

  getAverageScore(): number {
    const db = getDb();
    const result = db.prepare("SELECT AVG(trust_score) as avg FROM agents").get() as { avg: number };
    return result.avg || 0;
  }

  getDistribution(): { range: string; count: number }[] {
    const db = getDb();
    const ranges = [
      { min: 0, max: 20, label: "0-20" },
      { min: 20, max: 40, label: "20-40" },
      { min: 40, max: 60, label: "40-60" },
      { min: 60, max: 80, label: "60-80" },
      { min: 80, max: 100, label: "80-100" },
    ];
    return ranges.map(r => {
      const result = db.prepare(
        "SELECT COUNT(*) as count FROM agents WHERE trust_score >= ? AND trust_score < ?"
      ).get(r.min, r.max) as { count: number };
      return { range: r.label, count: result.count };
    });
  }

  getOverallTrends(days: number = 14): { date: string; score: number }[] {
    const db = getDb();
    const trends: { date: string; score: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const result = db.prepare(`
        SELECT AVG(trust_score) as avg FROM agents
        WHERE updated_at >= ? AND updated_at < ?
      `).get(`${dateStr}T00:00:00`, `${dateStr}T23:59:59`) as { avg: number | null };
      trends.push({ date: dateStr, score: result.avg || 50 });
    }
    return trends;
  }
}

export const reputationService = new ReputationService();
