"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Scale, CheckCircle, XCircle, AlertTriangle, Shield, ArrowRight } from "lucide-react";
import type { TrustEvaluation, TrustFactor } from "@/types";

interface TrustEvaluatorProps {
  agents: { id: string; name: string }[];
  onEvaluate: (agentId: string, action: string, resource: string) => Promise<TrustEvaluation>;
}

export function TrustEvaluator({ agents, onEvaluate }: TrustEvaluatorProps) {
  const [agentId, setAgentId] = useState("");
  const [action, setAction] = useState("read");
  const [resource, setResource] = useState("database");
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<TrustEvaluation | null>(null);

  const handleEvaluate = async () => {
    if (!agentId) return;
    setEvaluating(true);
    try {
      const res = await onEvaluate(agentId, action, resource);
      setResult(res);
    } finally {
      setEvaluating(false);
    }
  };

  const getResultIcon = () => {
    if (!result) return null;
    switch (result.decision) {
      case "ALLOW": return <CheckCircle className="h-12 w-12 text-emerald-500" />;
      case "DENY": return <XCircle className="h-12 w-12 text-red-500" />;
      case "REQUIRE_HUMAN_APPROVAL": return <AlertTriangle className="h-12 w-12 text-yellow-500" />;
    }
  };

  const getResultColor = () => {
    if (!result) return "";
    switch (result.decision) {
      case "ALLOW": return "border-emerald-500/30 bg-emerald-500/5";
      case "DENY": return "border-red-500/30 bg-red-500/5";
      case "REQUIRE_HUMAN_APPROVAL": return "border-yellow-500/30 bg-yellow-500/5";
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Scale className="h-5 w-5" /> Trust Evaluation
          </CardTitle>
          <CardDescription>Evaluate whether an agent can perform a specific action</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Agent</label>
            <Select value={agentId} onValueChange={setAgentId}>
              <SelectTrigger><SelectValue placeholder="Select an agent" /></SelectTrigger>
              <SelectContent>
                {agents.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Action</label>
              <Select value={action} onValueChange={setAction}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["read", "write", "execute", "delete", "deploy", "admin", "invoke", "transfer", "approve", "configure"].map(a => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Resource</label>
              <Select value={resource} onValueChange={setResource}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["database", "filesystem", "api", "network", "secrets", "config", "payments", "users", "logs", "pipeline"].map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="w-full" onClick={handleEvaluate} disabled={!agentId || evaluating}>
            {evaluating ? "Evaluating..." : "Evaluate Trust"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className={cn("border-2", getResultColor())}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Evaluation Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {getResultIcon()}
              <div>
                <h3 className={cn(
                  "text-xl font-bold",
                  result.decision === "ALLOW" ? "text-emerald-500" : result.decision === "DENY" ? "text-red-500" : "text-yellow-500"
                )}>{result.decision.replace(/_/g, " ")}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">Confidence:</span>
                  <span className="text-sm font-medium">{(result.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">{result.explanation}</p>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Risk Level:</span>
              <Badge variant={result.risk_level === "low" ? "success" : result.risk_level === "medium" ? "warning" : result.risk_level === "high" ? "warning" : "destructive"}>
                {result.risk_level.toUpperCase()}
              </Badge>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Factor Analysis</h4>
              {result.factors.map((factor, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{factor.name}</span>
                    <span className={cn(
                      "text-xs font-medium",
                      factor.status === "pass" ? "text-emerald-500" : factor.status === "warning" ? "text-yellow-500" : "text-red-500"
                    )}>{factor.score.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className={cn(
                      "h-full rounded-full",
                      factor.status === "pass" ? "bg-emerald-500" : factor.status === "warning" ? "bg-yellow-500" : "bg-red-500"
                    )} style={{ width: `${factor.score}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">{factor.details}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
