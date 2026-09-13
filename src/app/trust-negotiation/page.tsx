"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, CheckCircle, XCircle, AlertTriangle, Shield, Key, User, Scale, Zap, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlowStep {
  step: number;
  action: string;
  icon: string;
}

interface NegotiationResult {
  decision: string;
  confidence: number;
  factors: { name: string; weight: number; score: number; status: string; details: string }[];
  explanation: string;
}

interface NegotiationResponse {
  negotiation: NegotiationResult;
  requestor: { did: string; name: string; publicKey: string; credentials: { type: string; status: string }[] };
  owner: { did: string; name: string; publicKey: string };
  flow: FlowStep[];
}

const ACTIONS = ["read", "write", "execute", "deploy", "transfer", "admin"];
const RESOURCES = ["database", "filesystem", "api", "payments", "production", "secrets"];

export default function TrustNegotiationPage() {
  const [action, setAction] = useState("read");
  const [resource, setResource] = useState("database");
  const [result, setResult] = useState<NegotiationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  const runNegotiation = async () => {
    setLoading(true);
    setResult(null);
    setStep(0);

    // Animate steps
    for (let i = 0; i < 4; i++) {
      await new Promise(r => setTimeout(r, 600));
      setStep(i + 1);
    }

    try {
      const res = await fetch("/api/trust/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, resource }),
      });
      const data = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  const getDecisionIcon = (d: string) => {
    if (d === "ALLOW") return <CheckCircle className="h-10 w-10 text-emerald-500" />;
    if (d === "DENY") return <XCircle className="h-10 w-10 text-red-500" />;
    return <AlertTriangle className="h-10 w-10 text-yellow-500" />;
  };

  const getDecisionColor = (d: string) => {
    if (d === "ALLOW") return "border-emerald-500/30 bg-emerald-500/5";
    if (d === "DENY") return "border-red-500/30 bg-red-500/5";
    return "border-yellow-500/30 bg-yellow-500/5";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trust Negotiation Demo</h1>
        <p className="text-muted-foreground mt-1">Watch two agents negotiate trust in real-time with cryptographic verification</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4" /> Configure Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Action</label>
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ACTIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Resource</label>
                <Select value={resource} onValueChange={setResource}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RESOURCES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={runNegotiation} disabled={loading}>
                {loading ? "Negotiating..." : "Start Trust Negotiation"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2"><Lock className="h-4 w-4" /> How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">1</span>
                <p>RequestorAgent presents its DID and signed credentials</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">2</span>
                <p>OwnerAgent verifies each credential's cryptographic signature</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">3</span>
                <p>Trust engine evaluates 5 weighted factors</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">4</span>
                <p>Signed decision returned with full explanation</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {loading && (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={cn("flex items-center gap-3 p-3 rounded-lg transition-all duration-500", step >= i ? "bg-primary/5 border border-primary/20" : "opacity-30")}>
                      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold", step >= i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                        {step > i ? "✓" : i}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {i === 1 && "RequestorAgent presents DID and credentials"}
                          {i === 2 && "OwnerAgent verifies credential signatures"}
                          {i === 3 && "Trust engine evaluates identity, credentials, reputation, policy, risk"}
                          {i === 4 && "Decision rendered with cryptographic signature"}
                        </p>
                      </div>
                      {step >= i && <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {result && (
            <>
              <Card className={cn("border-2", getDecisionColor(result.negotiation.decision))}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    {getDecisionIcon(result.negotiation.decision)}
                    <div>
                      <h2 className={cn("text-2xl font-bold", result.negotiation.decision === "ALLOW" ? "text-emerald-500" : result.negotiation.decision === "DENY" ? "text-red-500" : "text-yellow-500")}>
                        {result.negotiation.decision.replace(/_/g, " ")}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">{result.negotiation.explanation}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-2xl font-bold">{(result.negotiation.confidence * 100).toFixed(0)}%</p>
                      <p className="text-xs text-muted-foreground">confidence</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle className="text-sm flex items-center gap-2"><User className="h-4 w-4" /> Requestor</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-xs font-mono break-all">{result.requestor.did}</p>
                    <div className="flex flex-wrap gap-1">
                      {result.requestor.credentials.map((c, i) => (
                        <Badge key={i} variant={c.status === "active" ? "success" : "secondary"} className="text-[10px]">{c.type}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">Key: {result.requestor.publicKey.slice(0, 32)}...</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4" /> Resource Owner</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-xs font-mono break-all">{result.owner.did}</p>
                    <p className="text-xs text-muted-foreground">Key: {result.owner.publicKey.slice(0, 32)}...</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Scale className="h-4 w-4" /> Factor Analysis</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {result.negotiation.factors.map((f, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{f.name} <span className="text-muted-foreground">({f.weight}%)</span></span>
                        <span className={cn("font-bold", f.status === "pass" ? "text-emerald-500" : f.status === "warning" ? "text-yellow-500" : "text-red-500")}>
                          {f.score}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all duration-700", f.status === "pass" ? "bg-emerald-500" : f.status === "warning" ? "bg-yellow-500" : "bg-red-500")} style={{ width: `${f.score}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground">{f.details}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
