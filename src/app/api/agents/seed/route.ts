import { NextResponse } from "next/server";
import { withDb } from "@/lib/with-db";
import { createDID } from "@/lib/did";
import { issueCredential, CREDENTIAL_TEMPLATES } from "@/lib/vc";
import { calculateTrustScore } from "@/lib/trust-profile";

// In-memory store for Vercel compatibility
let agentIdentities: Record<string, any> = {};
let agentCredentials: Record<string, any[]> = {};
let trustNegotiations: any[] = [];

function storeIdentity(did: string, identity: any) { agentIdentities[did] = identity; }
function storeCredentials(did: string, creds: any[]) { agentCredentials[did] = creds; }

export async function POST() {
  withDb();

  const agents = [
    { name: "CodeReviewBot", desc: "Automated code review agent", owner: "Engineering", ver: "2.1.0", caps: ["code_review", "security_scan"] },
    { name: "DeployAgent", desc: "CI/CD deployment agent", owner: "DevOps", ver: "1.5.2", caps: ["deploy", "rollback"] },
    { name: "DataPipeline", desc: "ETL data transformation agent", owner: "Data Platform", ver: "3.0.1", caps: ["etl", "scheduling"] },
    { name: "SupportBot", desc: "Customer support agent", owner: "Customer Success", ver: "4.2.0", caps: ["ticketing", "response"] },
    { name: "PaymentProcessor", desc: "Payment transactions agent", owner: "Finance", ver: "2.3.0", caps: ["payments", "billing"] },
    { name: "SecurityMonitor", desc: "Security threat detection agent", owner: "Security", ver: "1.8.3", caps: ["monitoring", "incident_response"] },
  ];

  const results = [];

  for (const agent of agents) {
    const identity = await createDID(agent.name);
    storeIdentity(identity.did, { ...identity, name: agent.name });

    // Issue credentials for each agent
    const creds = [];
    for (const template of CREDENTIAL_TEMPLATES.slice(0, 3)) {
      const vc = await issueCredential(
        identity.did, agent.name, identity.keyPair,
        identity.did, template
      );
      creds.push(vc);
    }
    storeCredentials(identity.did, creds);

    const profile = {
      did: identity.did,
      name: agent.name,
      description: agent.desc,
      owner: agent.owner,
      version: agent.ver,
      capabilities: agent.caps,
      publicKeyHex: identity.keyPair.publicKeyHex,
      credentials: creds,
      reputation: {
        taskSuccess: Math.floor(Math.random() * 20) + 5,
        taskFailure: Math.floor(Math.random() * 3),
        policyViolations: Math.floor(Math.random() * 2),
        humanApprovals: Math.floor(Math.random() * 10) + 2,
      },
      trustScore: 0,
      createdAt: identity.registeredAt,
    };
    profile.trustScore = calculateTrustScore({
      agentDID: identity.did,
      agentName: agent.name,
      description: agent.desc,
      owner: agent.owner,
      version: agent.ver,
      publicKeyHex: identity.keyPair.publicKeyHex,
      credentials: creds,
      attestations: [],
      reputation: { ...profile.reputation, score: 0, totalEvents: profile.reputation.taskSuccess + profile.reputation.taskFailure },
      authority: { allowedActions: [], deniedActions: [], maxRiskLevel: "medium" },
      createdAt: identity.registeredAt,
    });

    results.push(profile);
  }

  return NextResponse.json({ agents: results, count: results.length });
}

export async function GET() {
  return NextResponse.json({
    agents: Object.values(agentIdentities),
    message: "POST to /api/agents/seed to generate fresh DID-based identities",
  });
}
