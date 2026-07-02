export type AgentStatus = "active" | "inactive" | "suspended" | "pending";
export type PermissionEffect = "ALLOW" | "DENY" | "REQUIRE_HUMAN_APPROVAL";
export type TrustDecision = "ALLOW" | "DENY" | "REQUIRE_HUMAN_APPROVAL";
export type CredentialStatus = "verified" | "pending" | "expired" | "revoked";
export type EventType = "task_success" | "task_failure" | "policy_violation" | "human_approval" | "credential_verified" | "reputation_penalty" | "reputation_bonus";

export interface Agent {
  id: string;
  name: string;
  description: string;
  owner: string;
  version: string;
  status: AgentStatus;
  capabilities: string[];
  trust_score: number;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  agent_id: string;
  action: string;
  resource: string;
  effect: PermissionEffect;
  conditions?: string;
  created_at: string;
}

export interface ReputationEvent {
  id: string;
  agent_id: string;
  event_type: EventType;
  score_delta: number;
  description: string;
  created_at: string;
}

export interface Credential {
  id: string;
  agent_id: string;
  type: string;
  issuer: string;
  status: CredentialStatus;
  issued_at: string;
  expires_at: string | null;
  verified_at: string | null;
  metadata?: string;
}

export interface TrustDecisionRecord {
  id: string;
  agent_id: string;
  agent_name?: string;
  action: string;
  resource: string;
  result: TrustDecision;
  confidence: number;
  explanation: string;
  risk_level: "low" | "medium" | "high" | "critical";
  created_at: string;
}

export interface AuditLog {
  id: string;
  agent_id: string;
  agent_name?: string;
  action: string;
  resource: string;
  outcome: string;
  confidence: number;
  reason: string;
  details: string | null;
  created_at: string;
}

export interface TrustEvaluation {
  decision: TrustDecision;
  confidence: number;
  explanation: string;
  risk_level: "low" | "medium" | "high" | "critical";
  factors: TrustFactor[];
}

export interface TrustFactor {
  name: string;
  score: number;
  weight: number;
  status: "pass" | "fail" | "warning";
  details: string;
}

export interface AnalyticsSummary {
  total_agents: number;
  active_agents: number;
  avg_trust_score: number;
  total_decisions: number;
  allow_rate: number;
  deny_rate: number;
  human_approval_rate: number;
  total_violations: number;
  risk_distribution: { level: string; count: number }[];
  trust_distribution: { range: string; count: number }[];
  reputation_trends: { date: string; score: number }[];
  approval_stats: { date: string; allow: number; deny: number; human: number }[];
  recent_audits: AuditLog[];
}
