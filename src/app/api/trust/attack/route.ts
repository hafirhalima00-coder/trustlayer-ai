import { NextRequest, NextResponse } from "next/server";
import {
  simulateSpoofedIdentity,
  simulateRevokedCredential,
  simulateExpiredCredential,
  simulateTamperedCredential,
  simulateReplayAttack,
  ATTACK_SCENARIOS,
  AttackResult,
} from "@/lib/attack-scenarios";
import { createDID } from "@/lib/did";
import { issueCredential, CREDENTIAL_TEMPLATES } from "@/lib/vc";
import { TrustProfile } from "@/lib/trust-profile";

export async function GET() {
  return NextResponse.json({ scenarios: ATTACK_SCENARIOS });
}

export async function POST(request: NextRequest) {
  try {
    const { scenarioId } = await request.json();

    // Create a legitimate agent for the demo
    const legitimate = await createDID("LegitimateAgent");
    const attacker = await createDID("AttackerAgent");

    const legitCreds = [];
    for (const t of CREDENTIAL_TEMPLATES.slice(0, 3)) {
      const vc = await issueCredential(
        legitimate.did, "LegitimateAgent", legitimate.keyPair,
        legitimate.did, t
      );
      legitCreds.push(vc);
    }

    const legitProfile: TrustProfile = {
      agentDID: legitimate.did,
      agentName: "LegitimateAgent",
      description: "A trusted agent with valid credentials",
      owner: "Engineering",
      version: "2.1.0",
      publicKeyHex: legitimate.keyPair.publicKeyHex,
      credentials: legitCreds,
      attestations: [],
      reputation: { score: 80, taskSuccess: 25, taskFailure: 2, policyViolations: 0, humanApprovals: 8, totalEvents: 27 },
      authority: { allowedActions: ["read", "write", "execute"], deniedActions: [], maxRiskLevel: "medium" },
      createdAt: legitimate.registeredAt,
    };

    let result: AttackResult;

    switch (scenarioId) {
      case "spoofed-identity":
        result = await simulateSpoofedIdentity(attacker, legitProfile);
        break;
      case "revoked-credential": {
        const revokedVC = { ...legitCreds[0], status: "revoked" as const, revokedAt: new Date().toISOString() };
        result = await simulateRevokedCredential(revokedVC, legitimate.keyPair.publicKeyHex);
        break;
      }
      case "expired-credential": {
        const expiredVC = {
          ...legitCreds[0],
          expirationDate: new Date(Date.now() - 86400000).toISOString(),
        };
        result = await simulateExpiredCredential(expiredVC, legitimate.keyPair.publicKeyHex);
        break;
      }
      case "tampered-credential": {
        const tamperedVC = {
          ...legitCreds[0],
          credentialSubject: { ...legitCreds[0].credentialSubject, access_level: "admin" },
        };
        result = await simulateTamperedCredential(tamperedVC, "tampered", legitimate.keyPair.publicKeyHex);
        break;
      }
      case "replay-attack":
        result = await simulateReplayAttack(legitCreds[0], attacker.did);
        break;
      default:
        return NextResponse.json({ error: "Unknown scenario" }, { status: 400 });
    }

    return NextResponse.json({
      result,
      legitimate: { did: legitimate.did, name: "LegitimateAgent", publicKey: legitimate.keyPair.publicKeyHex.slice(0, 24) + "..." },
      attacker: { did: attacker.did, name: "AttackerAgent", publicKey: attacker.keyPair.publicKeyHex.slice(0, 24) + "..." },
      evidence: {
        legitCredentials: legitCreds.length,
        presentedCredential: result.scenario.id === "revoked-credential" ? "Revoked VC" : result.scenario.id === "expired-credential" ? "Expired VC" : result.scenario.id === "tampered-credential" ? "Tampered VC" : "Legit VC",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
