"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, ShieldOff, AlertTriangle, CheckCircle, XCircle, Lock, Eye, Key, Fingerprint, Repeat, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttackScenario {
  id: string;
  name: string;
  description: string;
  technique: string;
  severity: string;
  expectedResult?: string;
}

interface AttackResult {
  scenario: { id: string; name: string; description: string; technique: string; severity: string; expectedResult?: string };
  blocked: boolean;
  reason: string;
  detectionMethod: string;
  evidence: string;
  timestamp: string;
}

const SCENARIOS: AttackScenario[] = [
  { id: "spoofed-identity", name: "Identity Spoofing", description: "Agent A claims to be Agent B by using its DID name, but signs with its own key", technique: "DID name impersonation with mismatched signature key", severity: "critical", expectedResult: "DENIED — signature verification fails because public key doesn't match DID document" },
  { id: "revoked-credential", name: "Revoked Credential", description: "Agent presents a credential that was previously revoked after a policy violation", technique: "Presenting revoked VerifiableCredential", severity: "high", expectedResult: "DENIED — credential status check detects revocation" },
  { id: "expired-credential", name: "Expired Credential", description: "Agent presents a valid credential that has passed its expiration date", technique: "Expired VerifiableCredential with valid signature", severity: "medium", expectedResult: "DENIED — expiration date check fails" },
  { id: "tampered-credential", name: "Credential Tampering", description: "Agent modifies the claims in a valid credential to gain elevated permissions", technique: "Altered credentialSubject while keeping original proof", severity: "critical", expectedResult: "DENIED — signature no longer matches modified payload" },
  { id: "replay-attack", name: "Credential Replay", description: "Agent intercepts and replays a valid credential issued to a different agent", technique: "Replaying VerifiableCredential with different subject DID", severity: "critical", expectedResult: "DENIED — subject DID in credential doesn't match presenting agent" },
];

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
};

const SCENARIO_ICONS: Record<string, any> = {
  "spoofed-identity": Fingerprint,
  "revoked-credential": ShieldOff,
  "expired-credential": AlertTriangle,
  "tampered-credential": Eye,
  "replay-attack": Repeat,
};

export default function AttackSimulatorPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<AttackResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [allResults, setAllResults] = useState<AttackResult[]>([]);

  const runAttack = async (scenarioId: string) => {
    setSelected(scenarioId);
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/trust/attack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId }),
      });
      const data = await res.json();
      setResult(data.result);
      setAllResults(prev => [...prev.filter(r => r.scenario.id !== scenarioId), data.result]);
    } finally {
      setLoading(false);
    }
  };

  const runAllAttacks = async () => {
    setAllResults([]);
    for (const s of SCENARIOS) {
      await runAttack(s.id);
      await new Promise(r => setTimeout(r, 500));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attack Simulator</h1>
          <p className="text-muted-foreground mt-1">See how TrustLayer catches malicious and spoofed agents</p>
        </div>
        <Button onClick={runAllAttacks} variant="outline" disabled={loading}>
          Run All Attacks
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Attack Scenarios</h3>
          {SCENARIOS.map(scenario => {
            const Icon = SCENARIO_ICONS[scenario.id] || Shield;
            const r = allResults.find(r => r.scenario.id === scenario.id);
            return (
              <Card
                key={scenario.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  selected === scenario.id && "ring-2 ring-primary",
                  r && !r.blocked && "border-red-500/50 bg-red-500/5"
                )}
                onClick={() => runAttack(scenario.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", SEVERITY_COLORS[scenario.severity])}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{scenario.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{scenario.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={scenario.severity === "critical" ? "destructive" : scenario.severity === "high" ? "warning" : "secondary"} className="text-[10px]">
                          {scenario.severity.toUpperCase()}
                        </Badge>
                        {r && (
                          <Badge variant={r.blocked ? "success" : "destructive"} className="text-[10px]">
                            {r.blocked ? "BLOCKED" : "MISSED"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {loading && (
            <Card>
              <CardContent className="p-8 flex flex-col items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mb-4" />
                <p className="text-sm text-muted-foreground">Executing attack simulation...</p>
              </CardContent>
            </Card>
          )}

          {result && (
            <>
              <Card className={cn("border-2", result.blocked ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5")}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    {result.blocked
                      ? <CheckCircle className="h-12 w-12 text-emerald-500" />
                      : <XCircle className="h-12 w-12 text-red-500" />
                    }
                    <div>
                      <h2 className={cn("text-2xl font-bold", result.blocked ? "text-emerald-500" : "text-red-500")}>
                        {result.blocked ? "ATTACK BLOCKED" : "ATTACK SUCCESSFUL"}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">{result.reason}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle className="text-sm">Attack Details</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div><span className="text-xs text-muted-foreground">Technique:</span><p className="text-sm">{result.scenario.technique}</p></div>
                    <div><span className="text-xs text-muted-foreground">Severity:</span>
                      <Badge className="ml-2" variant={result.scenario.severity === "critical" ? "destructive" : result.scenario.severity === "high" ? "warning" : "secondary"}>
                        {result.scenario.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <div><span className="text-xs text-muted-foreground">Expected:</span><p className="text-sm">{result.scenario.expectedResult}</p></div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-sm">Detection</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div><span className="text-xs text-muted-foreground">Detection Method:</span><p className="text-sm">{result.detectionMethod}</p></div>
                    <div><span className="text-xs text-muted-foreground">Evidence:</span><p className="text-sm font-mono text-xs break-all">{result.evidence}</p></div>
                    <div><span className="text-xs text-muted-foreground">Timestamp:</span><p className="text-sm">{new Date(result.timestamp).toLocaleString()}</p></div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {!loading && !result && (
            <Card>
              <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                <Shield className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select an Attack Scenario</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Choose an attack scenario from the left panel to see how TrustLayer's
                  cryptographic verification catches malicious agents.
                </p>
              </CardContent>
            </Card>
          )}

          {allResults.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Results Summary</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {allResults.map(r => (
                    <div key={r.scenario.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-2">
                        {r.blocked ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                        <span className="text-sm font-medium">{r.scenario.name}</span>
                      </div>
                      <Badge variant={r.blocked ? "success" : "destructive"}>
                        {r.blocked ? "BLOCKED" : "MISSED"}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <span className="text-sm font-medium">Defense Rate</span>
                  <span className="text-lg font-bold text-emerald-500">
                    {((allResults.filter(r => r.blocked).length / allResults.length) * 100).toFixed(0)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
