import { NextRequest, NextResponse } from "next/server";
import { agentService } from "@/lib/services/agent-service";
import { ensureDbInitialized } from "@/lib/db/init";

ensureDbInitialized();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (query) {
    return NextResponse.json(agentService.search(query));
  }

  return NextResponse.json(agentService.getAll());
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const agent = agentService.create(body);
    return NextResponse.json(agent, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
