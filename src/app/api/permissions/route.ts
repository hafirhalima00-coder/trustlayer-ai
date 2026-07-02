import { NextRequest, NextResponse } from "next/server";
import { permissionService } from "@/lib/services/permission-service";
import { withDb } from "@/lib/with-db";

export async function GET() {
  withDb();
  return NextResponse.json(permissionService.getAll());
}

export async function POST(request: NextRequest) {
  withDb();
  try {
    const body = await request.json();
    const perm = permissionService.create(body);
    return NextResponse.json(perm, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
