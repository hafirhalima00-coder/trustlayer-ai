"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrustEvaluator } from "@/components/trust/trust-evaluator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Scale, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrustEvaluation } from "@/types";

interface Agent { id: string; name: string; }
interface Decision { id: string; agent_name: string; action: string; resource: string; result: string; confidence: number; risk_level: string; created_at: string; }

export default function TrustDecisionPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/agents").then(r => r.json()),
      fetch("/api/trust").then(r => r.json()),
    ]).then(([agentsData, decisionsData]) => {
      setAgents(agentsData);
      setDecisions(decisionsData);
    }).finally(() => setLoading(false));
  }, []);

  const handleEvaluate = async (agentId: string, action: string, resource: string): Promise<TrustEvaluation> => {
    const res = await fetch("/api/trust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent_id: agentId, action, resource }),
    });
    const result = await res.json();
    // Refresh decisions
    fetch("/api/trust").then(r => r.json()).then(setDecisions);
    return result;
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case "ALLOW": return <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" />ALLOW</Badge>;
      case "DENY": return <Badge variant="danger"><XCircle className="h-3 w-3 mr-1" />DENY</Badge>;
      case "REQUIRE_HUMAN_APPROVAL": return <Badge variant="warning"><AlertTriangle className="h-3 w-3 mr-1" />HUMAN</Badge>;
      default: return <Badge>{result}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trust Decision Engine</h1>
          <p className="text-muted-foreground mt-1">Evaluate whether an AI agent can perform sensitive actions</p>
        </div>
      </div>

      <TrustEvaluator agents={agents} onEvaluate={handleEvaluate} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Scale className="h-4 w-4" /> Recent Decisions
            </CardTitle>
            <span className="text-xs text-muted-foreground">{decisions.length} total</span>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {decisions.slice(0, 20).map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.agent_name}</TableCell>
                    <TableCell><code className="rounded bg-muted px-1.5 py-0.5 text-xs">{d.action}</code></TableCell>
                    <TableCell><code className="rounded bg-muted px-1.5 py-0.5 text-xs">{d.resource}</code></TableCell>
                    <TableCell>{getResultBadge(d.result)}</TableCell>
                    <TableCell>{(d.confidence * 100).toFixed(0)}%</TableCell>
                    <TableCell>
                      <Badge variant={d.risk_level === "low" ? "success" : d.risk_level === "medium" ? "warning" : d.risk_level === "high" ? "warning" : "destructive"}>
                        {d.risk_level.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {decisions.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No decisions recorded yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
