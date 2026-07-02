import { NextRequest, NextResponse } from "next/server";
import { trustDecisionEngine } from "@/lib/services/trust-decision-engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agent_id, action, resource } = body;

    if (!agent_id || !action || !resource) {
      return NextResponse.json({ error: "agent_id, action, and resource are required" }, { status: 400 });
    }

    const result = trustDecisionEngine.evaluate(agent_id, action, resource);

    // Also record to audit
    const { auditService } = await import("@/lib/services/audit-service");
    auditService.record({
      agent_id,
      action,
      resource,
      outcome: result.decision,
      confidence: result.confidence,
      reason: result.explanation,
      details: JSON.stringify({ factors: result.factors }),
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agent_id") || undefined;
  return NextResponse.json(trustDecisionEngine.getHistory(agentId));
}
