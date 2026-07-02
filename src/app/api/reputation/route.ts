import { NextRequest, NextResponse } from "next/server";
import { reputationService } from "@/lib/services/reputation-service";

export async function GET() {
  return NextResponse.json({
    average: reputationService.getAverageScore(),
    distribution: reputationService.getDistribution(),
    trends: reputationService.getOverallTrends(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = reputationService.addEvent(body);
    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
