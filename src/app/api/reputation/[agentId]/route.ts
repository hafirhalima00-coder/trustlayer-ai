import { NextRequest, NextResponse } from "next/server";
import { reputationService } from "@/lib/services/reputation-service";

export async function GET(request: NextRequest, { params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params;
  return NextResponse.json({
    events: reputationService.getEventsByAgentId(agentId),
    trends: reputationService.getTrends(agentId),
  });
}
