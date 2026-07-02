import { NextRequest, NextResponse } from "next/server";
import { credentialService } from "@/lib/services/credential-service";
import { withDb } from "@/lib/with-db";

export async function GET(request: NextRequest) {
  withDb();
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agent_id");

  const all = credentialService.getAll();

  if (agentId) {
    return NextResponse.json(all.filter((c: any) => c.agent_id === agentId));
  }

  return NextResponse.json(all);
}

export async function POST(request: NextRequest) {
  withDb();
  try {
    const body = await request.json();
    const cred = credentialService.create(body);
    return NextResponse.json(cred, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
