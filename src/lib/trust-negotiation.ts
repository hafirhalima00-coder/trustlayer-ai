import { AgentIdentity } from "./did";
import { VerifiableCredential, verifyCredential, issueCredential, CREDENTIAL_TEMPLATES } from "./vc";
import { TrustProfile, calculateTrustScore, getTrustLevel } from "./trust-profile";
import { sign, verify, importPublicKey, sha256 } from "./crypto";

export interface TrustNegotiationRequest {
  requestorDID: string;
  requestorName: string;
  action: string;
  resource: string;
  credentialsPresented: VerifiableCredential[];
  nonce: string;
  timestamp: string;
}

export interface TrustNegotiationResult {
  decision: "ALLOW" | "DENY" | "REQUIRE_HUMAN_APPROVAL";
  confidence: number;
  factors: TrustFactor[];
  explanation: string;
  requestHash: string;
  timestamp: string;
  signature: string;
}

export interface TrustFactor {
  name: string;
  weight: number;
  score: number;
  status: "pass" | "fail" | "warning";
  details: string;
}

export interface TrustPolicy {
  id: string;
  name: string;
  action: string;
  minTrustScore: number;
  requiredCredentials: string[];
  deniedActions: string[];
  requireHumanApproval: string[];
}

export const DEFAULT_POLICIES: TrustPolicy[] = [
  {
    id: "read-data",
    name: "Read Data",
    action: "read",
    minTrustScore: 30,
    requiredCredentials: [],
    deniedActions: [],
    requireHumanApproval: [],
  },
  {
    id: "write-data",
    name: "Write Data",
    action: "write",
    minTrustScore: 50,
    requiredCredentials: ["SandboxClearance"],
    deniedActions: [],
    requireHumanApproval: [],
  },
  {
    id: "execute-sandbox",
    name: "Execute in Sandbox",
    action: "execute",
    minTrustScore: 40,
    requiredCredentials: ["SandboxClearance"],
    deniedActions: [],
    requireHumanApproval: [],
  },
  {
    id: "deploy-staging",
    name: "Deploy to Staging",
    action: "deploy",
    minTrustScore: 60,
    requiredCredentials: ["SOC2Compliance"],
    deniedActions: [],
    requireHumanApproval: [],
  },
  {
    id: "deploy-production",
    name: "Deploy to Production",
    action: "deploy",
    minTrustScore: 80,
    requiredCredentials: ["SOC2Compliance", "HumanApproved"],
    deniedActions: [],
    requireHumanApproval: ["deploy"],
  },
  {
    id: "transfer-funds",
    name: "Transfer Funds",
    action: "transfer",
    minTrustScore: 90,
    requiredCredentials: ["HumanApproved", "SOC2Compliance"],
    deniedActions: [],
    requireHumanApproval: ["transfer"],
  },
];

