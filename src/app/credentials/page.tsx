"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CredentialCard, CredentialVerifier } from "@/components/credentials/credential-card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Shield } from "lucide-react";

interface Credential {
  id: string; agent_id: string; type: string; issuer: string; status: string; issued_at: string; expires_at: string | null; verified_at: string | null; agent_name?: string;
}

export default function CredentialsPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCredentials = () => {
    setLoading(true);
    fetch("/api/credentials")
      .then(r => r.json())
      .then(d => setCredentials(d))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCredentials(); }, []);

  const handleVerify = async (credId: string) => {
    await fetch(`/api/credentials/${credId}/verify`, { method: "POST" });
    fetchCredentials();
    return true;
  };

  const pending = credentials.filter(c => c.status === "pending");
  const verified = credentials.filter(c => c.status === "verified");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Credentials</h1>
          <p className="text-muted-foreground mt-1">Certifications and compliance badges for AI agents</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  Verified Credentials
                </CardTitle>
                <span className="text-xs text-muted-foreground">{verified.length} credentials</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
              ) : verified.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No verified credentials</p>
              ) : (
                verified.map(cred => <CredentialCard key={cred.id} credential={cred} showAgent />)
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-yellow-500" />
                  Pending Verification
                </CardTitle>
                <span className="text-xs text-muted-foreground">{pending.length} pending</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
              ) : pending.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No pending credentials</p>
              ) : (
                pending.map(cred => <CredentialCard key={cred.id} credential={cred} onVerify={handleVerify} showAgent />)
              )}
            </CardContent>
          </Card>
        </div>

        <CredentialVerifier onVerify={handleVerify} />
      </div>
    </div>
  );
}
