import { NextRequest, NextResponse } from "next/server";
import { auditService } from "@/lib/services/audit-service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const agentId = searchParams.get("agent_id");
  const outcome = searchParams.get("outcome");
  const action = searchParams.get("action");
  const query = searchParams.get("q");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (agentId || outcome || action || query || from || to) {
    return NextResponse.json(auditService.search({ agent_id: agentId || undefined, outcome: outcome || undefined, action: action || undefined, query: query || undefined, from: from || undefined, to: to || undefined }));
  }

  // If no filters, return analytics summary
  return NextResponse.json(auditService.getAnalytics());
}