export async function evaluateTrustRequest(
  request: TrustNegotiationRequest,
  requestorProfile: TrustProfile,
  policies: TrustPolicy[] = DEFAULT_POLICIES
): Promise<TrustNegotiationResult> {
  const factors: TrustFactor[] = [];
  let totalWeight = 0;
  let weightedScore = 0;

  // 1. Identity Verification (weight: 15)
  const identityScore = requestorProfile.agentDID ? 95 : 0;
  factors.push({
    name: "Identity Verification",
    weight: 15,
    score: identityScore,
    status: identityScore >= 80 ? "pass" : identityScore > 0 ? "warning" : "fail",
    details: `Agent "${requestorProfile.agentName}" presents DID: ${requestorProfile.agentDID.slice(0, 28)}...`,
  });
  weightedScore += identityScore * 15;
  totalWeight += 15;

  // 2. Credential Verification (weight: 25)
  let credScore = 0;
  let credDetails = "";
  const validCredentials: VerifiableCredential[] = [];

  for (const vc of request.credentialsPresented) {
    const issuerKey = requestorProfile.publicKeyHex;
    const result = await verifyCredential(vc, issuerKey);
    if (result.valid) {
      validCredentials.push(vc);
      credScore += 25;
      credDetails += `${vc.type[1]} ✓ `;
    } else {
      credScore -= 10;
      credDetails += `${vc.type[1]} ✗ (${result.reasons[0]}) `;
    }
  }

  credScore = Math.max(0, Math.min(100, credScore));
  factors.push({
    name: "Credential Verification",
    weight: 25,
    score: credScore,
    status: credScore >= 60 ? "pass" : credScore >= 30 ? "warning" : "fail",
    details: credDetails || "No credentials presented",
  });
  weightedScore += credScore * 25;
  totalWeight += 25;

  // 3. Reputation (weight: 25)
  const repScore = calculateTrustScore(requestorProfile);
  factors.push({
    name: "Reputation Score",
    weight: 25,
    score: repScore,
    status: repScore >= 60 ? "pass" : repScore >= 40 ? "warning" : "fail",
    details: `Trust score: ${repScore}/100 (${getTrustLevel(repScore).label})`,
  });
  weightedScore += repScore * 25;
  totalWeight += 25;

  // 4. Policy Compliance (weight: 20)
  const policy = policies.find(p => p.action === request.action) || policies.find(p => p.id === `read-data`);
  let policyScore = 100;
  let policyDetails = "No policy violations";

  const requiredCreds = policy?.requiredCredentials || [];
  const presentedTypes = validCredentials.map(vc => vc.type[1]);
  const missingCreds = requiredCreds.filter(rc => !presentedTypes.includes(rc));

  if (missingCreds.length > 0) {
    policyScore = Math.max(0, policyScore - missingCreds.length * 25);
    policyDetails = `Missing required credentials: ${missingCreds.join(", ")}`;
  }

  if (requestorProfile.reputation.policyViolations > 0) {
    policyScore = Math.max(0, policyScore - requestorProfile.reputation.policyViolations * 10);
    policyDetails += `; ${requestorProfile.reputation.policyViolations} prior violations`;
  }

  factors.push({
    name: "Policy Compliance",
    weight: 20,
    score: policyScore,
    status: policyScore >= 75 ? "pass" : policyScore >= 50 ? "warning" : "fail",
    details: policyDetails,
  });
  weightedScore += policyScore * 20;
  totalWeight += 20;

  // 5. Risk Assessment (weight: 15)
  const total = requestorProfile.reputation.taskSuccess + requestorProfile.reputation.taskFailure;
  const failureRate = total > 0 ? requestorProfile.reputation.taskFailure / total : 0.5;
  const riskScore = Math.round(Math.max(0, (1 - failureRate) * 100));
  factors.push({
    name: "Risk Assessment",
    weight: 15,
    score: riskScore,
    status: riskScore >= 70 ? "pass" : riskScore >= 40 ? "warning" : "fail",
    details: `Failure rate: ${(failureRate * 100).toFixed(1)}% across ${total} tasks`,
  });
  weightedScore += riskScore * 15;
  totalWeight += 15;

  const finalScore = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
  const confidence = finalScore / 100;

  let decision: "ALLOW" | "DENY" | "REQUIRE_HUMAN_APPROVAL";
  let explanation: string;

  if (finalScore >= 70) {
    decision = "ALLOW";
    explanation = `Trust evaluation PASSED. Agent "${requestorProfile.agentName}" meets all requirements with score ${finalScore}/100.`;
  } else if (finalScore >= 45) {
    decision = "REQUIRE_HUMAN_APPROVAL";
    explanation = `Trust evaluation CONDITIONAL. Agent "${requestorProfile.agentName}" scored ${finalScore}/100. Human oversight required.`;
  } else {
    decision = "DENY";
    explanation = `Trust evaluation FAILED. Agent "${requestorProfile.agentName}" scored ${finalScore}/100, below the minimum threshold.`;
  }

  const requestHash = await sha256(JSON.stringify(request));
  const resultPayload = JSON.stringify({ decision, requestHash, score: finalScore, timestamp: new Date().toISOString() });

  return {
    decision,
    confidence,
    factors,
    explanation,
    requestHash,
    timestamp: new Date().toISOString(),
    signature: "0x" + await sign(await getDummyPrivateKey(), resultPayload),
  };
}

async function getDummyPrivateKey(): Promise<CryptoKey> {
  const { generateKeyPair } = await import("./crypto");
  const kp = await generateKeyPair();
  return kp.privateKey;
}
