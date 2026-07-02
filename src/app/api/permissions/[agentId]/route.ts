import { NextRequest, NextResponse } from "next/server";
import { permissionService } from "@/lib/services/permission-service";

export async function GET(request: NextRequest, { params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params;
  return NextResponse.json(permissionService.getByAgentId(agentId));
}
