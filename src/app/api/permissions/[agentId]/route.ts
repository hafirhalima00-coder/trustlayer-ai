import { NextRequest, NextResponse } from "next/server";
import { permissionService } from "@/lib/services/permission-service";
import { withDb } from "@/lib/with-db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ agentId: string }> }) {
  withDb();
  const { agentId } = await params;
  return NextResponse.json(permissionService.getByAgentId(agentId));
}
