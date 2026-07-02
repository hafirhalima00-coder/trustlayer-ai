import { NextRequest, NextResponse } from "next/server";
import { credentialService } from "@/lib/services/credential-service";
import { withDb } from "@/lib/with-db";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  withDb();
  const { id } = await params;
  const cred = credentialService.verify(id);
  if (!cred) return NextResponse.json({ error: "Credential not found" }, { status: 404 });
  return NextResponse.json(cred);
}
