import { NextRequest, NextResponse } from "next/server";
import { reputationService } from "@/lib/services/reputation-service";
import { withDb } from "@/lib/with-db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ agentId: string }> }) {
  withDb();
  const { agentId } = await params;
  return NextResponse.json({
    events: reputationService.getEventsByAgentId(agentId),
    trends: reputationService.getTrends(agentId),
  });
}
