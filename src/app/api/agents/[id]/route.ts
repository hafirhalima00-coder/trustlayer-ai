import { NextRequest, NextResponse } from "next/server";
import { agentService } from "@/lib/services/agent-service";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = agentService.getById(id);
  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  return NextResponse.json(agent);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const agent = agentService.update(id, body);
  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  return NextResponse.json(agent);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deleted = agentService.delete(id);
  if (!deleted) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
