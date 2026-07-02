import { NextRequest, NextResponse } from "next/server";
import { reputationService } from "@/lib/services/reputation-service";
import { withDb } from "@/lib/with-db";

export async function GET() {
  withDb();
  return NextResponse.json({
    average: reputationService.getAverageScore(),
    distribution: reputationService.getDistribution(),
    trends: reputationService.getOverallTrends(),
  });
}

export async function POST(request: NextRequest) {
  withDb();
  try {
    const body = await request.json();
    const event = reputationService.addEvent(body);
    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
