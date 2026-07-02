"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn, getTrustColor, getTrustLabel } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrustScoreCardProps {
  agentName: string;
  score: number;
  trend?: string;
}

export function TrustScoreCard({ agentName, score, trend }: TrustScoreCardProps) {
  const label = getTrustLabel(score);
  const color = getTrustColor(score);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Trust Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <span className={cn("text-3xl font-bold", color)}>{score.toFixed(0)}</span>
            <span className="text-sm text-muted-foreground ml-1">/100</span>
            <p className={cn("text-sm font-medium mt-1", color)}>{label}</p>
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-sm">
              {trend.startsWith("+") ? <TrendingUp className="h-4 w-4 text-emerald-500" />
                : trend.startsWith("-") ? <TrendingDown className="h-4 w-4 text-red-500" />
                : <Minus className="h-4 w-4 text-muted-foreground" />}
              <span className={cn(
                trend.startsWith("+") && "text-emerald-500",
                trend.startsWith("-") && "text-red-500",
                trend === "0" && "text-muted-foreground"
              )}>{trend}</span>
            </div>
          )}
        </div>
        <div className="mt-3">
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div className={cn("h-full rounded-full transition-all", score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-yellow-500" : score >= 40 ? "bg-orange-500" : "bg-red-500")}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ReputationTimeline({ events }: { events: { event_type: string; score_delta: number; description: string; created_at: string }[] }) {
  return (
    <div className="space-y-3">
      {events.map((event, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className={cn(
            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
            event.score_delta > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
          )}>
            {event.score_delta > 0 ? "+" : ""}{event.score_delta}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium capitalize">{event.event_type.replace(/_/g, " ")}</p>
            <p className="text-xs text-muted-foreground truncate">{event.description}</p>
          </div>
          <span className="text-xs text-muted-foreground shrink-0">{new Date(event.created_at).toLocaleDateString()}</span>
        </div>
      ))}
      {events.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">No reputation events</p>
      )}
    </div>
  );
}
