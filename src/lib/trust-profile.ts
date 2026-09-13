import { AgentIdentity } from "./did";
import { VerifiableCredential, CREDENTIAL_TEMPLATES } from "./vc";

export interface TrustAttestation {
  id: string;
  attester: string;
  attesterName: string;
  subject: string;
  type: "vouch" | "revoke" | "warn" | "certify";
  claim: string;
  signature: string;
  timestamp: string;
}

export interface TrustProfile {
  agentDID: string;
  agentName: string;
  description: string;
  owner: string;
  version: string;
  publicKeyHex: string;
  credentials: VerifiableCredential[];
  attestations: TrustAttestation[];
  reputation: {
    score: number;
    taskSuccess: number;
    taskFailure: number;
    policyViolations: number;
    humanApprovals: number;
    totalEvents: number;
  };
  authority: {
    allowedActions: string[];
    deniedActions: string[];
    maxRiskLevel: "low" | "medium" | "high" | "critical";
  };
  createdAt: string;
  lastVerified?: string;
}

export function calculateTrustScore(profile: TrustProfile): number {
  let score = 30; // base

  // Credential bonus (max +25)
  const verified = profile.credentials.filter(c => c.status === "active");
  score += Math.min(25, verified.length * 8);

  // Attestation bonus (max +20)
  const vouches = profile.attestations.filter(a => a.type === "vouch" || a.type === "certify");
  const warns = profile.attestations.filter(a => a.type === "warn" || a.type === "revoke");
  score += Math.min(20, vouches.length * 5);
  score -= Math.min(15, warns.length * 5);

  // Reputation events (max +25)
  const total = profile.reputation.taskSuccess + profile.reputation.taskFailure;
  if (total > 0) {
    const successRate = profile.reputation.taskSuccess / total;
    score += Math.round(successRate * 20);
  }
  score -= profile.reputation.policyViolations * 3;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getTrustLevel(score: number): { label: string; color: string; description: string } {
  if (score >= 80) return { label: "Trusted", color: "emerald", description: "High trust — full authority granted" };
  if (score >= 60) return { label: "Moderate", color: "yellow", description: "Moderate trust — scoped authority" };
  if (score >= 40) return { label: "Conditional", color: "orange", description: "Conditional trust — requires oversight" };
  return { label: "Untrusted", color: "red", description: "Low trust — restricted or denied" };
}
