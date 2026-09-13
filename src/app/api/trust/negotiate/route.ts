import { NextRequest, NextResponse } from "next/server";
import { evaluateTrustRequest, TrustNegotiationRequest, DEFAULT_POLICIES } from "@/lib/trust-negotiation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestorDID, requestorProfile, action, resource, credentials } = body;

    if (!requestorDID || !action || !resource) {
      return NextResponse.json({ error: "requestorDID, action, and resource are required" }, { status: 400 });
    }

    const negotiationRequest: TrustNegotiationRequest = {
      requestorDID,
      requestorName: requestorProfile?.agentName || "Unknown",
      action,
      resource,
      credentialsPresented: credentials || [],
      nonce: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    const result = await evaluateTrustRequest(
      negotiationRequest,
      requestorProfile || {
        agentDID: requestorDID,
        agentName: "Unknown",
        description: "",
        owner: "",
        version: "1.0.0",
        publicKeyHex: "",
        credentials: credentials || [],
        attestations: [],
        reputation: { score: 50, taskSuccess: 0, taskFailure: 0, policyViolations: 0, humanApprovals: 0, totalEvents: 0 },
        authority: { allowedActions: [], deniedActions: [], maxRiskLevel: "medium" },
        createdAt: new Date().toISOString(),
      }
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
