"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Shield, Clock } from "lucide-react";

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    description: string;
    owner: string;
    version: string;
    status: string;
    capabilities: string[];
    trust_score: number;
    created_at: string;
  };
  onClick?: () => void;
}

export function AgentCard({ agent, onClick }: AgentCardProps) {
  const initials = agent.name.slice(0, 2).toUpperCase();
  const trustColor = agent.trust_score >= 80 ? "bg-emerald-500" : agent.trust_score >= 60 ? "bg-yellow-500" : agent.trust_score >= 40 ? "bg-orange-500" : "bg-red-500";
  const statusColor = agent.status === "active" ? "bg-emerald-500" : agent.status === "inactive" ? "bg-gray-500" : agent.status === "suspended" ? "bg-red-500" : "bg-yellow-500";

  return (
    <Card className={cn("cursor-pointer transition-all hover:shadow-lg hover:border-primary/50", onClick ? "cursor-pointer" : "")} onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border">
              <AvatarFallback className="bg-primary/10 text-primary text-sm">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{agent.name}</CardTitle>
              <CardDescription className="text-xs">{agent.owner} · v{agent.version}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn("h-2 w-2 rounded-full", statusColor)} />
            <Badge variant={agent.status === "active" ? "success" : agent.status === "inactive" ? "secondary" : agent.status === "suspended" ? "destructive" : "warning"}>
              {agent.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground line-clamp-2">{agent.description}</p>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">Trust Score</span>
            <span className={cn("text-xs font-bold", agent.trust_score >= 80 ? "text-emerald-500" : agent.trust_score >= 60 ? "text-yellow-500" : agent.trust_score >= 40 ? "text-orange-500" : "text-red-500")}>
              {agent.trust_score.toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div className={cn("h-full rounded-full transition-all", trustColor)} style={{ width: `${agent.trust_score}%` }} />
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {agent.capabilities?.map((cap) => (
            <Badge key={cap} variant="outline" className="text-[10px]">{cap}</Badge>
          ))}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Created {new Date(agent.created_at).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
