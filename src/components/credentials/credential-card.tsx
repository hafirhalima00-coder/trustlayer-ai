"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Check, X, Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface Credential {
  id: string;
  type: string;
  issuer: string;
  status: string;
  issued_at: string;
  expires_at: string | null;
  verified_at: string | null;
  agent_name?: string;
}

interface CredentialCardProps {
  credential: Credential;
  onVerify?: (id: string) => void;
  showAgent?: boolean;
}

export function CredentialCard({ credential, onVerify, showAgent }: CredentialCardProps) {
  const statusColor = credential.status === "verified" ? "success" : credential.status === "pending" ? "warning" : credential.status === "expired" ? "danger" : "secondary";

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              credential.status === "verified" ? "bg-emerald-500/10" : "bg-muted"
            )}>
              <Shield className={cn("h-5 w-5", credential.status === "verified" ? "text-emerald-500" : "text-muted-foreground")} />
            </div>
            <div>
              <p className="text-sm font-semibold">{credential.type}</p>
              <p className="text-xs text-muted-foreground">Issued by {credential.issuer}</p>
              {showAgent && credential.agent_name && (
                <p className="text-xs text-muted-foreground">Agent: {credential.agent_name}</p>
              )}
            </div>
          </div>
          <Badge variant={statusColor}>{credential.status}</Badge>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            <span>Issued: {new Date(credential.issued_at).toLocaleDateString()}</span>
            {credential.expires_at && <span> · Expires: {new Date(credential.expires_at).toLocaleDateString()}</span>}
          </div>
          {credential.status === "pending" && onVerify && (
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onVerify(credential.id)}>
              <Check className="h-3 w-3 mr-1" /> Verify
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function CredentialVerifier({ onVerify }: { onVerify: (credentialId: string) => Promise<boolean> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Credential Verification</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Simulate verification of pending credentials. This checks the credential against the issuer's registry.
        </p>
        <div className="rounded-lg border p-4 bg-muted/30">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-primary" />
            <span>Verification checks:</span>
          </div>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            <li className="flex items-center gap-2"><Check className="h-3 w-3 text-emerald-500" /> Digital signature validation</li>
            <li className="flex items-center gap-2"><Check className="h-3 w-3 text-emerald-500" /> Issuer authority check</li>
            <li className="flex items-center gap-2"><Check className="h-3 w-3 text-emerald-500" /> Expiration date verification</li>
            <li className="flex items-center gap-2"><Check className="h-3 w-3 text-emerald-500" /> Revocation status check</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
