import { getDb } from "../db/connection";
import { generateId } from "../utils";
import type { AuditLog, AnalyticsSummary } from "@/types";

export class AuditService {
  getAll(limit: number = 100, offset: number = 0): AuditLog[] {
    const db = getDb();
    return db.prepare(`
      SELECT al.*, a.name as agent_name FROM audit_logs al 
      JOIN agents a ON a.id = al.agent_id 
      ORDER BY al.created_at DESC 
      LIMIT ? OFFSET ?
    `).all(limit, offset) as AuditLog[];
  }

  getById(id: string): AuditLog | undefined {
    const db = getDb();
    return db.prepare(`
      SELECT al.*, a.name as agent_name FROM audit_logs al 
      JOIN agents a ON a.id = al.agent_id 
      WHERE al.id = ?
    `).get(id) as AuditLog | undefined;
  }

  getByAgentId(agentId: string, limit: number = 50): AuditLog[] {
    const db = getDb();
    return db.prepare(`
      SELECT al.*, a.name as agent_name FROM audit_logs al 
      JOIN agents a ON a.id = al.agent_id 
      WHERE al.agent_id = ? 
      ORDER BY al.created_at DESC 
      LIMIT ?
    `).all(agentId, limit) as AuditLog[];
  }

  record(data: { agent_id: string; action: string; resource: string; outcome: string; confidence: number; reason: string; details?: string }): AuditLog {
    const db = getDb();
    const id = generateId();
    db.prepare(
      "INSERT INTO audit_logs (id, agent_id, action, resource, outcome, confidence, reason, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(id, data.agent_id, data.action, data.resource, data.outcome, data.confidence, data.reason, data.details || null);
    return this.getById(id)!;
  }

  getAnalytics(): AnalyticsSummary {
    const db = getDb();
    const totalAgents = (db.prepare("SELECT COUNT(*) as count FROM agents").get() as { count: number }).count;
    const activeAgents = (db.prepare("SELECT COUNT(*) as count FROM agents WHERE status = 'active'").get() as { count: number }).count;
    const avgTrust = (db.prepare("SELECT AVG(trust_score) as avg FROM agents").get() as { avg: number }).avg || 0;

    const decisions = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN result = 'ALLOW' THEN 1 ELSE 0 END) as allow,
        SUM(CASE WHEN result = 'DENY' THEN 1 ELSE 0 END) as deny,
        SUM(CASE WHEN result = 'REQUIRE_HUMAN_APPROVAL' THEN 1 ELSE 0 END) as human
      FROM trust_decisions
    `).get() as { total: number; allow: number; deny: number; human: number };

    const violations = (db.prepare(
      "SELECT COUNT(*) as count FROM reputation_events WHERE event_type = 'policy_violation'"
    ).get() as { count: number }).count;

    const riskDist = db.prepare(`
      SELECT risk_level as level, COUNT(*) as count 
      FROM trust_decisions 
      GROUP BY risk_level
    `).all() as { level: string; count: number }[];

    const trustDist = db.prepare(`
      SELECT 
        CASE 
          WHEN trust_score >= 80 THEN '80-100'
          WHEN trust_score >= 60 THEN '60-80'
          WHEN trust_score >= 40 THEN '40-60'
          WHEN trust_score >= 20 THEN '20-40'
          ELSE '0-20'
        END as range,
        COUNT(*) as count
      FROM agents
      GROUP BY range
    `).all() as { range: string; count: number }[];

    const repTrends = db.prepare(`
      SELECT DATE(created_at) as date, AVG(score_delta) as score
      FROM reputation_events
      WHERE created_at >= datetime('now', '-14 days')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).all() as { date: string; score: number }[];

    const approvalStats = db.prepare(`
      SELECT 
        DATE(created_at) as date,
        SUM(CASE WHEN result = 'ALLOW' THEN 1 ELSE 0 END) as allow,
        SUM(CASE WHEN result = 'DENY' THEN 1 ELSE 0 END) as deny,
        SUM(CASE WHEN result = 'REQUIRE_HUMAN_APPROVAL' THEN 1 ELSE 0 END) as human
      FROM trust_decisions
      WHERE created_at >= datetime('now', '-7 days')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).all() as { date: string; allow: number; deny: number; human: number }[];

    const recentAudits = this.getAll(10);

    return {
      total_agents: totalAgents,
      active_agents: activeAgents,
      avg_trust_score: avgTrust,
      total_decisions: decisions.total,
      allow_rate: decisions.total > 0 ? decisions.allow / decisions.total : 0,
      deny_rate: decisions.total > 0 ? decisions.deny / decisions.total : 0,
      human_approval_rate: decisions.total > 0 ? decisions.human / decisions.total : 0,
      total_violations: violations,
      risk_distribution: riskDist,
      trust_distribution: trustDist,
      reputation_trends: repTrends,
      approval_stats: approvalStats,
      recent_audits: recentAudits,
    };
  }

  search(params: { agent_id?: string; outcome?: string; action?: string; from?: string; to?: string; query?: string }): AuditLog[] {
    const db = getDb();
    let sql = `SELECT al.*, a.name as agent_name FROM audit_logs al JOIN agents a ON a.id = al.agent_id WHERE 1=1`;
    const values: any[] = [];

    if (params.agent_id) { sql += " AND al.agent_id = ?"; values.push(params.agent_id); }
    if (params.outcome) { sql += " AND al.outcome = ?"; values.push(params.outcome); }
    if (params.action) { sql += " AND al.action = ?"; values.push(params.action); }
    if (params.from) { sql += " AND al.created_at >= ?"; values.push(params.from); }
    if (params.to) { sql += " AND al.created_at <= ?"; values.push(params.to); }
    if (params.query) {
      sql += " AND (al.reason LIKE ? OR al.details LIKE ? OR a.name LIKE ?)";
      const q = `%${params.query}%`;
      values.push(q, q, q);
    }

    sql += " ORDER BY al.created_at DESC LIMIT 200";
    return db.prepare(sql).all(...values) as AuditLog[];
  }
}

export const auditService = new AuditService();
