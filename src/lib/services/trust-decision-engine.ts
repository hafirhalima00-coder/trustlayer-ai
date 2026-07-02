import { getDb } from "../db/connection";
import { generateId } from "../utils";
import type { TrustDecisionRecord, TrustEvaluation, TrustFactor } from "@/types";
import { agentService } from "./agent-service";
import { permissionService } from "./permission-service";
import { TRUST_THRESHOLDS } from "../constants";

export class TrustDecisionEngine {
  evaluate(agentId: string, action: string, resource: string): TrustEvaluation {
    const db = getDb();
    const agent = agentService.getById(agentId);
    if (!agent) {
      return this.denyResult("Agent not found", "critical");
    }

    const factors: TrustFactor[] = [];
    let totalScore = 0;
    let totalWeight = 0;

    // 1. Identity check
    const identityScore = agent.status === "active" ? 95 : agent.status === "pending" ? 40 : 10;
    factors.push({
      name: "Identity Verification",
      score: identityScore,
      weight: 15,
      status: identityScore >= 80 ? "pass" : identityScore >= 50 ? "warning" : "fail",
      details: `Agent '${agent.name}' is ${agent.status}`
    });
    totalScore += identityScore * 15;
    totalWeight += 15;

    // 2. Permission check
    const permission = permissionService.checkPermission(agentId, action, resource);
    let permScore = 50;
    let permStatus: "pass" | "fail" | "warning" = "warning";
    let permDetails = `No explicit permission for ${action}:${resource}`;

    if (permission) {
      if (permission.effect === "ALLOW") {
        permScore = 90;
        permStatus = "pass";
        permDetails = `Explicit ALLOW for ${action}:${resource}`;
      } else if (permission.effect === "REQUIRE_HUMAN_APPROVAL") {
        permScore = 50;
        permStatus = "warning";
        permDetails = `Permission requires human approval for ${action}:${resource}`;
      } else {
        permScore = 10;
        permStatus = "fail";
        permDetails = `Explicit DENY for ${action}:${resource}`;
      }
    }

    factors.push({
      name: "Permission Check",
      score: permScore,
      weight: 25,
      status: permStatus,
      details: permDetails
    });
    totalScore += permScore * 25;
    totalWeight += 25;

    // 3. Reputation check
    const repScore = agent.trust_score;
    factors.push({
      name: "Reputation Score",
      score: repScore,
      weight: 25,
      status: repScore >= 80 ? "pass" : repScore >= 60 ? "warning" : "fail",
      details: `Trust score: ${repScore.toFixed(1)}/100`
    });
    totalScore += repScore * 25;
    totalWeight += 25;

    // 4. Policy check
    const violations = db.prepare(
      "SELECT COUNT(*) as count FROM reputation_events WHERE agent_id = ? AND event_type = 'policy_violation'"
    ).get(agentId) as { count: number };

    const violationScore = Math.max(0, 100 - (violations.count * 15));
    factors.push({
      name: "Policy Compliance",
      score: violationScore,
      weight: 20,
      status: violationScore >= 80 ? "pass" : violationScore >= 50 ? "warning" : "fail",
      details: `${violations.count} policy violation(s) recorded`
    });
    totalScore += violationScore * 20;
    totalWeight += 20;

    // 5. Risk assessment
    const failedTasks = db.prepare(
      "SELECT COUNT(*) as count FROM reputation_events WHERE agent_id = ? AND event_type = 'task_failure'"
    ).get(agentId) as { count: number };

    const failureRate = Math.min(1, failedTasks.count / 10);
    const riskScore = Math.max(0, 100 - (failureRate * 100));
    factors.push({
      name: "Risk Assessment",
      score: riskScore,
      weight: 15,
      status: riskScore >= 80 ? "pass" : riskScore >= 50 ? "warning" : "fail",
      details: `Failure rate: ${(failureRate * 100).toFixed(0)}%`
    });
    totalScore += riskScore * 15;
    totalWeight += 15;

    const weightedScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    const confidence = weightedScore / 100;

    let decision: "ALLOW" | "DENY" | "REQUIRE_HUMAN_APPROVAL";
    let explanation: string;
    let riskLevel: "low" | "medium" | "high" | "critical";

    if (weightedScore >= TRUST_THRESHOLDS.ALLOW_MINIMUM) {
      decision = "ALLOW";
      explanation = `Agent '${agent.name}' meets trust threshold (${weightedScore.toFixed(1)}%). All factors are satisfactory.`;
      riskLevel = weightedScore >= 80 ? "low" : "medium";
    } else if (weightedScore >= TRUST_THRESHOLDS.HUMAN_APPROVAL_MINIMUM) {
      decision = "REQUIRE_HUMAN_APPROVAL";
      explanation = `Agent '${agent.name}' has marginal trust score (${weightedScore.toFixed(1)}%). Human oversight required.`;
      riskLevel = "high";
    } else {
      decision = "DENY";
      explanation = `Agent '${agent.name}' has insufficient trust score (${weightedScore.toFixed(1)}%). Action denied.`;
      riskLevel = "critical";
    }

    // If permission explicitly denies, override
    if (permission && permission.effect === "DENY") {
      decision = "DENY";
      explanation = `Explicit DENY permission for ${action}:${resource}`;
      riskLevel = "critical";
    }

    // If permission requires human approval, ensure that
    if (permission && permission.effect === "REQUIRE_HUMAN_APPROVAL" && decision === "ALLOW") {
      decision = "REQUIRE_HUMAN_APPROVAL";
      explanation = `Action ${action}:${resource} requires human approval per permission policy.`;
      riskLevel = "high";
    }

    // Record the decision
    this.recordDecision(agentId, action, resource, decision, confidence, explanation, riskLevel);

    return { decision, confidence, explanation, risk_level: riskLevel, factors };
  }

