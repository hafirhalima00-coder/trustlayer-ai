import { NextRequest, NextResponse } from "next/server";
import { createDID } from "@/lib/did";
import { issueCredential, CREDENTIAL_TEMPLATES } from "@/lib/vc";
import { evaluateTrustRequest } from "@/lib/trust-negotiation";
import { TrustProfile, calculateTrustScore } from "@/lib/trust-profile";

export async function POST(request: NextRequest) {
  try {
    const { action, resource } = await request.json();

    if (!action || !resource) {
      return NextResponse.json({ error: "action and resource are required" }, { status: 400 });
    }

    // Create two agents: requestor and resource owner
    const requestorIdentity = await createDID("RequestorAgent");
    const ownerIdentity = await createDID("OwnerAgent");

    // Issue credentials to requestor
    const requestorCreds = [];
    for (const template of CREDENTIAL_TEMPLATES.slice(0, 2)) {
      const vc = await issueCredential(
        ownerIdentity.did, "OwnerAgent", ownerIdentity.keyPair,
        requestorIdentity.did, template
      );
      requestorCreds.push(vc);
    }

    const requestorProfile: TrustProfile = {
      agentDID: requestorIdentity.did,
      agentName: "RequestorAgent",
      description: "Agent requesting permission to perform action",
      owner: "Engineering",
      version: "1.0.0",
      publicKeyHex: requestorIdentity.keyPair.publicKeyHex,
      credentials: requestorCreds,
      attestations: [],
      reputation: { score: 65, taskSuccess: 15, taskFailure: 3, policyViolations: 1, humanApprovals: 5, totalEvents: 18 },
      authority: { allowedActions: ["read", "write"], deniedActions: ["deploy"], maxRiskLevel: "medium" },
      createdAt: requestorIdentity.registeredAt,
    };

    requestorProfile.reputation.score = calculateTrustScore(requestorProfile);

    const negotiationResult = await evaluateTrustRequest(
      {
        requestorDID: requestorIdentity.did,
        requestorName: "RequestorAgent",
        action,
        resource,
        credentialsPresented: requestorCreds,
        nonce: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      },
      requestorProfile
    );

    return NextResponse.json({
      negotiation: negotiationResult,
      requestor: {
        did: requestorIdentity.did,
        name: "RequestorAgent",
        publicKey: requestorIdentity.keyPair.publicKeyHex,
        credentials: requestorCreds.map(vc => ({ type: vc.type[1], status: vc.status })),
      },
      owner: {
        did: ownerIdentity.did,
        name: "OwnerAgent",
        publicKey: ownerIdentity.keyPair.publicKeyHex,
      },
      flow: [
        { step: 1, action: "RequestorAgent presents DID and credentials", icon: "user" },
        { step: 2, action: "OwnerAgent verifies credential signatures", icon: "key" },
        { step: 3, action: "Trust engine evaluates identity, credentials, reputation, policy, risk", icon: "scale" },
        { step: 4, action: `Decision: ${negotiationResult.decision}`, icon: negotiationResult.decision === "ALLOW" ? "check" : "x" },
      ],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
