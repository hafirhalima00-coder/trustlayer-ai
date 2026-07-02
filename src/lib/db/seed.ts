import { initializeSchema } from "./schema";
import { getDb } from "./connection";
import { generateId } from "../utils";

export function seedDatabase(): void {
  initializeSchema();
  const db = getDb();

  const agentCount = db.prepare("SELECT COUNT(*) as count FROM agents").get() as { count: number };
  if (agentCount.count > 0) return;

  const agents = [
    { id: generateId(), name: "CodeReviewBot", desc: "Automated code review and analysis agent", owner: "Engineering", ver: "2.1.0", score: 85 },
    { id: generateId(), name: "DataPipeline", desc: "Manages ETL and data transformation workflows", owner: "Data Platform", ver: "3.0.1", score: 72 },
    { id: generateId(), name: "DeployAgent", desc: "Handles CI/CD deployment pipelines", owner: "DevOps", ver: "1.5.2", score: 45 },
    { id: generateId(), name: "SupportBot", desc: "Customer support and ticket resolution agent", owner: "Customer Success", ver: "4.2.0", score: 91 },
    { id: generateId(), name: "AnalyticsEngine", desc: "Business intelligence and reporting agent", owner: "Analytics", ver: "2.0.0", score: 68 },
    { id: generateId(), name: "SecurityMonitor", desc: "Security threat detection and incident response", owner: "Security", ver: "1.8.3", score: 93 },
    { id: generateId(), name: "PaymentProcessor", desc: "Handles payment transactions and billing", owner: "Finance", ver: "2.3.0", score: 38 },
    { id: generateId(), name: "ContentGenerator", desc: "AI-powered content creation and curation", owner: "Marketing", ver: "1.1.0", score: 58 },
  ];

  const insertAgent = db.prepare(
    "INSERT INTO agents (id, name, description, owner, version, status, capabilities, trust_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  const insertPermission = db.prepare(
    "INSERT INTO permissions (id, agent_id, action, resource, effect) VALUES (?, ?, ?, ?, ?)"
  );
  const insertReputation = db.prepare(
    "INSERT INTO reputation_events (id, agent_id, event_type, score_delta, description) VALUES (?, ?, ?, ?, ?)"
  );
  const insertCredential = db.prepare(
    "INSERT INTO credentials (id, agent_id, type, issuer, status, issued_at, verified_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  const insertDecision = db.prepare(
    "INSERT INTO trust_decisions (id, agent_id, action, resource, result, confidence, explanation, risk_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  const insertAudit = db.prepare(
    "INSERT INTO audit_logs (id, agent_id, action, resource, outcome, confidence, reason, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );

  const transaction = db.transaction(() => {
    for (const agent of agents) {
      const capabilities = agent.name === "CodeReviewBot" ? JSON.stringify(["code_review", "security_scan", "linting"])
        : agent.name === "DataPipeline" ? JSON.stringify(["etl", "data_transform", "scheduling"])
        : agent.name === "DeployAgent" ? JSON.stringify(["deploy", "rollback", "health_check"])
        : agent.name === "SupportBot" ? JSON.stringify(["ticketing", "response", "escalation"])
        : agent.name === "AnalyticsEngine" ? JSON.stringify(["reporting", "visualization", "forecasting"])
        : agent.name === "SecurityMonitor" ? JSON.stringify(["monitoring", "threat_detection", "incident_response"])
        : agent.name === "PaymentProcessor" ? JSON.stringify(["payments", "invoicing", "reconciliation"])
        : JSON.stringify(["generation", "curation", "optimization"]);

      insertAgent.run(agent.id, agent.name, agent.desc, agent.owner, agent.ver, "active", capabilities, agent.score);

      const perms = agent.name === "CodeReviewBot"
        ? [["read", "codebase", "ALLOW"], ["write", "review_comments", "ALLOW"], ["execute", "security_scan", "ALLOW"], ["delete", "production", "DENY"], ["deploy", "production", "DENY"]]
        : agent.name === "DataPipeline"
        ? [["read", "database", "ALLOW"], ["write", "data_warehouse", "ALLOW"], ["execute", "etl_job", "ALLOW"], ["delete", "raw_data", "ALLOW"], ["admin", "system", "DENY"]]
        : agent.name === "DeployAgent"
        ? [["read", "repository", "ALLOW"], ["deploy", "staging", "ALLOW"], ["deploy", "production", "REQUIRE_HUMAN_APPROVAL"], ["execute", "rollback", "ALLOW"], ["delete", "production", "DENY"]]
        : agent.name === "SupportBot"
        ? [["read", "tickets", "ALLOW"], ["write", "tickets", "ALLOW"], ["read", "users", "ALLOW"], ["execute", "escalate", "ALLOW"], ["delete", "tickets", "DENY"]]
        : agent.name === "AnalyticsEngine"
        ? [["read", "database", "ALLOW"], ["read", "data_warehouse", "ALLOW"], ["execute", "queries", "ALLOW"], ["write", "reports", "ALLOW"], ["delete", "raw_data", "DENY"]]
        : agent.name === "SecurityMonitor"
        ? [["read", "logs", "ALLOW"], ["read", "network", "ALLOW"], ["execute", "incident_response", "ALLOW"], ["admin", "monitoring", "ALLOW"], ["delete", "evidence", "DENY"]]
        : agent.name === "PaymentProcessor"
        ? [["read", "payments", "ALLOW"], ["write", "transactions", "ALLOW"], ["transfer", "funds", "REQUIRE_HUMAN_APPROVAL"], ["execute", "refund", "REQUIRE_HUMAN_APPROVAL"], ["delete", "ledger", "DENY"]]
        : [["read", "content", "ALLOW"], ["write", "content", "ALLOW"], ["execute", "publish", "REQUIRE_HUMAN_APPROVAL"], ["delete", "content", "ALLOW"], ["admin", "system", "DENY"]];

      for (const [action, resource, effect] of perms) {
        insertPermission.run(generateId(), agent.id, action, resource, effect, null);
      }

      const events = [
        { type: "task_success", delta: 5, desc: "Completed task successfully" },
        { type: "task_success", delta: 3, desc: "Routine task completed" },
        { type: "task_failure", delta: -4, desc: "Task execution failed" },
        { type: "human_approval", delta: 8, desc: "Human approved action" },
        { type: "policy_violation", delta: -10, desc: "Policy violation detected" },
        { type: "task_success", delta: 4, desc: "Batch processing complete" },
        { type: "reputation_bonus", delta: 6, desc: "Consistent reliability bonus" },
      ];

      const daysAgo = [7, 6, 5, 4, 3, 2, 1];
      for (let i = 0; i < events.length; i++) {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo[i]);
        insertReputation.run(generateId(), agent.id, events[i].type, events[i].delta, events[i].desc);
      }

      const creds = [
        { type: "GDPR Compliant", issuer: "EU Data Protection Board", status: "verified", days: 30 },
        { type: "Human Approved", issuer: "TrustLayer Governance", status: "verified", days: 15 },
        { type: "SOC 2 Type II", issuer: "AICPA", status: agent.score > 60 ? "verified" : "pending", days: agent.score > 60 ? 45 : 0 },
      ];

      for (const cred of creds) {
        const issued = new Date();
        issued.setDate(issued.getDate() - cred.days);
        const verified = cred.status === "verified" ? issued.toISOString() : null;
        insertCredential.run(generateId(), agent.id, cred.type, cred.issuer, cred.status, issued.toISOString(), verified);
      }

      const decisions = [
        { action: "read", resource: "database", result: "ALLOW", conf: 0.92, risk: "low", expl: "Agent has read permission and sufficient trust" },
        { action: "write", resource: "user_data", result: agent.score > 70 ? "ALLOW" : "DENY", conf: agent.score > 70 ? 0.85 : 0.95, risk: agent.score > 70 ? "low" : "high", expl: agent.score > 70 ? "Agent authorized for write operations" : "Insufficient trust score for write operations" },
        { action: "deploy", resource: "production", result: agent.score > 80 ? "ALLOW" : agent.score > 50 ? "REQUIRE_HUMAN_APPROVAL" : "DENY", conf: 0.78, risk: "high", expl: "Production deployment requires elevated trust" },
        { action: "transfer", resource: "payments", result: "REQUIRE_HUMAN_APPROVAL", conf: 0.65, risk: "critical", expl: "Payment transfers always require human oversight" },
        { action: "execute", resource: "sandbox", result: "ALLOW", conf: 0.95, risk: "low", expl: "Sandbox execution is permitted for all active agents" },
      ];

      const decisionDays = [6, 5, 4, 3, 1];
      for (let i = 0; i < decisions.length; i++) {
        const d = decisions[i];
        const date = new Date();
        date.setDate(date.getDate() - decisionDays[i]);
        insertDecision.run(generateId(), agent.id, d.action, d.resource, d.result, d.conf, d.expl, d.risk);
        insertAudit.run(generateId(), agent.id, d.action, d.resource, d.result, d.conf, d.expl, JSON.stringify({ agent_version: agent.ver, evaluated_by: "TrustLayer Engine v1.0" }));
      }
    }
  });

  transaction();
}