  private recordDecision(agentId: string, action: string, resource: string, result: string, confidence: number, explanation: string, riskLevel: string): void {
    const db = getDb();
    db.prepare(
      "INSERT INTO trust_decisions (id, agent_id, action, resource, result, confidence, explanation, risk_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(generateId(), agentId, action, resource, result, confidence, explanation, riskLevel);
  }

  getHistory(agentId?: string): TrustDecisionRecord[] {
    const db = getDb();
    let query = `SELECT d.*, a.name as agent_name FROM trust_decisions d JOIN agents a ON a.id = d.agent_id`;
    const params: string[] = [];
    if (agentId) {
      query += " WHERE d.agent_id = ?";
      params.push(agentId);
    }
    query += " ORDER BY d.created_at DESC LIMIT 100";
    return db.prepare(query).all(...params) as TrustDecisionRecord[];
  }

  getStats(): { total: number; allow: number; deny: number; human: number } {
    const db = getDb();
    const total = (db.prepare("SELECT COUNT(*) as count FROM trust_decisions").get() as { count: number }).count;
    const allow = (db.prepare("SELECT COUNT(*) as count FROM trust_decisions WHERE result = 'ALLOW'").get() as { count: number }).count;
    const deny = (db.prepare("SELECT COUNT(*) as count FROM trust_decisions WHERE result = 'DENY'").get() as { count: number }).count;
    const human = (db.prepare("SELECT COUNT(*) as count FROM trust_decisions WHERE result = 'REQUIRE_HUMAN_APPROVAL'").get() as { count: number }).count;
    return { total, allow, deny, human };
  }

  private denyResult(explanation: string, riskLevel: "low" | "medium" | "high" | "critical"): TrustEvaluation {
    return {
      decision: "DENY",
      confidence: 0,
      explanation,
      risk_level: riskLevel,
      factors: []
    };
  }
}

export const trustDecisionEngine = new TrustDecisionEngine();
