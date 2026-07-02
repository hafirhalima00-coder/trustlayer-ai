"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ReputationTimeline } from "@/components/reputation/trust-score-card";
import { ReputationTrendsChart } from "@/components/analytics/analytics-charts";
import { Award, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Agent { id: string; name: string; trust_score: number; }

export default function ReputationPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reputationData, setReputationData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/agents").then(r => r.json()).then((data: Agent[]) => {
      setAgents(data);
      if (data.length > 0) setSelectedAgentId(data[0].id);
    });
    fetch("/api/reputation").then(r => r.json()).then(setReputationData);
  }, []);

  useEffect(() => {
    if (!selectedAgentId) return;
    setLoading(true);
    fetch(`/api/reputation/${selectedAgentId}`)
      .then(r => r.json())
      .then(data => {
        setEvents(data.events || []);
        setTrends(data.trends || []);
      })
      .finally(() => setLoading(false));
  }, [selectedAgentId]);

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reputation System</h1>
          <p className="text-muted-foreground mt-1">Track and analyze agent trust scores over time</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
          <SelectTrigger className="w-[250px]"><SelectValue placeholder="Select agent" /></SelectTrigger>
          <SelectContent>
            {agents.map(a => (
              <SelectItem key={a.id} value={a.id}>
                <span>{a.name} ({a.trust_score.toFixed(0)})</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-sm">Reputation Trends</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[250px]" /> : <ReputationTrendsChart data={trends} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="h-4 w-4" />
              {selectedAgent?.name || "Agent"} Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedAgent && (
              <div className="text-center">
                <div className={cn(
                  "text-5xl font-bold",
                  selectedAgent.trust_score >= 80 ? "text-emerald-500" : selectedAgent.trust_score >= 60 ? "text-yellow-500" : selectedAgent.trust_score >= 40 ? "text-orange-500" : "text-red-500"
                )}>{selectedAgent.trust_score.toFixed(0)}</div>
                <p className="text-sm text-muted-foreground mt-1">/ 100</p>
                <Badge className="mt-2" variant={selectedAgent.trust_score >= 80 ? "success" : selectedAgent.trust_score >= 60 ? "warning" : "destructive"}>
                  {selectedAgent.trust_score >= 80 ? "Trusted" : selectedAgent.trust_score >= 60 ? "Moderate" : selectedAgent.trust_score >= 40 ? "Low" : "Untrusted"}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Reputation Events</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-[200px]" /> : <ReputationTimeline events={events} />}
        </CardContent>
      </Card>
    </div>
  );
}
